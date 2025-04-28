import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { PoMenuItem, PoModalAction, PoModalComponent, PoPageAction, PoRadioGroupOption, PoStepperComponent, PoTableAction, PoTableColumn, PoTableComponent, PoNotificationService, PoDialogService, PoNotification, PoButtonComponent, PoLoadingModule, PoStepperModule, PoWidgetModule, PoDividerModule, PoFieldModule, PoIconModule, PoTableModule, PoButtonModule, PoTooltipModule, PoRadioGroupModule, PoModalModule } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service';
import { catchError, delay, elementAt, interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ExcelService } from '../../services/excel-service.service';
import { Usuario } from '../../interfaces/usuario';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { NgClass, NgIf } from '@angular/common';
import { environment } from '../../../environments/environment.prod';
import { RpwComponent } from '../rpw/rpw.component';


@Component({
    selector: 'app-calculo',
    templateUrl: './calculo.component.html',
    styleUrls: ['./calculo.component.css'],
    standalone: true,
    imports: [NgIf, 
      PoLoadingModule, 
      PoStepperModule, 
      PoWidgetModule, 
      PoDividerModule, 
      PoFieldModule, 
      FormsModule, 
      NgClass,
      PoIconModule, 
      PoTableModule, 
      PoButtonModule,
      PoTooltipModule, 
      BtnDownloadComponent, 
      PoRadioGroupModule, 
      PoModalModule,
      RpwComponent]
})
export class CalculoComponent {

//---------- Acessar a DOM
@ViewChild('gridDetalhe', { static: true }) gridDetalhe: PoTableComponent | undefined;
@ViewChild('gridExtrakit', { static: true }) gridExtraKit: PoTableComponent | undefined;
@ViewChild('detailsModal', { static: true }) detailsModal: PoModalComponent | undefined;
@ViewChild('loginModal', { static: true }) loginModal: PoModalComponent | undefined;
@ViewChild('stepper', { static: true }) stepper: PoStepperComponent | undefined;
@ViewChild('abrirArquivo', { static: true }) abrirArquivo: | PoModalComponent | undefined;
@ViewChild('timer', { static: true }) telaTimer: | PoModalComponent | undefined;

  


acaoImprimir: PoModalAction = {
  action: () => {
    this.onImprimirConteudoArquivo();
  },
  label: 'Gerar PDF',
};

acaoSair: PoModalAction = {
  action: () => {
    this.abrirArquivo?.close();
  },
  label: 'Sair',
};

//-------- Labels Stepper
lblStepProximo: string = 'Avançar';
lblStepAnterior: string = 'Voltar';
lblStepExecutar: string = 'Montar Resumo';

qtde=0

//------- Listas
alturaStepper:number=window.innerHeight - 155
alturaGrid:number=window.innerHeight - 295
listaEstabelecimentos!: any[]
listaTecnicos!: any[]
listaTransp!: any[]
listaEntrega!: any[]
listaExtraKit!: any[]
listaResumo!: any[]
listaSemSaldo!: any[]
listaOrdens!:any[]
listaAux!:any[]

//-------- Colunas Grid
colunasKit!: Array<PoTableColumn>

//--------- Variaveis Combobox
codEstabelecimento: string=''
codEstabelecimento_login: string=''
codTecnico: string=''
codTransEnt: string = ''
codTransSai: string = ''
codEntrega: string = ''
serieSaida: any='131'
serieEntra: any='12'
placeHolderEstabelecimento!: string
paramsEstab: any=[]

//Buttons
lBtnAprovar:boolean=false
lBtnAprovarSemE:boolean=false
lHideSearch:boolean=false

//-------- Variaveis RadioGroud
tipoCalculo: any;

//------ Login
codUsuario:string=''
senha:string=''
codUsuario_login:string=''
senha_login:string=''
usuarioLogado: boolean=false;
usuarioTecnico: any;

//----- Loadings
loadTela:boolean=false
loadLogin:boolean=false
loadExcel:boolean=false
labelLoadTela:string = ''
loadTecnico: string = ''
labelContadores:string[]=['0','0','0','0','0', '0', '0']

//------ Label de menu principal
tecnicoInfo: string = ""
estabInfo: string = ""
processoInfo: string = ""
colAux: number=0

//------ Informacoes Dialog Grids (Resumo)
colunasDetalhe: Array<PoTableColumn> = []
tituloDetalhe!: string
itemsDetalhe!: any[]
itemsResumo!: any[]

//------- Arquivo
conteudoArquivo: string = '';
mostrarInfo: boolean = false;
nomeArquivo: string = '';

urlInfoOs:string=''
arquivoInfoOS:string=''
listaArquivos!: any[]
numPedExec=signal(0)
tipoAprovacao:number=1 

//Labels botoes aprovacao
lblAprovar = ''
lblAprovarSemSaida = ''
lblOpcao=''
cRowId = ''

//------ Controle Tela
mostrarDetalhe:boolean=false

acaoLogin: PoModalAction = {
  action: () => {
    this.onLogarUsuario();
  },
  label: 'Login'
};


//--------- Opcoes de Menu
 readonly menus: Array<PoMenuItem> = [
  { label: 'Cálculo Auto Atendimento', icon: 'bi bi-calculator', link:'/'},
  { label: 'Dashboard Notas Fiscais', icon: 'po-icon-device-desktop', link:'/dashboard'}
];

//--------- Opcoes Page Dinamic (ExtraKit - Resumo)
readonly opcoesGridExtraKit: PoTableAction[] = [
  {label: '', icon: 'bi bi-trash', action: this.onDeletarRegistroExtraKit.bind(this)}
];

//--------- Opcoes Page Dinamic (ExtraKit - Resumo)
opcoesGridPagto: Array<any> = [
  {label: '', icon: 'bi bi-trash', action: this.onDeletarRegistroPagto.bind(this)}
];

//--------- Opcoes de Calculo (Resumo)
readonly options: Array<PoRadioGroupOption> = [
  { label: 'Renovação Total', value: '1' },
  { label: 'Renovação Parcial', value: '2' },
  { label: 'Devolução ExtraKit', value: '3' }
];

private sub!: Subscription;



readonly acaoLogar: PoModalAction = {
  action: () => { this.onLogarUsuario()}, label: 'Login' };

