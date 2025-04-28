import { Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PoDialogService, PoModalAction, PoModalComponent, PoNotificationService, PoRadioGroupOption, PoTableAction, PoTableColumn, PoTableComponent, PoLoadingModule, PoButtonModule, PoWidgetModule, PoTableModule, PoModalModule, PoFieldModule, PoRadioGroupModule } from '@po-ui/ng-components';

import { Usuario } from '../../interfaces/usuario';
import { TotvsService } from '../../services/totvs-service.service';
import { NgIf } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
    selector: 'app-embalagem',
    templateUrl: './embalagem.component.html',
    styleUrls: ['./embalagem.component.css'],
    standalone: true,
    imports: [NgIf, 
              PoLoadingModule, 
              PoButtonModule, 
              PoWidgetModule, 
              PoTableModule, 
              PoModalModule, 
              FormsModule, 
              ReactiveFormsModule,
              PoFieldModule, 
              PoRadioGroupModule,
              NgxMaskDirective,
              NgxMaskPipe
              ]
})
export class EmbalagemComponent {

  @ViewChild('tela', { static: true }) tela: | PoModalComponent | undefined;
  @ViewChild('grid', { static: true }) grid!: | PoTableComponent;

  //---Injection
  private srvTotvs = inject(TotvsService);
  private srvNotification = inject(PoNotificationService);
  private srvDialog = inject(PoDialogService);
  private router = inject(Router)
  private formBuilder = inject(FormBuilder);

  codEstabel: string = '';
  codUsuario: string = '';
  nrProcess:string='';
  titleEmbal:string=''
  loadTela:boolean=false
  listaGrid!:any[]
  colunas!:any[]
  infoPrimeiraNota!:{"cod-estabel":'', "serie": '', "nr-nota-fis": ''}

  pesoBruto:number=0
  

  readonly acoes: PoTableAction[] = [
    {
      label: '',
      icon: 'bi bi-pencil-square',
      action: this.onEditar.bind(this),
    },
    
    ];

    readonly acaoSalvar: PoModalAction = {
      label: 'Salvar',
      action: () => { this.onSalvar() }
    }  

    //--------- Opcoes de Calculo (Resumo)
readonly options: Array<PoRadioGroupOption> = [
  { label: 'Aéreo', value: 1 },
  { label: 'Rodoviário', value: 2 },
];

    //Formulario
   public form_ = this.formBuilder.group({
    'nr-process': ['', Validators.required],
    'qt-volume': ['', Validators.required],
    'cod-embal': [''],
    'qt-embal': [''],
    'peso-liq': [0.001],
    'peso-bru': [0.001],
    'modal':[2]
    
  });
  

   ngOnInit(): void {
      this.infoPrimeiraNota={"cod-estabel":'', "serie": '', "nr-nota-fis": ''}
      this.srvTotvs.EmitirParametros({tituloTela: 'HTMLA41 - INFORMAÇÕES DE EMBALAGEM'});
      this.colunas=this.srvTotvs.obterColunasEmbalagem()
      this.loadTela=true

      //Login Unico
      this.srvTotvs.ObterUsuario().subscribe({
        next:(response:Usuario)=>{
          
          if(response ===undefined) return
            this.codEstabel = response.codEstabelecimento
            this.codUsuario = response.codUsuario
            this.nrProcess  = response.nrProcesso
            this.form_.controls.modal.setValue(2);
            this.listaGrid = ([{'nr-process':response.nrProcesso, 'qt-volume':'0', 'cod-embal':'', 'qt-embal':'0', 'peso-liq':'0.001', 'peso-bru':'0.001', 'modal': 2}])
            this.form_.setValue(this.listaGrid[0])
        }
      })

      let paramsNota: any = {CodEstab: this.codEstabel,CodTecnico: this.codUsuario, NrProcess: this.nrProcess}
      this.srvTotvs.ObterPrimeiraNota(paramsNota).subscribe({
        next: (response: any) => {
          if ((response.nfs as any[]).length > 0){
            this.infoPrimeiraNota = response.nfs[0];
            this.titleEmbal = `Embalagem Nota: ${this.infoPrimeiraNota["cod-estabel"]}-${this.infoPrimeiraNota["serie"]}-${this.infoPrimeiraNota["nr-nota-fis"]}`
            
          }
          this.loadTela=false
        },
        error: (e) => {this.loadTela=false},
      });
     }

     onNovo(){
      this.tela?.open()
     }

     onEditar(){
      this.form_.patchValue(this.listaGrid[0])
      this.onAlterarModal(this.form_.controls.modal.value)
      this.tela?.open()
     }

     onEfetivar(){

      this.srvDialog.confirm({
        title: "DADOS DE EMBALAGEM",
        message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> CONFIRMA EFETIVAÇÃO ?</span></div>",
        confirm: () => {
          this.loadTela = true

          //Trocar Separador decimal
          this.listaGrid.forEach(x => {
            x['qt-volume'] = x['qt-volume'].replace(',', '.') 
            x['peso-liq'] = x['peso-liq'].replace(',', '.') 
            x['peso-bru'] = x['peso-bru'].replace(',', '.') 

          })
          let dadosNota:any= {"cod-estabel": this.infoPrimeiraNota["cod-estabel"], 
                               "serie": this.infoPrimeiraNota["serie"], 
                               "nr-nota-fis": this.infoPrimeiraNota["nr-nota-fis"]}

          let paramsTela: any = {paramsTela: { ...dadosNota, ...this.listaGrid[0] }}
          
          this.srvTotvs.InformarEmbalagem(paramsTela).subscribe({
            next: (response: any) => {
              
              this.loadTela = false
              //this.form_.disable()
              // this.listaGrid=[]
              //this.srvTotvs.EmitirParametros({processoSituacao: 'FINALIZADO'});
              // this.srvDialog.alert({title:"PROCESSO FINALIZADO", message:"Informações de Embalagem gravadas com sucesso ! "})
              
              //this.srvNotification.success("Dados gravados com sucesso. Processo Finalizado !!!")
              this.router.navigate(['monitor'])
            },
          })
        },
        cancel: () => this.srvNotification.error("Cancelada pelo usuário")
      })
     }

     onSalvar(){
        if (!this.form_.valid)
          this.srvNotification.error("Informações de embalagens não foram preenchidas corretamente")
        else{
          this.listaGrid[0] = this.form_.value 
          this.grid.items = this.listaGrid
          this.tela?.close()
        }
     }

     onAlterarModal(opcao:any){
      if (opcao === 1){
        this.form_.controls['cod-embal'].enable()
        this.form_.controls['qt-embal'].enable()
      }
      else {
        this.form_.controls['cod-embal'].disable()
        this.form_.controls['qt-embal'].disable()
      }

     }
}
