import { Component,
  inject,
  OnInit,
  OnDestroy,
  ViewChild, ChangeDetectorRef,
  QueryList,
  ElementRef,
  signal} from '@angular/core';

  import { PoAccordionComponent, PoAccordionItemComponent, PoDialogService, PoMenuItem, PoModalAction, PoModalComponent, PoNotificationService, PoTableAction, PoTableColumn, PoTableComponent, PoLoadingModule, PoAccordionModule, PoWidgetModule, PoFieldModule, PoIconModule, PoButtonModule, PoTooltipModule, PoTableModule, PoTagModule, PoModalModule, PoDatepickerModule, PoRadioGroupModule, PoCheckboxModule, PoButtonComponent, PoRadioComponent, PoRadioModule } from '@po-ui/ng-components';
  import { delay, interval, Subscription } from 'rxjs';
import { TotvsService46 } from '../../services/totvs-service-46.service';
  import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TotvsService } from '../../services/totvs-service.service';
import { Usuario } from '../../interfaces/usuario';
import { Router } from '@angular/router';
import { ExcelService } from '../../services/excel-service.service';
import { environment } from '../../../environments/environment';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { NgIf, NgClass } from '@angular/common';
import { RpwComponent } from '../rpw/rpw.component';


@Component({
    selector: 'app-informe2',
    templateUrl: './informe2.component.html',
    styleUrls: ['./informe2.component.css'],
    standalone: true,
    imports: [
        NgIf,
        PoLoadingModule,
        PoAccordionModule,
        PoWidgetModule,
        FormsModule,
        ReactiveFormsModule,
        PoFieldModule,
        PoIconModule,
        PoButtonModule,
        
        PoTooltipModule,
        PoTableModule,
        NgClass,
        PoTagModule,
        BtnDownloadComponent,
        PoModalModule,
        PoDatepickerModule,
        PoRadioGroupModule,
        PoCheckboxModule,
        RpwComponent
    ],
})
export class Informe2Component {

  
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log('Enter key pressed');
      // Add your logic here
    }
  }

  private srvTotvs46 = inject(TotvsService46);
  private srvTotvs = inject(TotvsService);
  private srvDialog = inject(PoDialogService);
  private srvNotification = inject(PoNotificationService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private srvExcel = inject(ExcelService);
  private elementosHTML = inject (ElementRef)

  //---------- Acessar a DOM
  @ViewChild('telaIncluirOrdem', { static: true }) telaIncluirOrdem:
    | PoModalComponent
    | undefined;
  @ViewChild('telaAlterarOrdem', { static: true }) telaAlterarOrdem:
    | PoModalComponent
    | undefined;
  @ViewChild('telaIncluirItemOrdem', { static: true }) telaIncluirItemOrdem:
    | PoModalComponent
    | undefined;

    @ViewChild('timer', { static: true }) telaTimer:
    | PoModalComponent
    | undefined;
  
  @ViewChild('gridOrdens', { static: true }) gridOrdens:
    | PoTableComponent
    | undefined;
    @ViewChild('gridEnc', { static: true }) gridEnc:
    | PoTableComponent
    | undefined;
  @ViewChild(PoAccordionComponent, { static: true })
  principal!: PoAccordionComponent;
  @ViewChild(PoAccordionItemComponent, { static: true })
  item1!: PoAccordionItemComponent;
  @ViewChild(PoAccordionItemComponent, { static: true })
  item2!: PoAccordionItemComponent;
  @ViewChild('abrirArquivo', { static: true }) abrirArquivo:
    | PoModalComponent
    | undefined;
  @ViewChild('telaIncluirEnc', { static: true }) telaIncluirEnc:
    | PoModalComponent
    | undefined;

  @ViewChild('telaSeriesPendentes', { static: true }) telaSeriesPendentes:
    | PoModalComponent
    | undefined;  


    

  //Formulario
  public form = this.formBuilder.group({
    codEstabel: ['', Validators.required],
    codUsuario: ['', Validators.required],
    senha: ['', Validators.required],
  });

  public formOrdem = this.formBuilder.group({
    numOS: [0, Validators.required],
    Chamado: [0, Validators.required],
    codEstabel: [''],
    codEmitente: [0],
    moto: [false],
  });

  public formItemOrdem = this.formBuilder.group({
    CodFilial: [''],
    'envelope-seguranca': ['0000000000'],
    Evento: [''],
    'it-codigo': [''],
    'Nat-Operacao': [''],
    'nf-saida': [''],
    Serie: [''],
    NumOS: [''],
    Quantidade: [''],
    renova: [''],
    'serie-ins': ['0'],
    'Serie-Nf-Saida': [''],
    'serie-ret': ['0'],
    'nr-enc': ['0',[Validators.maxLength(9)]],
    'Serie-enc': [''],
    'ret-transp': [1],
    'tag-enc': [false],
  });

  public formEnc = this.formBuilder.group({
    'cod-estabel': [{ value: '', disabled: true }],
    'nom-estabel': [{ value: '', disabled: true }],
    CodFilial: [{ value: '', disabled: true }],
    'nom-filial': [{ value: '', disabled: true }],
    'nr-enc': [''],
    'Serie-enc': [''],
    'CodFilial-enc': [{ value: '', disabled: true }],
    'it-codigo': [{ value: '', disabled: true }],
    'desc-item': [{ value: '', disabled: true }],
    DefInd: [''],
    'desc-defeito': [{ value: '', disabled: true }],
    atividade: [''],
    'desc-atividade': [{ value: '', disabled: true }],
    'NumSerie-atu': [''],
    'NumSerie-ant': [''],
    FilAnt: [''],
    RRAnt: [''],
    DataRRAnt: [''],
    clisirog: [''],
    'cod-emitente': [''],
    'nom-emitente': [{ value: '', disabled: true }],
    observacao: [''],
  });

  

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

  acaoOKEncPendente: PoModalAction = {
    action: () => {
     // this.onGravarListaNumSerieItem()
    },
    label: 'Gravar',
  };

 

  acaoSairEncPendente: PoModalAction = {
    action: () => {
      this.telaSeriesPendentes?.close();
    },
    label: 'Sair',
  };

  //---Variaveis
  loadTela: boolean = false;
  loadGrid: boolean = false;
  loadGridEnc:boolean=false;
  loadModal: boolean = false;
  loadGridOrdem: boolean = false;
  loadIncluirOrdem: boolean = false;
  loadTecnico: string = '';
  cUsadas: any = 0;
  cBrancas: any = 0;
  cTotal: any = 0;
  mostrarDados: boolean = false;
  edObservacao: string = '';
  ordemSelecionada: any = undefined;
  itemSelecionado: any = undefined;
  cTag: string = '';
  cInfoItem: string = 'Não há itens cadastrados';
  cOS: string = '';
  cChamado: string = '';

  //Abertura de Arquivo
  conteudoArquivo: string = '';
  mostrarInfo: boolean = false;
  nomeArquivo: string = '';

  //ListasCombo
  listaEstabelecimentos!: any[];
  listaTecnicos!: any[];
  listaTransp!: any[];
  listaOrdens!: any[];
  listaItens!: any[];
  listaStatus!: any[];
  listaArquivos!: any[];
  listaEnc!: any[];

  //---Grid
  colunasOrdens!: PoTableColumn[];
  colunasItens!: PoTableColumn[];
  colunasArquivos!: PoTableColumn[];
  colunasEnc!: PoTableColumn[];

  sub!: Subscription;
  sub2!: Subscription;
  nrProcesso: number = 0;
  lDisabled: boolean = false;

  cRowId: string = '';
  urlInfoOs: string = '';
  arquivoInfoOS: string = '';
  urlSpool: string = '';
  numSerieItem:string=''
  alturaGrid:number=window.innerHeight - 355
  numPedExec=signal(0)

  selectedItem:any
  selection:any
  lIncluirItemOrdem:boolean=false
  cTitulo:string=''
 

  
  readonly acoesGridOrdem: PoTableAction[] = [
    {
      label: 'OS - Alterar Chamado',
      icon: 'bi bi-pencil-square',
      action: this.onAlterarOrdem.bind(this),
    },
    {
      label: 'OS - Eliminar',
      icon: 'bi bi-trash',
      action: this.onExcluirOrdem.bind(this),
      type: 'danger',
    },
    
    {
      separator: true,
      label: 'ITEM - Modificar',
      icon: 'bi bi-pencil-square',
      action: this.onAlterarItemOrdem.bind(this),
    },

    {
      label: 'ITEM - Eliminar',
      icon: 'bi bi-trash',
      action: this.onExcluirItemOrdem.bind(this),
      type: 'danger',
    },
    /*
    {
      label: 'Desmarcar OS',
      icon: 'bi bi-file',
      action: this.onDesmarcar.bind(this),
    },
    {
      separator: true,
      label: 'Marcar Moto',
      icon: 'bi bi-bicycle',
      action: this.onMarcarMoto.bind(this),
      //disabled: this.form.controls.senha.value?.toLowerCase() !== 'moto'
    },
    {
      label: 'Desmarcar Moto',
      icon: 'bi bi-bicycle',
      action: this.onDesmarcarMoto.bind(this),
      //disabled: this.form.controls.senha.value?.toLowerCase() !== 'moto'
    },
    
    {
      separator: true,
      label: 'Alterar Chamado',
      icon: 'bi bi-pencil-square',
      action: this.onAlterarOrdem.bind(this),
    },
    {
      separator: true,
      label: 'Eliminar OS',
      icon: 'bi bi-trash',
      action: this.onExcluirOrdem.bind(this),
      type: 'danger',
    },
    */
  ];

  readonly acoesGridItem: PoTableAction[] = [
    {
      label: 'Alterar Item OS',
      icon: 'bi bi-pencil-square',
      action: this.onAlterarItemOrdem.bind(this),
    },
    {
      separator: true,
      label: 'Eliminar Item OS',
      icon: 'bi bi-trash',
      action: this.onExcluirItemOrdem.bind(this),
      type: 'danger',
    },
  ];

  //--- Actions
  readonly opcoes: PoTableAction[] = [
    {
      label: '',
      icon: 'po-icon po-icon po-icon-edit',
      action: this.onSelecionarOS.bind(this),
    },
  ];

  readonly acaoIncluirOrdem: PoModalAction = {
    label: 'Salvar Ordem',
    action: () => {
      this.incluirOrdem()
      this.limparArquivo()
    },
    loading: this.loadIncluirOrdem,
    disabled: !this.formOrdem.valid,
  };

  readonly acaoAlterarOrdem: PoModalAction = {
    label: 'Salvar',
    action: () => {
      this.alterarOrdem()
      this.limparArquivo()
    },
    loading: this.loadIncluirOrdem,
    disabled: !this.formOrdem.valid,
  };

  readonly acaoCancelarOrdem: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaIncluirOrdem?.close();
      this.telaAlterarOrdem?.close();
    },
  };

  readonly acaoIncluirItemOrdem: PoModalAction = {
    label: 'Salvar',
    action: () => {
      this.okIncluirItemOrdem()
      this.limparArquivo()
    },
  };

  readonly acaoCancelarItemOrdem: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaIncluirItemOrdem?.close();
    },
  };

  readonly acaoIncluirEnc: PoModalAction = {
    label: 'Salvar',
    action: () => {
      this.okIncluirEnc()
      this.limparArquivo()
    },
  };

  readonly acaoCancelarEnc: PoModalAction = {
    label: 'Cancelar',
    action: () => {
      this.telaIncluirEnc?.close();
      this.telaIncluirItemOrdem?.open();
    },
  };

  readonly acoesGridArquivo: PoTableAction[] = [
    {
      label: '',
      icon: 'bi bi-folder2-open',
      action: this.onAbrirArquivo.bind(this),
    },
  ];

  limparArquivo(){
    this.listaArquivos=[] 
  }


  onSeriesPendentes(){
    this.limparArquivo()
    this.telaSeriesPendentes?.open()

    let params: any = {codEmitente: this.form.controls.codUsuario.value, codEstabel: this.form.controls.codEstabel.value};
   
    this.loadGrid = true;
    this.srvTotvs46.SeriesPendentes(params).subscribe({
      next: (response: any) => {
        //console.log(response)
        this.loadGrid = false;
        this.listaEnc=response.items.sort(this.srvTotvs.ordenarCampos(['numos']))
      },
      error: (e) => {},
      
    });
  }

  //Montar o objeto para salvar informacoes do item da os
  onLeaveNumSerieItem(obj:any){

    //Cancelar se o item nao tiver sido alterado
    if (this.ordemSelecionada['num-serie-it'] === this.numSerieItem) return
   
    this.limparArquivo()
    let params: any = {
      cRowId: obj['c-rowId-Item'],
      numSerieItem: obj['num-serie-it'],
    };
    this.loadGrid = true;
    this.srvTotvs46.GravarNumSerieItem(params).subscribe({
      next: (response: any) => {
        this.loadGrid=false
        this.ordemSelecionada['num-serie-it'] = response.numSerie
        this.gridOrdens?.updateItem(obj, this.ordemSelecionada)
      },
      error: (e) => {
        this.loadGrid = false; 
        this.ordemSelecionada['num-serie-it'] = this.numSerieItem
        this.gridOrdens?.updateItem(obj, this.ordemSelecionada)
      }
      
    });
  }

  onFocusNumSerie(obj:any){
    this.limparArquivo()
    this.gridEnc?.selectRow(obj)
  }

  //---Inicializar
  ngOnInit(): void {
    this.limparArquivo()

     //--- Evento de Logout
     this.sub2 = this.srvTotvs46.VerificarLogout().subscribe({
      next: (response: any) => {
        this.listaArquivos=[]
        this.listaOrdens=[]
        this.listaItens=[]
         //Fechar Painel item 1 e abrir item 2
         this.principal.poAccordionItems.forEach((x) =>
          x.label === 'Informações do Técnico' || x.label === 'Log de Arquivos'
            ? x.expand()
            : x.collapse()
        );
        this.item1.expand();
       
        this.form.controls.senha.setValue("")
        this.formOrdem.controls.numOS.setValue(0);
        this.formOrdem.controls.Chamado.setValue(0);
        
        this.cUsadas="0"
        this.cBrancas="0"
        this.cTotal="0"
        this.cOS=""
        this.cChamado=""
        this.srvNotification.success("Processo foi desbloqueado com sucesso!")
      },
    });
    
    this.srvTotvs46
      .ObterCadastro({tabela: 'spool', codigo: ''})
      .subscribe({
        next: (response: any) => {
          this.urlSpool = response.desc
        }})

    //--- Titulo Tela
    this.srvTotvs.EmitirParametros({ tituloTela: 'HTMLA46 - INFORME DE OS' });
    
    //--- Login Unico
    this.srvTotvs.ObterUsuario().subscribe({
      next: (response: Usuario) => {
        if (response === undefined) {
          this.srvTotvs.EmitirParametros({ estabInfo: '' });
        } else {
          this.formOrdem.controls.codEmitente.setValue(Number(response.codUsuario))
          this.formOrdem.controls.moto.setValue(this.form.controls.senha.value === 'moto')
          this.formOrdem.controls.codEstabel.setValue(response.codEstabelecimento)
        }
      },
    });

    //Colunas do grid
    this.colunasOrdens = this.srvTotvs46.obterColunasOrdens2()
    this.colunasItens = this.srvTotvs46.obterColunasItems()
    this.colunasArquivos = this.srvTotvs46.obterColunasArquivos()
    this.colunasEnc= this.srvTotvs46.obterColunasSeriesPendentes()

    //this.principal.expandAllItems()
    this.item1.expand();

    //Carregar combo de estabelecimentos
    this.srvTotvs46.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
        this.listaEstabelecimentos = (response as any[]).sort(
          this.srvTotvs46.ordenarCampos(['label'])
        );
      },
      error: (e) => {},
    });
  }

  ngOnDestroy(): void {
    this.sub2.unsubscribe();
  }

  okIncluirEnc() {
    let param:any = {"paramsTela": this.formEnc.getRawValue()}
    console.log("Parametros ENC", param)
    this.srvTotvs46.GravarEnc(param).subscribe({
      next: (response:any)=>{
        console.log("Resposta ENC", response)
        if(response.ok !== "ok") return
        this.formItemOrdem.controls['nr-enc'].setValue(this.formEnc.controls['nr-enc'].value)
        this.formItemOrdem.controls['Serie-enc'].setValue(this.formEnc.controls['Serie-enc'].value)
        this.formItemOrdem.controls['Serie-enc'].disable();
        this.telaIncluirEnc?.close()
        this.telaIncluirItemOrdem?.open()
      }
    })
  }

  onMarcarDesmarcar(obj: any) {
    this.limparArquivo()
    if (obj.flag === 'X') this.onDesmarcar(obj);
    else this.onMarcar(obj);
  }

  /* esconderSelecaoGrid() {
    let elementos = document.querySelectorAll<HTMLElement>('td.po-table-column-selectable') 
    elementos.forEach(item => item.style.display = 'none')
  } */

  //Cadastro de Enc
  onCadEnc() {
    //Fechar Tela Item
    this.telaIncluirItemOrdem?.close();

    //-----Obter Informacoes de cadastro
    this.formEnc.reset();

    //Estabelecimento
    this.srvTotvs46
      .ObterCadastro({tabela: 'estabel', codigo: this.form.controls.codEstabel.value})
      .subscribe({
        next: (response: any) => {
          this.formEnc.controls['cod-estabel'].setValue(this.form.controls.codEstabel.value)
          this.formEnc.controls['nom-estabel'].setValue(response.desc)

          let estabelec = this.listaEstabelecimentos.filter(item=> item.value === this.form.controls.codEstabel.value)[0]
          this.formItemOrdem.controls.CodFilial.setValue(estabelec.codFilial)
          this.formEnc.controls.CodFilial.setValue(estabelec.codFilial)
          this.formEnc.controls['CodFilial-enc'].setValue(estabelec.codFilial)

          //Filial
          this.srvTotvs46
          .ObterCadastro({tabela: 'filial', codigo: this.formItemOrdem.controls.CodFilial.value})
          .subscribe({
            next: (response: any) => {
              this.formEnc.controls['nom-filial'].setValue(response.desc);
            },
          });
       // this.formEnc.controls['nom-filial'].setValue(response.descFilial);
        },
      });

    
      

    //Item
    if (this.formItemOrdem.controls['it-codigo'].value !== null){
    this.srvTotvs46
      .ObterCadastro({
        tabela: 'item',
        codigo: this.formItemOrdem.controls['it-codigo'].value,
      })
      .subscribe({
        next: (response: any) => {
          this.formEnc.controls['it-codigo'].setValue(
            this.formItemOrdem.controls['it-codigo'].value
          );
          this.formEnc.controls['desc-item'].setValue(response.desc);
        },
      });
    }

    //Abrir Tela Enc
    this.telaIncluirEnc?.open();
    this.limparArquivo()
  }

  onLeaveDefeito(){
   
    //Defeito
    this.srvTotvs46.ObterCadastro({tabela: 'defeito', codigo: this.formEnc.controls.DefInd.value})
      .subscribe({
        next: (response: any) => {
          this.formEnc.controls['desc-defeito'].setValue(response.desc);
        },
      });
  }

  onLeaveAtividade(){
    
    //Defeito
    this.srvTotvs46.ObterCadastro({tabela: 'atividade', codigo: this.formEnc.controls.atividade.value})
      .subscribe({
        next: (response: any) => {
          this.formEnc.controls['desc-atividade'].setValue(response.desc);
        },
      });
  }

  onLeaveSite(){
    
    //Defeito
    this.srvTotvs46.ObterCadastro({tabela: 'estabel', codigo: this.formEnc.controls['cod-emitente'].value})
      .subscribe({
        next: (response: any) => {
          this.formEnc.controls['nom-emitente'].setValue(response.desc);
        },
      });
  }

  leaveNFS() {
    if(this.formItemOrdem.controls['nf-saida'].disabled) return

    let params: any = {
      items: this.formItemOrdem.getRawValue()
    };
    
    //Enviar o codigo do emitente no campo c-rowId para este caso especifico
    params.items["c-rowId"] = this.form.controls.codUsuario.value
    params.items["CodFilial"] = this.form.controls.codEstabel.value

    this.loadModal = true;
    this.srvTotvs46.LeaveNFSOS(params).subscribe({
      next: (response: any) => {
       
        let retorno = response.item[0]
        console.log("resposta", retorno)
        if (retorno === undefined) return

        this.formItemOrdem.controls['Quantidade'].setValue(retorno['Quantidade'])
        this.formItemOrdem.controls['nf-saida'].setValue(retorno['nf-saida'])
        this.formItemOrdem.controls['Serie-Nf-Saida'].setValue(retorno['Serie-Nf-Saida'])
        this.formItemOrdem.controls['Nat-Operacao'].setValue(retorno['Nat-Operacao'])
        this.loadModal = false;
      },
      error: (e) => {
        this.loadModal = false;
      },
    });
  }

  //Chamar o evento pi-gravar-item-os_leave-item para preparacao de tela
  //Habilitar e desabilitar componentes e iniciar valores
  leaveItem() {
    let itemNaoFormatado = this.formItemOrdem.controls['it-codigo'].value
    if (itemNaoFormatado === null) return
    let itemFormatado=''
    if (itemNaoFormatado!.indexOf('.') === -1){
      itemFormatado = itemNaoFormatado!.substring(0,2) + '.' +
                      itemNaoFormatado!.substring(2,5) + '.' +
                      itemNaoFormatado!.substring(5,10) + '-' +
                      itemNaoFormatado!.substring(10)

        this.formItemOrdem.controls['it-codigo'].setValue(itemFormatado)
    }

    if (
      this.formItemOrdem.controls['it-codigo'].value === '' ||
      this.formItemOrdem.controls['it-codigo'].value === null
    )
      return;

    let params: any = {
      cItCodigo: this.formItemOrdem.controls['it-codigo'].value,
      cRowId: this.ordemSelecionada['c-rowId'],
    };
    this.loadTela = true;
    this.srvTotvs46.LeaveItemOS(params).subscribe({
      next: (response: any) => {
        this.listaStatus = response.statusTela;
        let campos = response.item[0];

        //Setar Valores
        this.formItemOrdem.controls['Quantidade'].setValue(
          campos['Quantidade']
        );
        this.formItemOrdem.controls['nf-saida'].setValue(campos['nf-saida']);
        this.formItemOrdem.controls['Serie-Nf-Saida'].setValue(
          campos['Serie-Nf-Saida']
        );
        this.formItemOrdem.controls['Nat-Operacao'].setValue(
          campos['Nat-Operacao']
        );

        //Campo pr-item.ind-destroi
        if (this.listaStatus[0].valor === 'true') {
          this.formItemOrdem.controls['envelope-seguranca'].enable();
          this.formItemOrdem.controls['serie-ins'].enable();
          this.formItemOrdem.controls['serie-ret'].enable();
        } else {
          this.formItemOrdem.controls['envelope-seguranca'].disable();
          this.formItemOrdem.controls['serie-ins'].disable();
          this.formItemOrdem.controls['serie-ret'].disable();
        }

        //Campo Quantidade e Quantidade Nota Fiscal
        if (this.listaStatus[1].valor === '1') {
          this.formItemOrdem.controls['Quantidade'].disable();
          this.formItemOrdem.controls['nf-saida'].disable();
          //this.formItemOrdem.controls['Serie-Nf-Saida'].disable()
          this.formItemOrdem.controls['Nat-Operacao'].disable();
        } else if (this.listaStatus[1].valor === '2') {
          this.formItemOrdem.controls['Quantidade'].enable();
          this.formItemOrdem.controls['nf-saida'].disable();
          //this.formItemOrdem.controls['Serie-Nf-Saida'].disable()
          this.formItemOrdem.controls['Nat-Operacao'].disable();
        } else {
          this.formItemOrdem.controls['Quantidade'].enable();
          this.formItemOrdem.controls['nf-saida'].enable();
          //this.formItemOrdem.controls['Serie-Nf-Saida'].disable()
          this.formItemOrdem.controls['Nat-Operacao'].disable();
        }

        //Campo Not Avail tipo Uso
        if (this.listaStatus[2].valor === 'false') {
          this.formItemOrdem.controls['nr-enc'].patchValue('0');
          this.formItemOrdem.controls['nr-enc'].disable();
          this.formItemOrdem.controls['tag-enc'].patchValue(false);
          this.formItemOrdem.controls['tag-enc'].disable();
          this.formItemOrdem.controls['Serie-enc'].patchValue('');
          this.formItemOrdem.controls['Serie-enc'].disable();
        } else {
          //Campo pr-filiais.lib-reposicao
          if (this.listaStatus[3].valor === 'true') {
            this.formItemOrdem.controls['nr-enc'].enable();
            this.formItemOrdem.controls['tag-enc'].enable();
          //  this.formItemOrdem.controls['Serie-enc'].enable();
            this.lDisabled = false;
          } else {
            this.formItemOrdem.controls['nr-enc'].disable();
            this.formItemOrdem.controls['tag-enc'].disable();
          //  this.formItemOrdem.controls['Serie-enc'].disable();
            this.lDisabled = true;
          }
          this.formItemOrdem.controls['Serie-enc'].disable();
        }
        this.loadTela = false;
      },
      error: (e) => {
        this.loadTela = false;
      },
    });
  }

  //Checkbox na Tela de Inclusao de Enc
  tagEnc() {
    if (this.formItemOrdem.controls['tag-enc'].value) {
      if (
        this.formItemOrdem.controls['nr-enc'].value !== null &&
        this.formItemOrdem.controls['nr-enc'].value !== '' &&
        this.formItemOrdem.controls['nr-enc'].value !== '0' &&
        this.formItemOrdem.controls['nr-enc'].value !== '999999999'
      ) {
        this.srvDialog.confirm({
          title: 'CONFIRMA ELIMINAÇÃO',
          message: `<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> ENC CADASTRADA, CONFIRMA ELIMINAÇÃO: ${this.formItemOrdem.controls['nr-enc'].value} ?</span></div>`,
          confirm: () => {
            this.loadTela = true;

            let paramsTela: any = {
              nrEnc: this.formItemOrdem.controls['nr-enc'].value,
            };
            this.srvTotvs46.EliminarEnc(paramsTela).subscribe({
              next: (response: any) => {
                this.formItemOrdem.controls['nr-enc'].setValue('999999999');
                this.formItemOrdem.controls['Serie-enc'].setValue('');
                this.formItemOrdem.controls['nr-enc'].disable();
                this.formItemOrdem.controls['Serie-enc'].disable();
                this.loadTela = false;
              },
            });
          },
          cancel: () => this.formItemOrdem.controls['tag-enc'].setValue(false),
        });
      } else {
        this.formItemOrdem.controls['nr-enc'].setValue('999999999');
      }
    } else {
      if (this.formItemOrdem.controls['nr-enc'].value !== '999999999') return;
      this.formItemOrdem.controls['nr-enc'].setValue('0');
      this.formItemOrdem.controls['Serie-enc'].setValue('');
      this.formItemOrdem.controls['nr-enc'].enable();
      this.formItemOrdem.controls['Serie-enc'].disable();
    //  this.formItemOrdem.controls['Serie-enc'].enable();
    }
  }

  onImpressao() {
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
          cRowId: this.listaOrdens[0]['c-rowId'],
        };
        this.srvTotvs46.ImprimirOS(paramsArquivo).subscribe({
          next: (response: any) => {

            //Acompanhar rpw
            this.numPedExec.update(() => response.NumPedExec)

            //Arquivo Gerado
            let params: any = { nrProcess: this.nrProcesso, situacao: 'IOS' };
            this.srvTotvs46.ObterArquivo(params).subscribe({
              next: (item: any) => {
                this.listaArquivos = item.items;
                this.arquivoInfoOS = item.items[0].nomeArquivo;
                }
              });

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

  onIncluirItemOrdem() {
    this.lIncluirItemOrdem=true
    this.limparArquivo()
    this.formItemOrdem.reset();
    //cRowId da Ordem
    this.cRowId = this.ordemSelecionada['c-rowId'];
    this.formItemOrdem.enable();

    //Valores iniciais - valter
    this.formItemOrdem.controls['tag-enc'].setValue(false)
    this.formItemOrdem.controls["nr-enc"].setValue('0')
    this.formItemOrdem.controls['Serie-enc'].disable();
    this.telaIncluirItemOrdem?.open();
  }

  //Usada para Inclusao e Edicao Item Ordem
  okIncluirItemOrdem() {
    this.loadGrid=true
    
    
    let params: any = {
      nrProcess: this.nrProcesso,
      cRowId: this.cRowId,
      itemOS: this.formItemOrdem.getRawValue(),
    };
    this.srvTotvs46.GravarItemOS(params).subscribe({
      next: (response: any) => {
        this.telaIncluirItemOrdem?.close();
        this.formItemOrdem.reset()
        this.formItemOrdem.enable()
        this.atualizarTela()
        },
      error: (e) => {
        
        this.loadGrid = false},
    });
  }

  onAlterarItemOrdem(obj: any) {
    this.selecionarOrdem(obj)
    this.lIncluirItemOrdem=false
    if (obj === undefined) {
      this.srvNotification.warning("Selecione um item da ordem para alterar")
      return
    }

    if(obj["it-codigo"]===''){
      this.srvNotification.error("Não existe item para alterar. Tente a opção de incluir")
      return
    }

    this.limparArquivo()

    this.cRowId = obj['c-rowId-Item'];
    this.formItemOrdem.controls['it-codigo'].disable();
    this.formItemOrdem.controls['Serie-Nf-Saida'].disable();
    this.formItemOrdem.controls['Nat-Operacao'].disable();
    this.formItemOrdem.controls['Quantidade'].disable();
    this.formItemOrdem.controls['envelope-seguranca'].disable();
    this.formItemOrdem.controls['serie-ins'].disable();
    this.formItemOrdem.controls['serie-ret'].disable();
    this.formItemOrdem.controls['Serie-enc'].disable();
    this.formItemOrdem.patchValue(obj);
    this.formItemOrdem.controls['tag-enc'].setValue(Number(obj["nr-enc"]) === 999999999 || Number(obj["nr-enc"]) === 0)

    this.telaIncluirItemOrdem?.open();
  }

  onExcluirItemOrdem(obj: any) {
    this.selecionarOrdem(obj)
    if (obj === undefined) {
      this.srvNotification.warning("Selecione um item da ordem para excluir")
      return
    }

    if(obj["it-codigo"]===''){
      this.srvNotification.error("Não existe item para excluir.")
      return
    }

    this.srvDialog.confirm({
      title: 'CONFIRMAÇÃO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA ELIMINAR REGISTRO ?</span></div>",
      literals: { cancel: 'Não', confirm: 'Sim' },
      confirm: () => {
        this.limparArquivo()
        this.loadGrid=true;
        let params: any = {
          nrProcess: this.nrProcesso,
          cRowId: obj['c-rowId-Item'],
          itemOS: obj,
        };
        this.srvTotvs46.EliminarItemOS(params).subscribe({
          next: (response: any) => {
            this.ordemSelecionada.flag = ''
            this.gridOrdens?.updateItem(obj, this.ordemSelecionada)
            this.atualizarTela()
          },
          error: (e) => {},
        });
      },
      cancel: () => {},
    });
  }

  onNumeroSeriePendente() {}

  onIncluirOrdem() {
    this.limparArquivo()
    this.formOrdem.controls.numOS.setValue(0);
    this.formOrdem.controls.Chamado.setValue(0);
    this.telaIncluirOrdem?.open();
  }

  onAlterarOrdem(obj: any) {
    this.selecionarOrdem(obj)
    this.limparArquivo()
    this.ordemSelecionada = obj;
    this.formOrdem.controls.numOS.setValue(obj.NumOS);
    this.formOrdem.controls.Chamado.setValue(obj.Chamado);
    this.telaAlterarOrdem?.open();
  }

  incluirOrdem() {
    this.limparArquivo()
    this.telaIncluirOrdem?.close();
    this.loadGrid = true;
    //Setar os valores que estao na tela
    this.formOrdem.controls.codEmitente.setValue(
      Number(this.form.controls.codUsuario.value)
    );
    this.formOrdem.controls.codEstabel.setValue(
      this.form.controls.codEstabel.value
    );
    this.formOrdem.controls.moto.setValue(false);

    //Montar as informacoes para enviar para api
    let params: any = { paramsTela: this.formOrdem.value };

    //Criar a Ordem Servico
    this.srvTotvs46.CriarOrdem(params).subscribe({
      next: (response: any) => {
        console.log("Incluir OS", response)
        this.atualizarTela()
      },
      error: (e) => {
        this.loadGrid = false;
        this.telaIncluirOrdem?.close();
      },
    });
  }

  alterarOrdem() {
    this.limparArquivo()
    this.telaAlterarOrdem?.close();
    this.loadGrid = true;
    //Setar os valores que estao na tela
    this.formOrdem.controls.numOS.setValue(this.ordemSelecionada.NumOS);
    this.formOrdem.controls.codEmitente.setValue(Number(this.form.controls.codUsuario.value));
    this.formOrdem.controls.codEstabel.setValue(this.form.controls.codEstabel.value);
    this.formOrdem.controls.moto.setValue(this.form.controls.senha.value === 'moto');

    //Montar as informacoes para enviar para api
    let params: any = { paramsTela: this.formOrdem.value };

    //Alterar a Ordem Servico
    this.srvTotvs46.AlterarOrdem(params).subscribe({
      next: (response: any) => {
        this.loadGrid = false;
        //this.atualizarTela()

        //Atualizar o Grid
        let listaFiltro = this.gridOrdens?.items.filter(item=>item.NumOS === this.ordemSelecionada.NumOS) as any[]
        listaFiltro.forEach(item => {
          item.Chamado = this.formOrdem.controls.Chamado.value
          this.gridOrdens?.updateItem(item, item)
        })
      },
      error: (e) => {
        this.loadGrid = false;
      },
    });
  }

  onExcluirOrdem(obj: any) {
    this.ordemSelecionada = obj;
    this.srvDialog.confirm({
      title: 'CONFIRMAÇÃO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA ELIMINAR REGISTRO ?</span></div>",
      literals: { cancel: 'Não', confirm: 'Sim' },
      confirm: () => {
        this.limparArquivo()
        this.loadGrid = true;
        let params: any = { cRowId: this.ordemSelecionada['c-rowId'] };
        this.srvTotvs46.ExcluirOrdem(params).subscribe({
          next: (response: any) => {
            this.atualizarTela()
            this.srvNotification.success('Registro excluído com sucesso !');
          },
          error: (e) => {
            this.loadGrid = false;
          },
        });
      },
      cancel: () => {},
    });
  }

  selecionarOrdem(obj: any) {

  //  let filtro = (document.querySelector('td.po-table-column-selectable') as HTMLInputElement)
   // console.log("raiz", (filtro))
   // console.log("pai", (filtro.childNodes[0]).setAttribute('ng-reflect-checkbox-value', false))
   // console.log("filho", (filtro.childNodes[0].firstChild))

    //filtro.childNodes.
    
    this.ordemSelecionada = obj;
    this.numSerieItem = obj['num-serie-it']
    this.gridOrdens?.selectRowItem(obj)
   
    this.cOS = obj.NumOS;
    this.cChamado = obj.Chamado;
    this.cTitulo=`ITEMS OS - [ NumOS: ${this.cOS} - Chamado: ${this.cChamado} ]`
    this.edObservacao = obj.edobservacao
    this.itemSelecionado = obj;
    this.formItemOrdem.patchValue(obj);

    //Alert aqui
    //this.gridOrdens?.selectRowItem(obj)
  }

  selecionarItemOrdem(obj: any) {
  
    this.itemSelecionado = obj;
    this.formItemOrdem.patchValue(obj);
    this.edObservacao = obj !== undefined ? obj.edobservacao : '';
  }

  onLogar() {
    this.limparArquivo()
    this.loadTela = true;
    let params: any = {
      codEstabel: this.form.controls.codEstabel.value,
      codUsuario: this.form.controls.codUsuario.value,
      senha: this.form.controls.senha.value,
      origem: 'informe',
    };
    this.srvTotvs46.ObterDados2(params).subscribe({
      next: (response: any) => {
        //Info Estabelecimento e Tecnico Painel Menu
        let estab = this.listaEstabelecimentos.find((o) => o.value === this.form.controls.codEstabel.value);
        let tec = this.listaTecnicos.find((o) => o.value === this.form.controls.codUsuario.value);
        this.srvTotvs.EmitirParametros({
          estabInfo: estab.label,
          tecInfo: tec.label,
        });

        //Cabecalho Accordion
        this.cTag = response.tela[0].os;
        this.mostrarDados = true;

        if (response.ordens !== undefined) {
          //Listas e Observacao
          this.listaOrdens = response.ordens;
          this.listaItens = response.itens;
          this.edObservacao =
            response.itens !== undefined ? response.itens[0].edobservacao : '';

          //Detalhe Painel de Informacoes
          this.cOS = response.ordens[0].NumOS;
          this.cChamado = response.ordens[0].Chamado;
          this.ordemSelecionada = this.listaOrdens[0];
        }

       // let listaRows = this.elementosHTML.nativeElement.querySelectorAll('.po-table-row') as HTMLElement
       // console.log("ListaRows", listaRows)

        //Painel Contadores
        this.cUsadas = response.tela[0].usada;
        this.cBrancas = response.tela[0].branco;
        this.cTotal = response.tela[0].TOTAL;

        //Fechar Painel item 1 e abrir item 2
        this.principal.poAccordionItems.forEach((x) =>
          x.label === 'Informações do Técnico' || x.label === 'Log de Arquivos'
            ? x.collapse()
            : x.expand()
        );

        //Parametros da Nota
        let paramsTec: any = {
          codEstabel: this.form.controls.codEstabel.value,
          codTecnico: this.form.controls.codUsuario.value,
        };

        //Chamar Método
        this.srvTotvs.ObterNrProcesso(paramsTec).subscribe({
          next: (response: any) => {
            //Setar usuario
            this.srvTotvs.SetarUsuario(
              this.form.controls.codEstabel.value!,
              this.form.controls.codUsuario.value!,
              response.nrProcesso
            );

            //Processo ativo
            this.nrProcesso = response.nrProcesso;

            //Atualizar Informacoes Tela
            this.srvTotvs.EmitirParametros({
              processoInfo: response.nrProcesso,
              processoSituacao: response.situacaoProcesso,
            });
          },
        });
        this.loadTela = false;
      },
      error: (e) => {
        this.loadTela = false;
        this.resetarVariaveis();
      },
      complete() {
          //Efetuar a busca
          setTimeout(() => {
            let filtro = (document.querySelector('.po-search-input') as HTMLInputElement)
            filtro.dispatchEvent(new Event('input',{bubbles:true}))
          }, 500);
      },
    });
  }

  atualizarTela() {
    this.limparArquivo()
    let params: any = {
      codEstabel: this.form.controls.codEstabel.value,
      codUsuario: this.form.controls.codUsuario.value,
      senha: this.form.controls.senha.value,
      origem: 'informe',
    };
    this.srvTotvs46.ObterDados2(params).subscribe({
      next: (response: any) => {
        //Info Estabelecimento e Tecnico Painel Menu
        let estab = this.listaEstabelecimentos.find((o) => o.value === this.form.controls.codEstabel.value);
        let tec = this.listaTecnicos.find((o) => o.value === this.form.controls.codUsuario.value);
        this.srvTotvs.EmitirParametros({
          estabInfo: estab.label,
          tecInfo: tec.label,
        });

        //Cabecalho Accordion
        this.cTag = response.tela[0].os;
        this.mostrarDados = true;

        if (response.ordens !== undefined) {
          //Listas e Observacao
          this.listaOrdens = response.ordens;
          this.listaItens = response.itens;
          this.edObservacao =
            response.itens !== undefined ? response.itens[0].edobservacao : '';

          //Detalhe Painel de Informacoes
          this.cOS = response.ordens[0].NumOS;
          this.cChamado = response.ordens[0].Chamado;
        }

        //Painel Contadores
        this.cUsadas = response.tela[0].usada;
        this.cBrancas = response.tela[0].branco;
        this.cTotal = response.tela[0].TOTAL;
        this.selecionarOrdem(this.ordemSelecionada)
        this.loadGrid = false;
      },
      error: (e) => {
        this.loadGrid = false;
        this.resetarVariaveis();
      },
    });
  }

  atualizarContadores() {
    let params: any = {
      codEstabel: this.form.controls.codEstabel.value,
      codUsuario: this.form.controls.codUsuario.value,
    };
    this.srvTotvs46.ObterContadores(params).subscribe({
      next: (response: any) => {
        this.cUsadas = response.tela[0].usada;
        this.cBrancas = response.tela[0].branco;
        this.cTotal = response.tela[0].TOTAL;
      },
      error: (e) => {},
    });

    
  }

  resetarVariaveis() {
    // this.item1.label = 'Informações do Técnico'
    this.srvTotvs.EmitirParametros({
      estabInfo: '',
      tecInfo: '',
      processoInfo: '',
    });
    this.listaOrdens = [];
    this.listaItens = [];
    this.edObservacao = '';
    this.cUsadas = 0;
    this.cBrancas = 0;
    this.cTotal = 0;
    this.cTag = '';
    this.mostrarDados = false;
  }

  //Marcar
  onMarcar(obj: any | null) {

    this.limparArquivo()
    this.ordemSelecionada = obj;
    this.loadGrid = true;
    let params: any = {
      cRowId: this.ordemSelecionada['c-rowId'],
      cItemRowId: this.ordemSelecionada['c-rowId-Item'],
      nrProcess: this.nrProcesso,
    };
    this.srvTotvs46.Marcar(params).subscribe({
      next: (response: any) => {
        this.loadGrid = false;
        this.ordemSelecionada.flag = 'X'
        this.gridOrdens?.updateItem(obj, this.ordemSelecionada)
      },
      error: (e) => {
        this.loadGrid = false;

        //Caso ocorra algum problema 
        this.atualizarTela();
      },
    });
  }

  //Desmarcar
  onDesmarcar(obj: any | null) {
    this.limparArquivo()
    this.ordemSelecionada = obj;
    this.loadGrid = true;
    let params: any = { cRowId: this.ordemSelecionada['c-rowId'], cItemRowId: this.ordemSelecionada['c-rowId-Item'] }

    this.srvTotvs46.Desmarcar(params).subscribe({
      next: (response: any) => {
        this.loadGrid = false;
        this.ordemSelecionada.flag = ''
        this.gridOrdens?.updateItem(obj, this.ordemSelecionada)
      },
      error: (e) => {
        this.loadGrid = false;
      },
    });
  }

  onMarcarMoto(obj: any | null) {
    this.limparArquivo()
    this.ordemSelecionada = obj;
    if (obj.situacao === 'M') return;

    this.srvDialog.confirm({
      title: 'CONFIRMAÇÃO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> ALTERAÇÃO DE STATUS PARA (M) ?</span></div>",
      literals: { cancel: 'Não', confirm: 'Sim' },
      confirm: () => {
        this.loadGrid=true
        let params: any = { cRowId: this.ordemSelecionada['c-rowId'] };
        this.srvTotvs46.MarcarMoto(params).subscribe({
          next: (response: any) => {
            this.atualizarTela()
            
          },
          error: (e) => {
          },
        });
      },
      cancel: () => {},
    });
  }

  onDesmarcarMoto(obj: any | null) {
    this.limparArquivo()
    this.ordemSelecionada = obj;
    if (obj.situacao !== 'M') return;

    this.srvDialog.confirm({
      title: 'CONFIRMAÇÃO',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> ALTERAÇÃO DO STATUS PARA (U) ?</span></div>",
      literals: { cancel: 'Não', confirm: 'Sim' },
      confirm: () => {
        this.loadGrid=true
        let params: any = { cRowId: this.ordemSelecionada['c-rowId'] };
        this.srvTotvs46.DesmarcarMoto(params).subscribe({
          next: (response: any) => {
            this.atualizarTela()
          },
          error: (e) => {
            this.loadGrid = false;
          },
        });
      },
      cancel: () => {},
    });
  }

  //Selecionar OS
  onSelecionarOS(obj?: any | null) {
  }

  public onTecnicoChange(obj:string){
    //Limpar listas
    this.listaOrdens=[]
    this.listaItens=[]
    this.mostrarDados=false
  }

  public onEstabChange(obj: string) {
    
    //Limpar listas
    this.listaOrdens=[]
    this.listaItens=[]
    this.mostrarDados=false

    if (obj === undefined) return;

    //Popular o Combo do Emitente
    this.listaTecnicos = [];
    this.loadTecnico = `Populando técnicos do estab ${obj} ...`;

    //Chamar servico
    this.srvTotvs46.ObterEmitentesDoEstabelecimento(obj).subscribe({
      next: (response: any) => {
        delay(200);
        this.listaTecnicos = response;
        this.loadTecnico = 'Selecione o técnico';
      },
      //error: (e) => this.srvNotification.error("Ocorreu um erro na requisição " ),
    });
  }

  public downloadTxt(filename: string, text: string) {
    var element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    );
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  onAbrirArquivo(obj: any) {
    this.nomeArquivo = obj.nomeArquivo ?? obj;
    let params: any = { nomeArquivo: obj.nomeArquivo ?? obj };

    /*--- Codigo Desativado

    this.loadTela = true;
    this.srvTotvs.AbrirArquivo(params).subscribe({
      next: (response: any) => {
        this.conteudoArquivo = response.arquivo
          .replace(/\n/gi, '<br>')
          .replace(/\40/gi, '&nbsp;')
          .replace(//gi, '<br>');
        this.loadTela = false;
        this.abrirArquivo?.open();
      },
      error: (e) => {
        this.loadTela = false;
      },
    });
    */
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
       /// .replace(/\40/gi, '&nbsp;')
        .replace(//gi, '<br>')
    );
    win?.document.write('</p></body></html>');
    win?.print();
    win?.document.close();
    win?.close();
  }

}
