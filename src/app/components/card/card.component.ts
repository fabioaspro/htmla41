import { Component, EventEmitter, Input, numberAttribute, Output } from '@angular/core';
import { NgClass } from '@angular/common';


@Component({
    selector: 'cardResumo',
    templateUrl: './card.component.html',
    styleUrl: './card.component.css',
    standalone: true,
    imports: [NgClass]
})

export class CardComponent {

  //Propriedades 
  @Input() tipo: "black" | "blue" | "green" | "yellow" | "lemon" | "red" = "black"
  @Input({transform:numberAttribute}) cont:number=0
  @Input() cabec:string=''
  @Input() desc:string=''

  //Evento
  @Output() clickBotao: EventEmitter<any>=new EventEmitter()

  numPedExec = "600700"

  ngOnInit() { }

  execFunction(){

  //Vai chamar o rpw e receber o numero do pedido de execucao

    this.clickBotao.emit({numPedExecucao: this.numPedExec, mensagem: "Execucao com sucesso"})
  }

}
