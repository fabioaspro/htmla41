import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PoAccordionComponent, PoAccordionItemComponent, PoDialogService, PoModalAction, PoModalComponent, PoNotificationService, PoTableAction, PoTableColumn, PoLoadingModule, PoButtonModule, PoTooltipModule, PoAccordionModule, PoWidgetModule, PoTableModule, PoModalModule, PoTableRowTemplateDirective, PoFieldModule, PoIconModule } from '@po-ui/ng-components';
import { Subscription, delay, interval } from 'rxjs';
import { Usuario } from '../../interfaces/usuario';
import { TotvsService } from '../../services/totvs-service.service';
import { environment } from '../../../environments/environment';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { NgIf, UpperCasePipe } from '@angular/common';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [
        NgIf,
        PoLoadingModule,
        PoButtonModule,
        PoTooltipModule,
        PoAccordionModule,
        PoWidgetModule,
        PoTableModule,
        BtnDownloadComponent,
        PoModalModule,
        UpperCasePipe,
        PoModalModule,
        PoFieldModule, 
        FormsModule, 
        PoIconModule, 
    ],
})
export class DashboardComponent {
  //---------- Acessar a DOM
  @ViewChild('loginModal', { static: true }) loginModal:
    | PoModalComponent
    | undefined;
  @ViewChild('abrirArquivo', { static: true }) abrirArquivo:
    | PoModalComponent
    | undefined;
    @ViewChild(PoAccordionComponent, { static: true }) principal!: PoAccordionComponent;
    @ViewChild(PoAccordionItemComponent, { static: true }) item1!: PoAccordionItemComponent;
    @ViewChild(PoAccordionItemComponent, { static: true }) item2!: PoAccordionItemComponent;

    //Referencia ao componente de login
    @ViewChild('loginModal_login', { static: true }) loginModal_login: PoModalComponent | undefined;


  //---Injection
  private srvTotvs = inject(TotvsService);
  private srvTotvs46 = inject(TotvsService46)
  private srvNotification = inject(PoNotificationService);
  private srvDialog = inject(PoDialogService);
  private router = inject(Router)

  //---Variaveis
  tabNFE: boolean = true;
  codEstabel: string = '';
  codEstabelecimento_login:string=''
  codUsuario: string = '';
  codUsuario_login:string=''
  senha_login:string=''
  rowItem:any=[]
  loadGrid=false

  //Progress Counter
  percNFE = 0
  percNFS = 0

  rpwStatus!: {
    mensagemTela: string,
    motivoExecucao: string,
    numPedExecucao: string,
    situacaoExecucao: string,
    mensagemRPW:string,
  };
  cRPW: string = '';
  cMensagemErroRPW=''
  infoTela: string = '';
  nrProcess: string = '';
  statusProcess: number = 0;
  tempoProcess: number = 0;
  senha: string = '';
  loadTela: boolean = false;
  usuarioLogado: boolean = false;
  loadTecnico: string = '';
  placeHolderEstabelecimento: string = '';
  conteudoArquivo: string = '';
  mostrarInfo: boolean = false;
  nomeArquivo: string = '';

  //ListasCombo
  listaEstabelecimentos!: any[];
  listaTecnicos!: any[];

  //---Grids de Notas
  colunasNFS!: PoTableColumn[]
  colunasNFE!: PoTableColumn[]
  colunasErro!: PoTableColumn[]
  colunasItensNota!:PoTableColumn[]
  listaNFS!: any[]
  listaNFE!: any[]
  listaErros!: any[]
  listaItems!:any[]
  sub!: Subscription;
  urlSpool:string=''
  alturaGridLog:number=window.innerHeight - 355
  alturaGridEntra:number=window.innerHeight - 305
  alturaGridSai:number=window.innerHeight - 385

  //----- Tela Login
acaoLogin_login: PoModalAction = {
  action: () => {
    this.onLogarUsuario()
  },
  label: 'Login',
  
};

acaoLogin_cancel: PoModalAction = {
  action: () => {
    this.loginModal_login?.close()
  },
  label: 'Cancelar'
};

