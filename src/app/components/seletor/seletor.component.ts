import { ChangeDetectionStrategy, Component, ElementRef, Signal, ViewChild, WritableSignal, inject, signal } from '@angular/core';
import { PoAccordionModule, PoButtonModule, PoFieldModule, PoIconModule, PoTableComponent, PoTableModule, PoTabsModule} from '@po-ui/ng-components';
import { LoginComponent } from "../../login/login.component";
import { CardComponent } from '../card/card.component';
import { PoTableBaseComponent } from '@po-ui/ng-components/lib/components/po-table/po-table-base.component';
import { TotvsService } from '../../services/totvs-service.service';
import { DninputComponent } from "../dninput/dninput.component";
import { DnrangeComponent } from '../dnrange/dnrange.component';
import { InicioFim } from '../../interfaces/inicio-fim';




@Component({
    selector: 'app-seletor',
    templateUrl: './seletor.component.html',
    styleUrls: ['./seletor.component.css'],
    standalone: true,
    imports: [
    PoFieldModule,
    PoTabsModule,
    PoIconModule,
    PoButtonModule,
    PoButtonModule,
    PoAccordionModule,
    PoTableModule,
    DninputComponent,
    DnrangeComponent
]
})

export class SeletorComponent {
  cDescricao:string = "mouse"

  estabIniFim!:InicioFim
  serieIniFim!:InicioFim
  itemIniFim!:InicioFim

  valEstabIni="0"
  valEstabFim="1"



  @ViewChild('grid', { static: true }) gridDetalhe: PoTableComponent | undefined;
  private srvTotvs = inject(TotvsService)

  public lista=[{campo:true}, {campo:false}]

  constructor(private el: ElementRef) {
  }
  
Executar(event:any){
  console.log(event)
} 


onMostrar() {
  console.log("Inicial:" + this.valEstabIni + " Final:" + this.valEstabFim)
}

selecionar(obj:any){
 // let marcador = (document.querySelector('td.po-table-column-selectable') as HTMLInputElement)
 // let check = marcador.firstChild?.firstChild
 let marcador = (document.querySelector('div.container-po-checkbox') as HTMLInputElement)
 marcador.setAttribute("checked", "false")
 
  
  console.log(marcador)
 
 

  

 // let elementos = document.querySelectorAll<HTMLElement>('td.po-table-column-selectable') 
 //   elementos.forEach(item => item.style.display = 'none')

    
   // console.log("raiz", (filtro))
   // console.log("pai", (filtro.childNodes[0]).('ng-reflect-checkbox-value', false))
}

naoSelecionar(obj:any){
  //let marcador = (document.querySelector('td.po-table-column-selectable') as HTMLInputElement)
  //console.log(marcador)
  alert("vou desmarcar")
  this.gridDetalhe?.unselectRowItem(obj)
 
  

}
ngOnInit(): void {
  this.srvTotvs.EmitirParametros({ tituloTela: 'htmlESRR017 - Consulta de Reparos', estabInfo:''});

}


}
