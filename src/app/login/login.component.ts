import { Component, computed, effect, inject, input, output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PoAccordionModule, PoButtonModule, PoFieldModule, PoIconModule, PoLoadingModule, PoModalAction, PoModalComponent, PoModalModule, PoTableModule, PoTooltipModule, PoWidgetModule } from '@po-ui/ng-components';
import { TotvsService } from '../services/totvs-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
            PoLoadingModule,
            PoButtonModule,
            PoTooltipModule,
            PoAccordionModule,
            PoWidgetModule,
            PoTableModule,
            PoModalModule,
            PoFieldModule, 
            FormsModule, 
            PoIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  //---ViewChild
  @ViewChild('loginModal', { static: true }) loginModal: | PoModalComponent | undefined;

  //---Injection
  private srvTotvs = inject(TotvsService);

  //Signals variaveis
  chamarLogin = input(false)
  efetuarLoginEvent = output<{autenticado:boolean, mensagem:string}>();

  //---Variaveis
  listaEstabel!: any[];
  codEstabel: string = '';
  codUsuario: string = '';
  senha:string=''

  //---Actions
   //----- Tela Login
  acaoLogin: PoModalAction = {
    action: () => {
      this.onLogarUsuario()
    },
    label: 'Login',
    
  };
  
  acaoLoginCancel: PoModalAction = {
    action: () => {
      this.onCancelar()
      
    },
    label: 'Cancelar'
  };

  onCancelar(){
    this.loginModal?.close()
   
  }

  //contructor
  constructor(){
    effect(() => {
     // alert(this.chamarLogin())
      if (this.chamarLogin()) {
        this.acaoLogin.loading=false
        this.codUsuario=''
        this.senha=''
        this.loginModal?.open()
      }
    })
  }

  ngOnInit(): void {
    this.srvTotvs.ObterEstabelecimentos().subscribe({
      next: (response: any) => {
        this.listaEstabel = (response as any[]).sort(this.srvTotvs.ordenarCampos(['label']))
      },
    });
  }

  //---- Acao Login
  onLogarUsuario(){
    //Acompanhamento
    this.acaoLogin.loading=true;

    //Popular parametros de tela
    let paramsLogin: any = {CodEstabel: this.codEstabel, CodUsuario: this.codUsuario, Senha: this.senha}

    //Chamar servico de login
    this.srvTotvs.LoginAdmin(paramsLogin).subscribe({
      next: (response: any) => {
        if (response.senhaValida){
            //Acompanhamento
            this.acaoLogin.loading=false

            //Fechar janela
            this.loginModal?.close()

            //Chamar rotina de aprovacao passando o Tipo de Aprovacao
            this.efetuarLoginEvent.emit({autenticado:true, mensagem:''})
        }
        else{
          this.acaoLogin.loading=false
          this.efetuarLoginEvent.emit({autenticado:false, mensagem:response.mensagem})
        
         
  }}})
  }  


}