  mostrarDetalhe(row:any, index: number) {
    return true;
  }

  acaoLogin: PoModalAction = {
    action: () => {
      this.LogarUsuario();
    },
    label: 'Selecionar',
  };

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

  readonly acoesGridErro: PoTableAction[] = [
    {
      label: '',
      icon: 'bi bi-folder2-open',
      type:'danger',
      action: this.onAbrirArquivo.bind(this),
      
    },
  ];

  ObterItensNFE(obj:any){
    this.loadGrid=true
    this.listaItems=[]
    let params: any = {tipo: 'E', chave: `${obj['serie-docto']};${obj['nro-docto']};${obj['cod-emitente']};${obj['nat-operacao']}`};
    this.srvTotvs.ObterItensNota(params).subscribe({
      next:(response:any)=>{
        this.listaItems = response.itemsNota;
        this.loadGrid=false
      }
    })
  }

  ObterItensNFS(obj:any){
    this.loadGrid=true
    this.listaItems=[]
    let params: any = {tipo: 'S', chave: `${obj['cod-estabel']};${obj['serie']};${obj['nr-nota-fis']}`};
    this.srvTotvs.ObterItensNota(params).subscribe({
      next:(response:any)=>{
        this.listaItems = response.itemsNota;
        this.loadGrid=false
      }
    })

  }
   

  ngOnInit(): void {

    this.esconderPainel();
    //--- Informacoes iniciais tela
    this.srvTotvs.EmitirParametros({ tituloTela: 'HTMLA41 - DASHBOARD DE NOTAS FISCAIS'});

    //Colunas grids
    this.colunasNFE = this.srvTotvs.obterColunasEntradas();
    this.colunasNFS = this.srvTotvs.obterColunasSaidas();
    this.colunasErro = this.srvTotvs.obterColunasErrosProcessamento();
    this.colunasItensNota = this.srvTotvs.obterColunasItensNota()

    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
        this.listaEstabelecimentos = (response as any[]).sort(this.srvTotvs.ordenarCampos(['label']))
      },
    });

    this.srvTotvs46
    .ObterCadastro({tabela: 'spool', codigo: ''})
    .subscribe({
      next: (response: any) => {
        this.urlSpool = response.desc
      }})

    //Login Unico
    this.srvTotvs.ObterUsuario().subscribe({
      next:(response:Usuario)=>{
        
        if (response === undefined){
          this.LogarUsuario()
        }
        else{
          this.codEstabel = response.codEstabelecimento
          this.codUsuario = response.codUsuario
          this.nrProcess  = response.nrProcesso
          this.usuarioLogado = true
          this.verificarNotas()
       }
      }
    })
  }

onReenviarNotasSefaz(){
  if (this.cRPW.toUpperCase().includes('EXECUTANDO / EXECUTANDO PEDIDO') || this.cRPW.toUpperCase().includes('NÃO EXECUTADO')){
    this.srvNotification.error('Não é permitido o Reenvio de Notas com RPW em execução !')
    return
  }

  this.srvDialog.confirm({
    title: 'REENVIAR NOTAS SEFAZ',
    message:
    "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA REENVIO DE NOTAS PENDENTES?</span></div><p>Serão reenviadas as notas que estão aguardando autorização do SEFAZ.</p>",

    confirm: () => {
      this.loadTela = true;
      let params: any = {
          codEstabel: this.codEstabel,
          nrProcess: this.nrProcess
      };

      this.srvTotvs.ReenviarNotasSefaz(params).subscribe({
        next: (response: any) => {
          if (response.numPedExec === 0)
             this.srvNotification.error('Não existem notas pendentes para atualizar no SEFAZ')
          else{
             this.srvNotification.success('Reenvio de Notas executado. Criado pedido de execução: ' + response.numPedExec)
             this.verificarNotas()
          }

          this.loadTela = false;
        },
        error: (e) => {
         
          this.loadTela = false;
        },
      });
    },
    cancel: () => this.srvNotification.error('Cancelada pelo usuário'),
  });

}

