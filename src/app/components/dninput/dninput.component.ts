import { Component, Input } from '@angular/core';
import { PoButtonModule, PoFieldModule, PoIconModule, PoTabsModule } from '@po-ui/ng-components';

@Component({
  selector: 'dn-input',
  standalone: true,
  imports: [PoFieldModule,
         PoTabsModule,
         PoIconModule,
         PoButtonModule,
        PoButtonModule,],
  templateUrl: './dninput.component.html',
  styleUrl: './dninput.component.css'
})
export class DninputComponent {

  //Propriedades 
    
    @Input() label:string=''
     @Input() text:string=''
    @Input() width:number=300
  

}
