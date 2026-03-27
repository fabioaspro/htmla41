import { Component, OnInit, inject } from '@angular/core';
import { TotvsService } from '../../services/totvs-service.service';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { PoModule } from '@po-ui/ng-components';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: true,
    imports: [RouterLink, PoModule]
})
export class HomeComponent {
  versao!:string


  srvTotvs = inject(TotvsService)

  ngOnInit(): void {
    //versao
    this.versao = environment.versao

    //--- Informacoes iniciais tela
    this.srvTotvs.EmitirParametros({tituloTela: 'MENU PRINCIPAL - SELECIONE UMA DAS OPÇÕES', abrirMenu: false})
  }

 
  //Variavel ROWID Global
  //def new global shared var gr-ped-venda  as rowid
  //gr-ped-venda = 0x000000003f0f2186
  //run pdp/pd1001.r.
  onChamarPD1001() {
    let params={RowId: "0x000000003f0f2186"}
    this.srvTotvs.AbrirProgramaTotvs(params).subscribe({
      next: (response: any) => {
        //console.log(response)
        
      }})
  
  }

  onObterVariaveisGlobais() {
    
    this.srvTotvs.ObterVariaveisGlobais().subscribe({
      next: (response: any) => {
        //console.log(response)
        //alert(response.UsuarioLogado)
      }})
    
  }

  

}
