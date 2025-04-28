import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PoComboComponent, PoDialogComponent, PoDialogService, PoMenuItem, PoModalAction, PoModalComponent, PoNotificationService, PoTableAction, PoTableColumn, PoButtonModule, PoTableModule, PoInfoModule, PoModalModule, PoFieldModule, PoIconModule, PoDividerModule } from '@po-ui/ng-components';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TotvsService } from '../../services/totvs-service.service';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
    selector: 'app-paramestab',
    templateUrl: './paramestab.component.html',
    styleUrls: ['./paramestab.component.css'],
    standalone: true,
    imports: [PoButtonModule, PoTableModule, PoInfoModule, PoModalModule, FormsModule, ReactiveFormsModule, NgIf, PoFieldModule, PoIconModule, PoDividerModule]
})
export class ParamestabComponent {
  private srvTotvs = inject(TotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvDialog = inject(PoDialogService)
  private formBuilder = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router)

  //---------- Acessar a DOM
  @ViewChild('cadModal', { static: true }) cadModal: | PoModalComponent | undefined
  @ViewChild('codEstabel', { static: true }) comboEstab: | PoComboComponent | undefined
  @ViewChild('loginModal', { static: true }) loginModal: PoModalComponent | undefined;

   //Formulario
   public form = this.formBuilder.group({
    codEstabel: ['', Validators.required],
    codTranspEntra: [1, Validators.required],
    codTranspSai: [1, Validators.required],
    codEntrega: ['Padrão', Validators.required],
    serieEntra: ['', [Validators.required, Validators.minLength(2)]],
    serieSai: ['', Validators.required],
    rpw: ['', Validators.required],
    nomeTranspEnt: [''],
    nomeTranspSai: [''],
    nomeEstabel: [''],
  });
  loadBotao:boolean=false;

  acaoLogin: PoModalAction = {
    action: () => {
      this.onLogarUsuario();
    },
    label: 'Login',
    
  };

  acaoLoginCancel: PoModalAction = {
    action: () => {
      this.router.navigate(['home'])
    },
    label: 'Cancelar'
  };


  readonly acaoLogar: PoModalAction = {
    action: () => { this.onLogarUsuario()}, label: 'Login' };

  codUsuario:string=''
  senha:string=''


  //Declaracao de Variaveis
  alturaGrid:number=window.innerHeight - 205
  codEmitente: number = 0
  codEmitenteNaoTipado: any = 0 

  nomeEmitente: string = ''
  nomeEmitenteNaoTipado: any = ''
  
  codEstabelecimento:string=''
  listaEmitente: string[] = []
  listaEmitenteNaoTipada: any[] = []




  //---Variaveis
  loadTela: boolean = false
  nomeEstabel:string=''
  nomeEstabelSelecionado:string=''
  tipoAcao:string=''

  //ListasCombo
  listaEstabelecimentos!: any[]
  listaTransp!: any[]

  //---Grid
  colunas!: PoTableColumn[]
  lista!: any[]

  //--- Actions
  readonly opcoes: PoTableAction[] = [
    {
      label: 'Editar',
      icon: 'bi bi-pencil-square',
      action: this.onEditar.bind(this),
    },
    {
      label: 'Copiar',
      icon: 'bi bi-copy',
      action: this.onCopiar.bind(this),
    },

    {
      separator:true,
      label: 'Deletar',
      icon: 'bi bi-trash',
      action: this.onDeletar.bind(this),
      type:'danger'
    }];

  
  readonly acaoSalvar: PoModalAction = {
    label: 'Salvar',
    action: () => { this.onSalvar() }
  }

  readonly acaoCancelar: PoModalAction = {
    label: 'Cancelar',
    action: () => { this.cadModal?.close() }
  }

  cliqueDoBotal(){
    alert ("botao acionado")
  }

