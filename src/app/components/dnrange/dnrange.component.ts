import { Component, computed, effect, EventEmitter, input, Input, Output, output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InicioFim } from '../../interfaces/inicio-fim';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'dn-range',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,  NgxMaskDirective],
    templateUrl: './dnrange.component.html',
  styleUrl: './dnrange.component.css'
})
export class DnrangeComponent {
   
  @Input() clabel!:string
  @Input() cmask:string=''
  @Input() cini:string=''
  @Input() cfim:string=''
  @Output() ciniChange = new EventEmitter<string>();
  @Output() cfimChange = new EventEmitter<string>();

  retorno(): void {
    this.ciniChange.emit(this.cini)
    this.cfimChange.emit(this.cfim)
  }
}