  readonly acaoDetalhe: PoPageAction = {
    action: () => { this.mostrarDetalhe=false}, label: 'Fechar'}

  


//------------------------------------------------------------------------------------- Constructor
  constructor(){}

  //----------------------------------------------------------------------------------- Injecao de Dependencia
 
  private srvTotvs = inject(TotvsService)
  private srvTotvs46 = inject(TotvsService46)
  private srvExcel = inject(ExcelService)
  private srvNotification = inject (PoNotificationService)
  private srvDialog = inject(PoDialogService)
  //private cdRef = inject(ChangeDetectorRef)

  onSair(){
    
  }

  //----------------------------------------------------------------------------------- Inicializar
  ngOnInit(): void {

    //--- Titulo Tela
    this.srvTotvs.EmitirParametros({tituloTela: 'HTMLA41 - PARÂMETROS DE CÁLCULO'})

    //--- Evento de Logout
    this.sub = this.srvTotvs46.VerificarLogout().subscribe({
      next: (response: any) => {
        this.stepper?.first()
        this.srvNotification.success("Processo foi desbloqueado com sucesso!")
      },
    });
  

    //--- Login Unico
    this.srvTotvs.ObterUsuario().subscribe({
      next:(response:Usuario)=>{
        console.log("usuario", response)
        if (response === undefined){
          this.srvTotvs.EmitirParametros({estabInfo:''})
        }
        else{
          this.codEstabelecimento = response.codEstabelecimento
          this.codUsuario = response.codUsuario
          this.processoInfo  = response.nrProcesso
          
      }}})

    //--- Tempo padrao notificacao
    this.srvNotification.setDefaultDuration(3000)

    //--- Parametros iniciais da tela
    this.loadTela = false
    this.arquivoInfoOS = ''
    this.tipoCalculo = '2'
    this.colunasKit = this.srvTotvs.obterColunasSaldoTerc()

    //--- Carregar combo de estabelecimentos
    this.placeHolderEstabelecimento = 'Aguarde, carregando lista...'
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
          this.listaEstabelecimentos = (response as any[]).sort(this.ordenarCampos(['label']))
          this.placeHolderEstabelecimento = 'Selecione um estabelecimento'
      },
      error: (e) => {return}
    })

    //--- Carregar combo transportadoras
    this.srvTotvs
      .ObterTransportadoras().subscribe({
        next:(response:any)=>{
          this.listaTransp = (response as any[]).sort(this.ordenarCampos(['label']))
        },
        //error: (e) => this.srvNotification.error('Ocorreu um erro na requisição'),
    })

    //this.cdRef.detectChanges()
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  //-------------------------------------------------------- Metodos

    //------- Stepper
    canActiveNextStep(passo: any) {

      //---------------- Consistir Passo 1
      if ((passo.label === "Técnico") && ((this.codEstabelecimento === '') || (this.codTecnico === ''))){
        this.arquivoInfoOS = ''
        this.srvNotification.error('Estabelecimento e Ténico não foram preenchidos corretamente');

       // let msg = (document.querySelector('po-toaster') as HTMLInputElement)
       // setTimeout(() => { msg.parentNode?.removeChild(msg) }, 5000)
      
        return false;
      }


      //------------- Passo 1 - OK (Atualizar informacoes de tela)
      if ((passo.label === "Técnico") && (this.codEstabelecimento !== '') && (this.codTecnico !== '')){

        this.loadTela=true
        this.labelLoadTela="Obtendo campos estab"

         //Atualizar informações do Técnico e Estabelecimento
         let estab = this.listaEstabelecimentos.find(o => o.value === this.codEstabelecimento)
         let tec = this.listaTecnicos.find(o => o.value === this.codTecnico)

         //Obter as informacoes do Processo
         let paramsTec:any = {codEstabel: this.codEstabelecimento, codTecnico: this.codTecnico}

          //Chamar o mesmo método da tela do Informe porem passando a origem como Calculo
          let params:any={codEstabel: this.codEstabelecimento, codUsuario: this.codTecnico, senha: 'moto', origem:'calculo'}
          this.srvTotvs46.ObterDadosMobile(params).subscribe({
            next: (response: any) => {
              /*  Rotina substituida pelo junin
              if(response.ordens !== undefined){
                  this.listaOrdens = response.ordens
                }
                  */

                if (response.cRowId !== undefined){
                  this.cRowId = response.cRowId;
                }

                this.srvTotvs.ObterNrProcesso(paramsTec).subscribe({
                  next: (response: any) => {
                    this.processoInfo = response.nrProcesso
                    //Setar usuario
                    this.srvTotvs.SetarUsuario(this.codEstabelecimento, this.codTecnico, response.nrProcesso)
                    //Atualizar Informacoes Tela
                    this.srvTotvs.EmitirParametros({estabInfo: estab.label, tecInfo: tec.label, processoInfo:response.nrProcesso, processoSituacao: response.situacaoProcesso})

                   // this.arquivoInfoOS = `InfOS-${this.codEstabelecimento}-${this.codTecnico}-${this.processoInfo.toString().padStart(8,'0')}.tmp`
                   // this.urlInfoOs = environment.totvs_spool + this.arquivoInfoOS

                    //Arquivo Gerado
                    let params:any={nrProcess: response.nrProcesso, situacao:'IOS'}
                    this.srvTotvs46.ObterArquivo(params).subscribe({
                      next:(item:any)=>{
                        if (item === null) return 
                        this.arquivoInfoOS = item.items[0].nomeArquivo
                      }
                    })
      
                    this.loadTela=false
                  },
                 error: (e) => { }
                })
            },
          error:(e)=>{

               this.stepper?.first()
               this.loadTela=false
          }})
        

         //Setar Valores Padrao
         this.srvTotvs
          .ObterParamsDoEstabelecimento(estab.value)
          .subscribe({
            next: (response:any) => {
              if(response === null) {
                this.srvNotification.error("Cadastro para filial não encontrado ! Verifique os Parâmetros da Filial" )
                this.stepper?.first()
              }
              
                this.paramsEstab = response !== null ? response.items[0]: null
                if (this.paramsEstab !== null){
                  this.codTransEnt = this.paramsEstab.codTranspEntra
                  this.codTransSai = this.paramsEstab.codTranspSai
                 // this.codEntrega = this.paramsEstab.codEntrega
                  this.serieSaida = this.paramsEstab.serieSai
                  this.serieEntra = this.paramsEstab.serieEntra
                
                }
            },
            //error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
          }); 
      }

      //---------------Passo - ExtraKit - Carregar lista extrakit
      if (passo.label === "Dados NF") {
        this.gerarListaExtrakit()

        /* setTimeout(() => {
          this.SelecionarTodosExtraKit()
        }, 2000
        ) */
        
      }

      //---------------Passo - Resumo
      if ((passo.label === "ExtraKit") && (!this.usuarioLogado)){
       /*  if ((environment.totvs_header as any)["CompanyId"] === undefined){
          this.codUsuario="1888"
          this.senha="guigui"
        }
        else{ */
          this.codUsuario=''
          this.senha=''
        //}
        this.loginModal?.open()
        return false
      }
      return true;
    }

  //--------------- onChange do RadioGroud Tipo de Calculo
  onTipoCalculo(event: any) {
    this.lblOpcao = this.options[Number(event-1)].label.toUpperCase()
    this.lblAprovar = 'Aprovar - ' + this.lblOpcao
    this.lblAprovarSemSaida = 'Aprovar Sem Saída - ' + this.lblOpcao

    this.tipoCalculo = event

    this.lBtnAprovar = false
    this.lBtnAprovarSemE = false

    //TOTAL
    if (this.listaResumo.length > 0){
       if (event === "1" )
          this.itemsResumo = this.listaResumo

        //PARCIAL
        else if (event === "2"){
           this.itemsResumo = this.listaResumo.filter(o => (o.qtPagar > 0 && !o.soEntrada) || (o.soEntrada) || (o.qtRenovar > 0 && o.temPagto) || (o.qtExtrakit > 0 && o.temPagto))
           //Regra: Se Renovacao possuir qtdes desabilitar o botao Aprovar Sem Saida 
           this.itemsResumo.forEach(item => {
              if (item.qtRenovar > 0){
                this.lBtnAprovarSemE = true
              }})
        }

        //DEVOLUCAO EXTRAKIT
        else {
          this.itemsResumo = this.listaResumo.filter(o => o.soEntrada)

          this.itemsResumo.forEach(item=> {
              if (item.tipo === "Kit"){ 
                 if (this.lBtnAprovar === false){
                   this.srvNotification.error("Existe OS Informada para Nota Fiscal de Kit. Usar as opções Renovação Total ou Renovação Parcial") 
                   this.lBtnAprovar = true
                   this.lBtnAprovarSemE = true
                   }
               }
            })
        }

    }
    this.AtualizarLabelsContadores()
  }

  //------------------------------------------------ Label Contadores Resumo
  private AtualizarLabelsContadores(){
    

      //Geral -> Extrakit
      this.qtde=0
      this.gridExtraKit?.getUnselectedRows().forEach(x=> this.qtde += x.qtSaldo)
      this.labelContadores[6] = this.qtde.toString()

      //Geral
      this.itemsResumo.filter(o => !o.soEntrada).forEach(x=> {this.qtde += x.qtPagar + x.qtRenovar + x.qtExtrakit})
      this.labelContadores[0] = this.qtde.toString()

      //Pagamento
      this.qtde=0
      this.itemsResumo.filter(o => o.qtPagar > 0 && !o.soEntrada).forEach(x=> {this.qtde += x.qtPagar + x.qtExtrakit})
      this.labelContadores[1] = this.qtde.toString()
      

      //Renovacoes
      this.qtde=0
      this.itemsResumo.filter(o => o.qtRenovar > 0).forEach(x=> {this.qtde += x.qtRenovar})
      this.labelContadores[2] = this.qtde.toString()

      //Somente Entrada
      this.qtde=0
      this.itemsResumo.filter(o => o.soEntrada).forEach(x=> {this.qtde += x.qtPagar + x.qtRuim})
      this.labelContadores[3] = this.qtde.toString()

      //Extrakit
      this.qtde=0
      this.itemsResumo.filter(o => o.qtExtrakit > 0).forEach(x=> {this.qtde += x.qtExtrakit})
      this.labelContadores[4] = this.qtde.toString()

      //Sem saldo
      this.qtde=0
      this.listaSemSaldo.forEach(x=> {this.qtde += x.qtPagar})
      this.labelContadores[5] = this.qtde.toString()
  }

  //-------------------------------------------------- Login
  public onLogarUsuario() {

    //Fechar a tela de login
    this.loginModal?.close()

     //Montar Resumo
     this.labelLoadTela = "Preparando Resumo"
     this.loadTela = true

    //Parametros usuario e senha
    let paramsLogin: any = { NrProcess: this.processoInfo, CodEstabel: this.codEstabelecimento, CodUsuario: this.codUsuario, Senha: this.senha}
    //Chamar servico de login
    this.srvTotvs.LoginAlmoxarifado(paramsLogin).subscribe({
      next: (response: any) => {
           if(response.senhaValida){

              //Parametros para calculo
              let listaET = this.gridExtraKit?.getSelectedRows()
              let paramsE: any = { CodEstab: this.codEstabelecimento, CodTecnico: this.codTecnico, NrProcess: this.processoInfo, Extrakit: listaET }
              this.srvTotvs.PrepararResumo(paramsE).subscribe({
                next: (response:any) => {

                    if (response !== null && (response.items as any[]).length > 0){
                     
                      //Obter as listas da requisicao
                      this.listaResumo = response.items
                      this.listaSemSaldo = response.semsaldo
                      //Setar Tela para Renovacao Total
                      this.onTipoCalculo("2")
                      //Atualizar Contadores Resumo
                      this.AtualizarLabelsContadores()
                      //Setar que usuario foi logado
                      this.usuarioLogado=true
                      //Ir para o proximo passo - Resumo
                      this.stepper?.next()
                    }
                    else
                    {
                      this.srvNotification.error("Técnico não possui saldo de terceiro para cálculo ")
                      this.stepper?.first()
                      return
                    }

                },
                error: (e) => {
                   // this.srvNotification.error("Ocorreu um erro na requisição " )
                    this.usuarioLogado = false;
                },
                complete: () => {
                      this.loadTela = false
                      this.loadLogin = false
                      this.usuarioLogado = false;
                }
              });
           }
           else
           {
               this.srvNotification.error("Erro na validação do usuário:"  + response.mensagem)
               this.loadLogin = false;
               this.loadTela = false
           }
      },
      //error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
      complete: () => { this.loadLogin=false ; this.usuarioLogado = false}
    })
  }

  //--------------------------------------------------------------- Obter Extrakit
  gerarListaExtrakit(){
        this.labelLoadTela = "Obtendo ExtraKit"
        this.loadTela = true
        //Parametros estabelecimento e tecnico
        let paramsE: any = { CodEstab: this.codEstabelecimento, CodTecnico: this.codTecnico, NrProcess: this.processoInfo }
        //Chamar servico
        this.srvTotvs.ObterExtraKit(paramsE).subscribe({
        next:(response:any) => {
            this.listaExtraKit = response.items ?? []
            
        },
        error: (e) => {
              return false
        },
        complete: () => { this.loadTela = false 
        }
        });

  }

  //------------------------------------------------------------ Change Estabelecimentos - Popular técnicos
  public onEstabChange(obj: string) {
    if (obj === undefined) return

    //Popular o Combo do Emitente
    this.listaTecnicos = []
    this.listaExtraKit = []
    this.codTecnico= ''
    this.listaTecnicos.length = 0;
    this.loadTecnico = `Populando técnicos do estab ${obj} ...`


    this.srvTotvs
      .ObterEmitentesDoEstabelecimento(obj)
      .subscribe({
        next: (response:any) => {
            delay(200)
           
            this.listaTecnicos = response
            this.loadTecnico = 'Selecione o técnico'
        },
       // error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
      });

     
  }

  //------------------------------------------------------------- Change Tecnicos - Popular Endereco Entrega
  public onTecnicoChange(obj:string){
    if (obj === undefined) return
    

    //Parametros estabelecimento e tecnico
    let params: any = { codEstabel: this.codEstabelecimento, codTecnico: this.codTecnico }
    //Popular combos entrega
    this.srvTotvs
      .ObterEntrega(params).subscribe({
        next:(response:any)=>{

          this.listaExtraKit = []
          this.processoInfo = response.nrProcesso
          this.srvTotvs.EmitirParametros({processoInfo: this.processoInfo})
          this.listaEntrega = (response.listaEntrega as any[]).sort(this.ordenarCampos(['label']))
          this.codEntrega = ''

          //Setar Valores Padrao
          this.srvTotvs
          .ObterParamsDoEstabelecimento(this.codEstabelecimento).subscribe({
            next: (response:any) => {
              if (response !== null){
                this.codEntrega = response.items[0].codEntrega
              }
            },
          })

        },
        //error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
    })

    
  }

  //------ funcao para ordenar
  //Utilize o - (menos) para indicar ordenacao descendente
  ordenarCampos = (fields: any[]) => (a: { [x: string]: number; }, b: { [x: string]: number; }) => fields.map(o => {
    let dir = 1;
    if (o[0] === '-') { dir = -1; o=o.substring(1); }
    return a[o] > b[o] ? dir : a[o] < b[o] ? -(dir) : 0;
    }).reduce((p, n) => p ? p : n, 0);

  //limpar filtro
  limparFiltro(){
    setTimeout(() => {
      let filtro = (document.querySelector('.po-search-input') as HTMLInputElement)
      if(filtro !== null && filtro !== undefined)
          filtro.value = ''
      
    }, 500);

  }  

  //--------------------------------------------------------------- Chamar Modal Detalhe Resumo
  onOpenModal(type: any) {
    
 
    switch (type) {
      case 'VisaoGeral':
          
          let visaoResumo = this.itemsResumo.filter(o => !o.soEntrada)
          let extraKit = this.gridExtraKit?.getUnselectedRows().map(item=> (
            {itCodigo:item.itCodigo, 
            itPrincipal:item.itCodigo,
            tipo: item.tipo, 
            descItem:item.descItem, 
            qtPagar:0, 
            qtRenovar:0, 
            qtRuim:item.qtRuim,
            qtSaldo:item.qtSaldo,
            qtExtrakit:item.qtSaldo, 
            notaAnt:item.nroDocto}))
      
          this.itemsDetalhe = [...visaoResumo, ...extraKit!].filter(o => !o.soEntrada).sort(this.ordenarCampos(['-qtSaldo','itCodigo']))
          this.qtde = 0; this.itemsDetalhe.forEach(x=> {this.qtde += x.qtPagar + x.qtRenovar + x.qtExtrakit})
          this.tituloDetalhe = `Visão Geral: ${this.qtde} registros`
          this.colunasDetalhe = this.srvTotvs.obterColunasTodos()
          //this.mostrarDetalhe = true
          this.opcoesGridPagto = []
          this.limparFiltro()

          this.detailsModal?.open();
        break;

        case 'Pagamentos':
          this.itemsDetalhe = this.itemsResumo.filter(o => o.qtPagar > 0 && !o.soEntrada).sort(this.ordenarCampos(['-qtSaldo','itCodigo']))
          this.qtde = 0; this.itemsDetalhe.forEach(x=> {this.qtde += x.qtPagar})
          this.tituloDetalhe = `Pagamentos: ${this.qtde} registros`
          this.colunasDetalhe = this.srvTotvs.obterColunasPagar()
          //this.mostrarDetalhe = true
          this.opcoesGridPagto = [{label: '', icon: 'po-icon po-icon po-icon-delete', action: this.onDeletarRegistroPagto.bind(this)} ]
          this.limparFiltro()
          this.detailsModal?.open();
        break;

        case 'Renovacao':
          this.itemsDetalhe = this.itemsResumo.filter(o => o.qtRenovar > 0).sort(this.ordenarCampos(['-qtSaldo','itCodigo']))
          this.qtde = 0; this.itemsDetalhe.forEach(x=> {this.qtde += x.qtRenovar})
          this.tituloDetalhe = `Renovações: ${this.qtde} registros`
          this.colunasDetalhe = this.srvTotvs.obterColunasRenovar();
          //this.mostrarDetalhe=true
          this.limparFiltro()
          this.detailsModal?.open();
          this.opcoesGridPagto = []
        break;

        case 'SomenteEntrada':
          this.itemsDetalhe = this.itemsResumo.filter(o => o.soEntrada).sort(this.ordenarCampos(['-qtSaldo','itCodigo']))
          this.qtde = 0; this.itemsDetalhe.forEach(x=> {this.qtde += x.qtPagar + x.qtRuim})
          this.tituloDetalhe = `Somente Entrada: ${this.qtde} registros`
          this.colunasDetalhe = this.srvTotvs.obterColunasSomenteEntrada();
          //this.mostrarDetalhe=true
          this.limparFiltro()
          this.detailsModal?.open();
          this.opcoesGridPagto = []

          this.itemsResumo.sort(this.srvTotvs.ordenarCampos(['-qtSaldo','itCodigo']))
        break;

        case 'ExtraKit':
          this.itemsDetalhe = this.itemsResumo.filter(o => o.qtExtrakit > 0).sort(this.ordenarCampos(['-qtSaldo','itCodigo']))
          this.qtde = 0; this.itemsDetalhe.forEach(x=> {this.qtde += x.qtExtrakit})
          this.tituloDetalhe = `ExtraKit: ${this.qtde} registros`
          this.colunasDetalhe = this.srvTotvs.obterColunasExtrakit();
          //this.mostrarDetalhe=true
          this.limparFiltro()
          this.detailsModal?.open();
          this.opcoesGridPagto = []
        break;

        case 'SemSaldo':
          this.itemsDetalhe = this.listaSemSaldo.sort(this.ordenarCampos(['-qtSaldo','itCodigo']))
          this.qtde = 0; this.itemsDetalhe.forEach(x => {this.qtde += x.qtPagar})
          this.tituloDetalhe = `Sem Saldo: ${this.qtde} registros`
          this.colunasDetalhe = this.srvTotvs.obterColunasSemSaldo()
          //this.mostrarDetalhe=true
          this.limparFiltro()
          this.detailsModal?.open();
          this.opcoesGridPagto = []
        break;

    }

  }

  //---------------------------------------------------------------- Eliminar registro grid extrakit
  public onDeletarRegistroExtraKit(obj:any){

    this.srvDialog.confirm({
      title: 'ELIMINAR REGISTRO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA ELIMINAR REGISTRO ?</span></div>",
      literals: {"cancel": "Não", "confirm": "Sim"},
      confirm: () => {
        //Encontrar o indice da linha a ser excluida
        let index = this.listaExtraKit.findIndex(o=>o.rRowId === obj.rRowId)
        this.listaExtraKit.splice(index, 1);

        //Atualizar a lista para refresh de tela
        this.listaExtraKit = [...this.listaExtraKit]
        this.srvNotification.success("Registro eliminados com sucesso !")
      },
      cancel:  () => { }
    })


  }

  onSelecionarRegistro(obj:any){
  }

  SelecionarTodosExtraKit(){
    this.gridExtraKit?.items.forEach(item=> this.gridExtraKit?.selectRowItem(item))
  }

  //---------------------------------------------------------------- Eliminar todos os registros extrakit
  public onExcluirSelecaoExtraKit(){
    this.gridExtraKit?.items.forEach(item=> {this.gridExtraKit?.selectRowItem(item)})

    /*
    if ((this.gridExtraKit?.getSelectedRows() as any[]).length < 1){
      this.srvNotification.error("Nenhum registro selecionado !")
      return
    }
    this.srvDialog.confirm({
      title: 'ELIMINAR EXTRAKIT',
      message: 'Deseja eliminar os registros selecionados ? \n Atenção: Registros com quantidade ruim não podem ser eliminados !',
      literals: {"cancel": "Não", "confirm": "Sim"},
      confirm: () => {

        let registrosSelecionados = this.gridExtraKit?.getSelectedRows().filter(item => item.qtRuim === 0)
        
        registrosSelecionados?.forEach((item,index) => {
          this.gridExtraKit?.removeItem(item)
        })
        this.gridExtraKit?.unselectRows()

        this.listaExtraKit = this.gridExtraKit?.items as any[]

        this.srvNotification.success("Registros eliminados com sucesso !")
      },
      cancel:  () => { }
    })
      */

  }
    //-------------------------------------------------------------- Eliminar registro grid extrakit
    public onDeletarRegistroPagto(obj:any){

      /* Partucularidade nao contemplada aqui
      itens com dependencia precisam ser eliminados conjuntamente
      ItemA pagto  4
      itemB renova 2

      */

      this.srvDialog.confirm({
        title: 'ELIMINAR REGISTRO',
        message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA ELIMINAR REGISTRO ?</span></div>",
        literals: {"cancel": "Não", "confirm": "Sim"},
        confirm: () => {
          //Encontrar o indice da linha a ser excluida
          let index = this.itemsDetalhe.findIndex(o => o.id === obj.id) //era o.cRowId
          let id = this.itemsDetalhe.find(o => o.id === obj.id)
          this.itemsDetalhe.splice(index, 1);

          let index2 = this.itemsResumo.findIndex(o => o.id === obj.id)
          this.itemsResumo.splice(index2, 1)

          //Atualizar a lista para refresh de tela
          this.itemsDetalhe = [...this.itemsDetalhe]

          //Atualiar label de tela
          this.tituloDetalhe = `Pagamentos: ${this.itemsDetalhe.length} registros`

          //Atualizar contadores tela de resumos
          this.AtualizarLabelsContadores();

          
          let param:any={id:id.id, codEstabel:this.codEstabelecimento, codTecnico:this.codTecnico}

          //Apagar na base
          this.srvTotvs.EliminarPorId(param).subscribe({
            next: (response: any) => {}
          })

          this.srvNotification.success("Registro eliminados com sucesso !")
        },
        cancel:  () => { }
      })


    }

    public onEliminarTodosPagamentos(){
      this.srvDialog.confirm({
        title: 'ELIMINAR TODOS PAGAMENTOS',
        message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA ELIMINAR PAGAMENTOS ?</span></div>",
        literals: {"cancel": "Não", "confirm": "Sim"},
        confirm: () => {

          this.itemsDetalhe.forEach(item=>{

            //Tirar da lista de Resumo
            let idx = this.itemsResumo.findIndex(o => o.id === item.id)
            this.itemsResumo.splice(idx, 1)

            //Apagar na base
            let param:any={id:item.id, codEstabel:this.codEstabelecimento, codTecnico:this.codTecnico}
            this.srvTotvs.EliminarPorId(param).subscribe({next: (response: any) => {}})

          })
          this.itemsDetalhe=[]
          //Atualiar label de tela
          this.tituloDetalhe = `Pagamentos: ${this.itemsDetalhe.length} registros`

          //Atualizar contadores tela de resumos
          this.AtualizarLabelsContadores();
          
          this.srvNotification.success("Registro eliminados com sucesso !")
        },
        cancel:  () => { }
      })


    }

    //---------------------------------------------------------------- Exportar lista detalhe para excel
    public onExportarExcel(){
      let titulo = this.tituloDetalhe.split(':')[0]
      let subTitulo = this.tituloDetalhe.split(':')[1]
      this.loadExcel = true

      if (titulo.toUpperCase() === "PAGAMENTOS"){

        //Edson solicitou um layout diferente qdo for pagamento
        let colunasPag =  [
            { property: 'itCodigo', label: "Item"},
            { property: 'descItem', label: "Descrição", width: '300px'},
            { property: 'qtPagar', label: 'Qt. a Entregar', type: 'number', color:"color-07", visible:true},
            { property: 'qtSaldo', label: 'Saldo Teórico', type: 'number'},
            { property: 'codLocaliza', label: "Local"}
          ]

          this.srvExcel.exportarParaExcel('RESUMO DE ' + titulo.toUpperCase(),
                                      subTitulo.toUpperCase(),
                                      colunasPag,
                                      this.itemsDetalhe.sort(this.ordenarCampos(['codLocaliza', 'itCodigo'])),
                                      'Resumo',
                                      'Plan1')

      }
      else{
        this.srvExcel.exportarParaExcel('RESUMO DE ' + titulo.toUpperCase(),
                                        subTitulo.toUpperCase(),
                                        this.colunasDetalhe,
                                        this.itemsDetalhe.sort(this.ordenarCampos(['codLocaliza', "itCodigo"])),
                                        'Resumo',
                                        'Plan1')
      }
       this.loadExcel = false;
    }

 

  //------------------------------------------------------------------- Botao Aprovar (Resumo calculo)
  public onAprovarCalculo(tipoAprov:number){
    this.srvDialog.confirm({
      title: 'EXECUÇÃO CÁLCULO - ' + this.lblOpcao,
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA EXECUÇÃO DO CÁLCULO ?</span></div><p>Serão geradas as notas fiscais de entrada e saída.</p>",
      confirm: () => {
        this.labelLoadTela = "Gerando execução RPW..."
        this.loadTela = true
        
        let params:any={paramsTela: {
                          opcao: this.tipoCalculo,  
                          tipoAprovacao: tipoAprov,       
                          codEstab: this.codEstabelecimento,     
                          codEmitente: this.codTecnico,  
                          nrProcess:  this.processoInfo,    
                          serieEntra: this.serieEntra,    
                          serieSai:  this.serieSaida,     
                          codTranspEntra: this.codTransEnt,
                          codTranspSai: this.codTransSai,  
                          codEntrega:  this.codEntrega   
        }}

        this.srvTotvs.AprovarCalculo(params).subscribe({
          next: (response: any) => {
            //console.log("aprovar calculo", response)
            this.loadTela=false
            this.srvNotification.success('Execução do cálculo realizada com sucesso ! Processo RPW: ' + response.rpw)
            this.srvTotvs.EmitirParametros({estabInfo:'', tecInfo:'', processoInfo:''})
            this.stepper?.first()
          },
          error:(e)=>{this.loadTela=false}
        })
      },
      cancel: () => this.srvNotification.error("Cancelada pelo usuário")
    })}

    onImpressao() {
      /*
      if (this.listaOrdens === undefined){
        this.srvNotification.error('Não existem ordens para o técnico')
        return 
      }
        */

      if(this.cRowId === undefined){
        this.srvNotification.error('Não existem ordens para o técnico')
        return 
      }

      this.srvDialog.confirm({
        title: 'GERAÇÃO INFORME OS',
        literals: { cancel: 'Cancelar', confirm: 'Gerar Arquivo' },
        message: "<div class='dlg'><i class='bi bi-exclamation-circle po-font-subtitle'></i><span class='po-font-text-large-bold'> DESEJA GERAR O INFORME DE OS ?</span></div>",
        confirm: () => {

          //Inicializar acompanhamento rpw
          this.numPedExec.update(() => 1)

          //this.loadTela = true;
          let paramsArquivo: any = {
            iExecucao: 2,
            cRowId:  this.cRowId //this.listaOrdens[0]['c-rowId'],
          };
          this.srvTotvs46.ImprimirOS(paramsArquivo).subscribe({
            next: (response: any) => {

              //Acompanhar rpw
              this.numPedExec.update(() => response.NumPedExec)
    
              //Arquivo Gerado
             
              let params: any = { nrProcess: this.processoInfo, situacao: 'IOS' };
              this.srvTotvs46.ObterArquivo(params).subscribe({
                next: (item: any) => {
                  this.arquivoInfoOS = item.items[0].nomeArquivo
                }})
  
              this.loadTela = false;
              this.srvTotvs.EmitirParametros({ processoSituacao: 'IMPRESSO' });
            },
            error: (e) => {
              this.loadTela = false;
            },
          });
        },
        cancel: () => {
         
        },
      });
  
    }

    onAbrirArquivo(obj: any) {

      this.nomeArquivo = `InfOS-${this.codEstabelecimento}-${this.codTecnico}-${this.processoInfo.toString().padStart(8,'0')}.tmp`
      //this.nomeArquivo = obj;
      let params: any = { nomeArquivo: this.nomeArquivo };
      this.loadTela = true;
      this.labelLoadTela = ""
      this.srvTotvs.AbrirArquivo(params).subscribe({
        next: (response: any) => {
          this.conteudoArquivo = response.arquivo
            .replace(/\n/gi, '<br>')
           
            .replace(//gi, '<br>');
          this.loadTela = false;
          this.abrirArquivo?.open();
        },
        error: (e) => {
          this.loadTela = false;
        },
      });
    }

    onImprimirConteudoArquivo() {
      let win = window.open(
        '',
        '',
        'height=' +
          window.innerHeight +
          ', width=' +
          window.innerWidth +
          ', left=0, top=0'
      );
      win?.document.open();
      win?.document.write(
        "<html><head><meta charset='UTF-8'><title>" +
          this.nomeArquivo +
          "</title></head><style>p{ font-family: 'Courier New', Courier, monospace;font-size: 12px; font-variant-numeric: tabular-nums;}</style><body><p>"
      );
      win?.document.write(
        this.conteudoArquivo
          .replace(/\n/gi, '<br>')
          
          .replace(//gi, '<br>')
      );
      win?.document.write('</p></body></html>');
      win?.print();
      win?.document.close();
      win?.close();
    }
  

}