  onLogarUsuario(){
    this.acaoLogin.loading=true;
    let paramsLogin: any = {CodEstabel: this.codEstabelecimento, CodUsuario: this.codUsuario, Senha: this.senha}
    //Chamar servico de login
    this.srvTotvs.LoginAdmin(paramsLogin).subscribe({
      next: (response: any) => {
           if(response.senhaValida){
            this.acaoLogin.loading=false;
               this.loginModal?.close()
               this.listar();
              
              }
            else{
              this.acaoLogin.loading=false;
              this.srvNotification.error(response.mensagem)
            }  
        }
      })
    }


  //---Inicializar
  ngOnInit(): void {
    this.loadTela=true;

    //--- Titulo Tela
    this.srvTotvs.EmitirParametros({estabInfo:'', tecInfo:'', processoInfo:'', tituloTela: 'HTMLA41 - PARÂMETROS DA FILIAL', dashboard: false})

    //Colunas do grid
    this.colunas = this.srvTotvs.obterColunas()

    //Tempo Mensagem
    this.srvNotification.setDefaultDuration(3000)
    
    //Carregar combo de estabelecimentos
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
        this.listaEstabelecimentos = (response as any[]).sort(
          this.srvTotvs.ordenarCampos(['label']))
          this.loginModal?.open()
          this.loadTela=false
          this.codEstabelecimento= this.listaEstabelecimentos[0].value
      },
      error: (e) => {
        //this.srvNotification.error('Ocorreu um erro na requisição')
        return
      },
    });

    //Carregar combo transportadoras
    this.srvTotvs.ObterTransportadoras().subscribe({
      next: (response: any) => {
        this.listaTransp = (response as any[]).sort(
          this.srvTotvs.ordenarCampos(['label'])
        )
      },
     // error: (e) => this.srvNotification.error('Ocorreu um erro na requisição'),
    })

    //Aplicar changes na tela
    this.cdRef.detectChanges()
  }

  //---Listar registros grid
  listar() {
    this.loadTela = true;

    this.srvTotvs.Obter().subscribe({
      next: (response: any) => {
        if (response === null) return
        this.lista = response.items
        this.loadTela = false
      },
      error: (e) => {/*this.srvNotification.error('Ocorreu um erro na requisição')*/
                    this.loadTela=false},
    });
  }

  //---Novo registro
  onNovo() {
    this.form.reset()
    this.onEditar(null)
    this.tipoAcao='I'
  }

  //---Editar registro
  onEditar(obj: any | null) {
    this.cadModal?.open()
    this.nomeEstabel = ''

    //hashtag amamos Progress 4gl
    if ((obj !== null) && (obj['$showAction'] !== undefined))
       delete obj['$showAction']

    if (obj !== null) {
      this.nomeEstabel = obj.nomeEstabel
      this.tipoAcao='E'
      this.form.patchValue(obj)
    }
  }

   //---Editar registro
   onCopiar(obj: any | null) {
    this.cadModal?.open()
    this.nomeEstabel = obj.nomeEstabel
    this.tipoAcao='C'
    this.form.patchValue(obj)
  }

  //---Deletar registro
  onDeletar(obj: any | null) {
    let paramTela:any={codEstabel:obj.codEstabel}
    
    this.srvDialog.confirm({
      title: "DELETAR REGISTRO",
      message: `<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA EXCLUSÃO: ${obj.nomeEstabel} ?</span></div> `,
      confirm: () => {
        this.loadTela = true
        this.srvTotvs.Deletar(paramTela).subscribe({
          next: (response: any) => {
            this.srvNotification.success('Registro eliminado com sucesso')
            this.listar()
          },
         // error: (e) => this.srvNotification.error('Ocorreu um erro na requisição'),
        })
      },
      cancel: () => this.srvNotification.error("Cancelada pelo usuário")
    })
  }
  
  //---Salvar registro
  onSalvar() {
    if (!this.form.valid) {
      this.srvNotification.error('Preencha todos os campos');
      return
    }

    //Dados da tela
    let paramsTela: any = { paramsTela: this.form.value }
    this.cadModal?.close();

    //Chamar o servico
    this.srvTotvs.Salvar(paramsTela).subscribe({
      next: (response: any) => {
        this.listar();
      },
      error: (e) => {
       // this.srvNotification.error('Ocorreu um erro na requisição ')
      },
    })
  }

 
}