onForcarEfetivarProcesso(){
  this.srvDialog.confirm({
    title: 'EFETIVAR PROCESSO',
    message:
    "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA EFETIVAÇÃO ?</span></div><p>O processamento será encerrado e o processo enviado para o próximo passo.</p>",

    confirm: () => {
      this.loadTela = true;
      let params: any = {
          codEstabel: this.codEstabel,
          nrProcess: this.nrProcess
      };

      this.srvTotvs.ForcarEfetivacaoSaida(params).subscribe({
        next: (response: any) => {
          this.router.navigate(['monitor']) 
        },
        error: (e) => {
         
          this.loadTela = false;
        },
      });
    },
    cancel: () => this.srvNotification.error('Cancelada pelo usuário'),
  });
}


LogarUsuario() {
   this.router.navigate(['seletor'], {queryParams:{redirectTo:'dashboard'}}) 
}
  
verificarNotas() {
    
    if (!this.usuarioLogado) {
      this.loginModal?.open();
    } else {
      this.loadTela = true;


      let paramsNota: any = {CodEstab: this.codEstabel,CodTecnico: this.codUsuario, NrProcess: this.nrProcess};
      this.srvTotvs.ObterNotas(paramsNota).subscribe({
        next: (response: any) => {
          
          this.listaNFE = response.nfe;
          this.listaNFS = response.nfs;

          //Atualizar tela
          this.principal.poAccordionItems.forEach(x=> {
            if (x.label.startsWith('Notas Fiscais de ENTRADA'))
              x.label = `Notas Fiscais de ENTRADA (${this.listaNFE.filter(x => x["idi-sit"] === 100).length} de ${response.nfe.length})`
            else if (x.label.startsWith('Notas Fiscais de SAÍDA'))
              x.label = `Notas Fiscais de SAÍDA (${this.listaNFS.filter(x => x["idi-sit"] === 100).length} de ${response.nfs.length})`
            else
              x.label = `Logs do Processo (${response.erros.length})`
          })

          //Calculo Progress Bar
          //this.percNFE = (this.listaNFE.filter(x=> x["idi-sit"] === 100).length * 100) / this.listaNFE.length
          //this.percNFS = (this.listaNFS.filter(x=> x["idi-sit"] === 3).length * 100) / this.listaNFS.length


          this.rpwStatus = response.rpw;
          this.listaErros = response.erros;
          this.cMensagemErroRPW = response.rpw[0].mensagemRPW
          this.cRPW = `RPW: ${response.rpw[0].numPedExecucao} (${response.rpw[0].situacaoExecucao} / ${response.rpw[0].motivoExecucao})`;
          //this.infoTela = response.rpw[0].mensagemTela;

          //Aplicar cor a tag de informacoes na tela
          
          if (response.rpw[0].situacaoExecucao === '')
            this.esconderPainel()
          else{
            this.aplicarCorPainel(response.rpw[0].mensagemTela)
          }
          //this.loadTela = false;
        },
        error: (e) => {
          //this.srvNotification.error('Ocorreu um erro na requisição');
          return;
        },
      });

      //Obter as informacoes do Processo
      let paramsTec:any = {codEstabel: this.codEstabel, codTecnico: this.codUsuario}
      this.srvTotvs.ObterNrProcesso(paramsTec).subscribe({
        next: (response: any) => {
          //Atualizar Informacoes Tela
          this.srvTotvs.EmitirParametros({processoSituacao: response.situacaoProcesso})

          this.loadTela=false
        },
       error: (e) => { }
      })

    }
  }

  onReprocessarNotas() {

    if (this.cRPW.toUpperCase().includes('EXECUTANDO / EXECUTANDO PEDIDO') || this.cRPW.toUpperCase().includes('NÃO EXECUTADO')){
      this.srvNotification.error('Não é permitido o reprocessamento com RPW em execução !')
      return
    }

    this.srvDialog.confirm({
      title: 'REPROCESSAR NOTAS',
      message:
         "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA REPROCESSAMENTO ?</span></div><p>O reprocessamento só deve ser usado com a certeza da parada do processamento normal.</p>",
        

      confirm: () => {
        this.loadTela = true;
        let params: any = {
          paramsTela: {
            codEstab: this.codEstabel,
            codEmitente: this.codUsuario,
            nrProcess: this.nrProcess,
          },
        };

        this.srvTotvs.ReprocessarCalculo(params).subscribe({
          next: (response: any) => {
            
            if (response === null || response === undefined){
              this.srvNotification.error('A situação não permite reprocessamento !')
              return 
            }
           
            this.srvNotification.success('Execução do cálculo realizada com sucesso ! Processo RPW: ' + response.rpw)

            setTimeout(() => {
              //Atualizar tela logo apos enviar o processamento
              this.verificarNotas()
            }, 1000);
          },
          error: (e) => {
           // this.srvNotification.error('Ocorreu um erro na requisição')
            this.loadTela = false;
          },
        });
      },
      cancel: () => this.srvNotification.error('Cancelada pelo usuário'),
    });
  }


  aplicarCorPainel(cor: string) {
    const elemento: HTMLInputElement | null = document.querySelector(
      '.rpwInfo'
    ) as HTMLInputElement;

    if (elemento === null) return;
    elemento?.classList.remove('ok');
    elemento?.classList.remove('info');
    elemento?.classList.remove('erro');
    elemento?.classList.add(cor);
    elemento.style.display = 'block';
  }

  esconderPainel() {
    const elemento: HTMLInputElement | null = document.querySelector(
      '.rpwInfo'
    ) as HTMLInputElement;
    if (elemento === null) return;
    elemento.style.display = 'none';
  }

   //---- Chamar a tela de login passando o tipo de calculo
   onChamarLogin(){

    //Acompanhamento
    this.acaoLogin_login.loading=false

    //Zerar campos de tela
    this.codUsuario_login=''
    this.senha_login=''

    //Sugerir o estabelecimento do usuário
    this.codEstabelecimento_login = this.codEstabel

    //Abrir a tela de login
    this.loginModal_login?.open()
  }  

  //---- Acao Login
  onLogarUsuario(){
    //Acompanhamento
    this.acaoLogin_login.loading=true;

    //Popular parametros de tela
    let paramsLogin: any = {CodEstabel: this.codEstabelecimento_login, CodUsuario: this.codUsuario_login, Senha: this.senha_login}

    //Chamar servico de login
    this.srvTotvs.LoginAdmin(paramsLogin).subscribe({
      next: (response: any) => {
        
        if (response.senhaValida){
            //Acompanhamento
            this.acaoLogin_login.loading=false

            //Fechar janela
            this.loginModal_login?.close()

            //Chamar rotina de aprovacao passando o Tipo de Aprovacao
            this.onForcarEfetivarProcesso()
        }
        else{
          this.acaoLogin_login.loading=false
          this.srvNotification.error(response.mensagem)
        }
        },
      error:(e)=>{this.acaoLogin_login.loading=false}
    })
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
       // .replace(/\40/gi, '&nbsp;')
        .replace(//gi, '<br>')
    );
    win?.document.write('</p></body></html>');
    win?.print();
    win?.document.close();
    win?.close();
  }

  onAbrirArquivo(obj: any) {
    this.nomeArquivo = obj.nomeArquivo;
    let params: any = { nomeArquivo: obj.nomeArquivo };
    this.loadTela = true;
    this.srvTotvs.AbrirArquivo(params).subscribe({
      next: (response: any) => {
        this.conteudoArquivo = response.arquivo
          .replace(/\n/gi, '<br>')
         // .replace(/\40/gi, '&nbsp;')
          .replace(//gi, '<br>');
        this.loadTela = false;
        this.abrirArquivo?.open();
      },
      error: (e) => {
        this.loadTela = false;
      },
    });
  }

}
