import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PoDialogService, PoNotificationService, PoTableColumn, PoTableLiterals, PoLoadingModule, PoWidgetModule, PoButtonModule, PoTableModule, PoModalModule, PoModalComponent, PoModalAction } from '@po-ui/ng-components';
import { TotvsService } from '../../services/totvs-service.service';
import { TotvsService46 } from '../../services/totvs-service-46.service';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../interfaces/usuario';
import { BtnDownloadComponent } from '../btn-download/btn-download.component';
import { NgClass, NgIf } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { RpwComponent } from "../rpw/rpw.component";


@Component({
    selector: 'app-resumo-final',
    templateUrl: './resumo-final.component.html',
    styleUrl: './resumo-final.component.css',
    standalone: true,
    imports: [NgIf, PoLoadingModule, PoWidgetModule, PoButtonModule, PoTableModule, BtnDownloadComponent, PoModalModule,NgClass,RpwComponent]
})
export class ResumoFinalComponent implements OnInit {
  private srvTotvs = inject(TotvsService)
  private srvTotvs46 = inject(TotvsService46)
  private srvDialog  = inject(PoDialogService)
  private srvNotification = inject(PoNotificationService)
  private router = inject(Router)


  @ViewChild('timer', { static: true }) telaTimer:
  | PoModalComponent
  | undefined;

  numPedExec=signal(0)
  arquivoInfoOS:string=''
  urlInfoOs:string=''
  urlSpool:string=''
  listaArquivos!:any[]
  colunasArquivos!: PoTableColumn[]
  nrProcess:string=''
  codEstabel:string=''
  loadTela:boolean=false

  labelTimer:string='Aguarde a liberação do arquivo...'
  labelTimerDetail:string=''
  labelPedExec:string=''
  telaTimerFoiFechada:boolean=false
  sub!: Subscription;
  
  
  acaoCancelarTimer: PoModalAction = {
    action: () => {
      this.fecharTimer()
      
    },
    label: 'Fechar',
  };

  fecharTimer(){
    if(this.sub !== undefined){
       this.sub.unsubscribe()
    }
    this.telaTimer?.close()
    this.telaTimerFoiFechada=true
  }

   //---Inicializar
   ngOnInit(): void {

    this.srvTotvs46
      .ObterCadastro({tabela: 'spool', codigo: ''})
      .subscribe({
        next: (response: any) => {
          this.urlSpool = response.desc
        }})

    this.colunasArquivos = this.srvTotvs46.obterColunasArquivos()

    //--- Titulo Tela
    this.srvTotvs.EmitirParametros({tituloTela: 'HTMLA41 - RESUMO CONFERÊNCIA DE OS'})

    //--- Login Unico
    this.srvTotvs.ObterUsuario().subscribe({
      next:(response:Usuario)=>{
        
       
        if (response === undefined){
          this.srvTotvs.EmitirParametros({estabInfo:''})
        }
        else{
          this.nrProcess = response.nrProcesso
          this.codEstabel = response.codEstabelecimento

          //Arquivo Gerado
          let params:any={nrProcess: response.nrProcesso, situacao:'L'}
          this.srvTotvs46.ObterArquivo(params).subscribe({
            next:(item:any)=>{
              if(item === null) return
              this.listaArquivos = item.items ?? null
            }
          })

      }}})
  }

  onGerarResumo(){
     this.srvDialog.confirm({
      title: 'ARQUIVO CONFERÊNCIA DE OS',
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> GERAR ARQUIVO ?</span></div>",
        confirm: () => {
          this.loadTela = true;
          let params:any={iExecucao:2, nrProcess:this.nrProcess}
          this.srvTotvs.ImprimirConfOS(params).subscribe({
            next:(response:any)=>{

              let params2:any={nrProcess: this.nrProcess, situacao:'L'}
              this.srvTotvs46.ObterArquivo(params2).subscribe({
                next:(item:any)=>{
                  if(item === null) return
                  this.listaArquivos = item.items ?? null
                }
              })

              this.loadTela = false;
              this.srvNotification.success('Gerado pedido de execução : ' + response.NumPedExec);
            },
            error: (e) => {
              this.loadTela = false;
            }})
        },
        cancel: () => {}
      });
  }

  onImpressao() {
    this.srvDialog.confirm({
      title: 'ARQUIVO CONFERÊNCIA DE OS',
      literals: { cancel: 'Cancelar', confirm: 'Gerar Arquivo' },
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> GERAR ARQUIVO ?</span></div>",
      confirm: () => {
        this.numPedExec.update(()=> 1)
       // this.telaTimerFoiFechada = false
      //  this.labelPedExec = ''
       // this.labelTimer = 'Gerando pedido de execução ...'
       // this.labelTimerDetail = ''
       // this.acaoCancelarTimer.label='Fechar'
       // this.telaTimer?.open()

        //this.loadTela = true;
        let params:any={iExecucao:2, nrProcess:this.nrProcess}
        this.srvTotvs.ImprimirConfOS(params).subscribe({
            next: (response: any) => {
             // this.labelPedExec = 'Pedido Execução'
             // this.labelTimer = 'Coletando informações do rpw...'
             

              //Arquivo Gerado
              let params2:any={nrProcess: this.nrProcess, situacao:'L'}
              this.srvTotvs46.ObterArquivo(params2).subscribe({
                   next: (item: any) => {
                this.listaArquivos = item.items;
                this.numPedExec.update(()=> response.NumPedExec)
               
               /* if (!this.telaTimerFoiFechada){
                  this.sub = interval(5000).subscribe(n => {
                     // console.log(n) 
                      this.labelPedExec = 'Pedido Execução: ' + response.NumPedExec + ' (' + (n * 5).toString() + 's)'
                      this.labelTimer = 'Aguarde a liberação do arquivo...  '

                      //Limitar o numero de calls em 15
                      if (n > 55){
                        this.sub.unsubscribe()
                        this.telaTimer?.close()
                      }

                      if(this.listaArquivos[0] === undefined) return
                      let param:any={numRPW:this.listaArquivos[0].numPedExec}
                      this.srvTotvs46.piObterSituacaoRPW(param).subscribe({
                        next: (response:any)=> {
                          
                          if (response.ok){
                            this.sub.unsubscribe()
                            this.labelPedExec = 'Pedido Execução: Executado com sucesso'
                            this.labelTimer = "Arquivo liberado !"
                            this.labelTimerDetail = "Utilize o Log de Arquivos para visualizar o arquivo gerado"
                            this.acaoCancelarTimer.label='Fechar'
                          }
                        }
                      })
                      
                  })
                }
                else
                  this.telaTimerFoiFechada = false
                */
              },
            });

            this.loadTela = false;
           
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


  onFinalizar(){
    this.srvDialog.confirm({
      title: `FINALIZAR PROCESSO: ${this.nrProcess}`,
      message: "<div class='dlg'><i class='bi bi-question-circle po-font-subtitle'></i><span class='po-font-text-large'> DESEJA FINALIZAR O PROCESSO ?</span></div>",
        confirm: () => {
          this.loadTela = true;
          
          let params:any={codEstabel:this.codEstabel, nrProcess:this.nrProcess}
          this.srvTotvs.EncerrarProcesso(params).subscribe({
            next:(response:any)=>{
              this.loadTela = false;
              this.router.navigate(['monitor'])
            },
            error: (e) => {
              this.loadTela = false;
            }})
        },
        cancel: () => {}
      });


  }
}
