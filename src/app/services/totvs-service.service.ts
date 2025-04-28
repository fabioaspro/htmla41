import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Subscription, map, of, take, tap } from 'rxjs';
import { Observable } from 'rxjs';

import { PoHttpRequestInterceptorService, PoTableColumn, PoTableDetail } from '@po-ui/ng-components';
import { Usuario } from '../interfaces/usuario';
import { Monitor } from '../interfaces/monitor';
import { environment } from '../../environments/environment';
import { Reparo } from '../interfaces/reparo';

//--- Header somente para DEV
const headersTotvs = new HttpHeaders(environment.totvs_header);


@Injectable({
  providedIn: 'root',
})
export class TotvsService {
  //Signals
  usuarioSelecionado: WritableSignal<Usuario> = signal({
    codUsuario: '',
    codEstabelecimento: '',
    nrProcesso: '',
  });
  codTransEnt = signal('');
  codTransSai = signal('');
  codEntrega = signal('');
  serieSaida = signal('');
  serieEntra = signal('');

  public alturaGrid:number=window.innerHeight - 255

  //Lista Transportadora e Entrega
  listaTransp = signal<any[]>([]);
  listaEntrega = signal<any[]>([]);

  public PopularListaEntrega(lista: any) {
    this.listaEntrega.update(lista);
  }

  public SetarUsuarioAmbiente(usuario: Usuario) {
    this.usuarioSelecionado.set(usuario);
  }

  public ObterUsuarioAmbiente() {
    return this.usuarioSelecionado;
  }

  private reg!: any;
  _url = environment.totvs_url;
  subscription!: Subscription;
  pendingRequests: number = 0;
 

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    console.log ("entrou service")
    
  }

  //--- Variavel
  private emissorEvento$ = new Subject<any>();

  //--- Emissor
  public EmitirParametros(valor: any) {
    this.emissorEvento$.next(valor);
  }

  //--- Observador
  public LerParametros() {
    return this.emissorEvento$.asObservable();
  }

  //--------------------- INTERPRETADOR RESULTADO DE ERROS/WARNING
  public tratarErros(mensagem: any): string {
    if (mensagem.messages == undefined) return mensagem.message;
    return '';
  }

  public UsuarioLogado!: Usuario;
  public monitorLogado!: Monitor | undefined;

  //------------ Colunas Grid Saldo Terceiro
  obterColunas(): Array<PoTableColumn> {
    return [
      { property: 'nomeEstabel', label: 'Estab' },
      { property: 'serieEntra', label: 'Série Ent' },
      { property: 'serieSai', label: 'Série Sai' },
      { property: 'nomeTranspEnt', label: 'Transporte Ent' },
      { property: 'nomeTranspSai', label: 'Transporte Sai' },
      { property: 'codEntrega', label: 'Entrega' },
      { property: 'rpw', label: 'RPW' },
    ];
  }

  //------------ Colunas Grid Saldo Terceiro
  obterColunasSaldoTerc(): Array<PoTableColumn> {
    return [
      /*  { property: 'numOS', label:'NumOS'}, */
      { property: 'nroDocto', label: 'Docto' },
      { property: 'serieDocto', label: 'Série' },
      { property: 'itCodigo', label: 'Item' },
      { property: 'qtSaldo', label: 'Qtde', type: 'number', color: 'color-10' },
      /*  { property: 'qtRuim', label: 'QtRuim', type: 'number', color:"color-07", visible:true}, */
      { property: 'descItem', label: 'Descrição', width: '300px' },
    ];
  }

  //------------ Coluna Grid Detalhe
  obterColunasTodos(): Array<PoTableColumn> {
    return [
      { property: 'numOS', label: 'NumOS' },
      { property: 'tipo', label: 'Tipo' },
      { property: 'itCodigo', label: 'Item' },
      { property: 'descItem', label: 'Descrição', width: '300px' },
      { property: 'qtMascara', label: 'Máscara.', type: 'number' },
      {
        property: 'qtPagar',
        label: 'Entregar',
        type: 'number',
        color: 'color-07',
        visible: true,
      },
      {
        property: 'qtRenovar',
        label: 'Renovar',
        type: 'number',
        color: 'color-10',
        visible: true,
      },
      {
        property: 'qtExtrakit',
        label: 'ET',
        type: 'number',
        color: 'color-10',
        visible: true,
      },
      {
        property: 'qtRuim',
        label: 'Ruim',
        type: 'number',
        color: 'color-10',
        visible: true,
      },
      { property: 'qtSaldo', label: 'Saldo Teórico', type: 'number' },
      { property: 'codLocaliza', label: 'Local' },
      { property: 'kit', label: 'Kit' },
      { property: 'itPrincipal', label: 'Principal' },
      { property: 'seqOrdem', label: 'Ordem' },
      { property: 'notaAnt', label: 'Nota' },
    ];
  }

  obterColunasPagar(): Array<PoTableColumn> {
    return [
      /*  { property: 'tipo', label:'Tipo'}, */
      { property: 'itCodigo', label: 'Item' },
      { property: 'descItem', label: 'Descrição', width: '300px' },
      { property: 'qtMascara', label: 'Máscara', type: 'number' },
      {
        property: 'qtPagar',
        label: 'Entregar',
        type: 'number',
        color: 'color-07',
        visible: true,
      },
      /* { property: 'qtRuim', label: 'Ruim', type: 'number', color:"color-07", visible:true}, */
      { property: 'qtSaldo', label: 'Saldo Teórico', type: 'number' },
      { property: 'codLocaliza', label: 'Local' },
      { property: 'kit', label: 'Kit' },
      { property: 'itPrincipal', label: 'Principal' },
      /* { property: 'seqOrdem', label: "Ordem"},
    { property: 'notaAnt', label: "Nota"}, */
    ];
  }

  obterColunasSomenteEntrada(): Array<PoTableColumn> {
    return [
      { property: 'numOS', label: 'NumOS' },
      { property: 'tipo', label: 'Tipo' },
      { property: 'itCodigo', label: 'Item' },
      { property: 'descItem', label: 'Descrição', width: '300px' },
      { property: 'qtMascara', label: 'Máscara', type: 'number' },
      {
        property: 'qtPagar',
        label: 'Bom',
        type: 'number',
        color: 'color-07',
        visible: true,
      },
      {
        property: 'qtRuim',
        label: 'Ruim',
        type: 'number',
        color: 'color-07',
        visible: true,
      },
      { property: 'codLocaliza', label: 'Local' },
      { property: 'kit', label: 'Kit' },
      { property: 'itPrincipal', label: 'Principal' },
      /* { property: 'seqOrdem', label: "Ordem"}, */
      { property: 'notaAnt', label: 'Nota' },
    ];
  }

  obterColunasRenovar(): Array<PoTableColumn> {
    return [
      /* { property: 'numOS', label:'NumOS'},
    { property: 'tipo', label:'Tipo'}, */
      { property: 'itCodigo', label: 'Item' },
      { property: 'descItem', label: 'Descrição', width: '300px' },
      { property: 'qtMascara', label: 'Máscara', type: 'number' },
      {
        property: 'qtRenovar',
        label: 'Renovar',
        type: 'number',
        color: 'color-10',
        visible: true,
      },
      { property: 'qtSaldo', label: 'Saldo Teórico', type: 'number' },
      { property: 'codLocaliza', label: 'Local' },
      { property: 'kit', label: 'Kit' },
      { property: 'itPrincipal', label: 'Principal' },
      { property: 'numOS', label: "NumOS"},
      { property: 'notaAnt', label: "Nota"}, 
      
    ];
  }

  obterColunasExtrakit(): Array<PoTableColumn> {
    return [
      /*  { property: 'numOS', label:'NumOS'},
    { property: 'tipo', label:'Tipo'}, */
      { property: 'itCodigo', label: 'Item' },
      { property: 'descItem', label: 'Descrição', width: '300px' },
      { property: 'qtMascara', label: 'Máscara', type: 'number' },
      {
        property: 'qtExtrakit',
        label: 'ExtraKit',
        type: 'number',
        color: 'color-10',
        visible: true,
      },
      { property: 'qtSaldo', label: 'Saldo Teórico', type: 'number' },
      { property: 'codLocaliza', label: 'Local' },
      { property: 'kit', label: 'Kit' },
      { property: 'itPrincipal', label: 'Principal' },

     { property: 'seqOrdem', label: "Ordem"},
    { property: 'notaAnt', label: "Nota"},
    { property: 'temPagto', label: "temPagto"}, 
      ];
  }

  obterColunasSemSaldo(): Array<PoTableColumn> {
    return [
      { property: 'itCodigo', label: 'Item' },
      { property: 'descItem', label: 'Descrição', width: '300px' },
      { property: 'qtMascara', label: 'Máscara', type: 'number' },
      {
        property: 'qtPagar',
        label: 'Não Atendida',
        type: 'number',
        color: 'color-08',
        visible: true,
      },
      { property: 'qtSaldo', label: 'Saldo Teórico', type: 'number' },
      { property: 'kit', label: 'Kit' },
      { property: 'codLocaliza', label: 'Local' },
    ];
  }

  obterColunasItensNota():Array<PoTableColumn>{
    return[
    { property: 'seq', label: 'Seq' },
    { property: 'it-codigo', label: 'Item' },
    { property: 'desc-item', label: 'Descrição' },
    { property: 'qtde', label: 'Qtde' },
    { property: 'cod-depos', label: 'Depos' },
    { property: 'cod-localiz', label: 'Localiz' },
  ];
  }

  obterColunasEntradas(): Array<PoTableColumn> {
    return [
      {
        property: 'idi-sit',
        label: 'Sefaz',
        type: 'label',
        labels: [
          {
            value: 1,
            color: 'color-08',
            label: 'NFe não autorizada',
            textColor: 'white',
          },
          {
            value: 2,
            color: 'color-08',
            label: 'Em Processamento',
            textColor: 'white',
          },
          {
            value: 3,
            color: 'color-10',
            label: 'Autorizada',
            textColor: 'white',
          },
          {
            value: 4,
            color: 'color-07',
            label: 'Uso denegado',
            textColor: 'white',
          },
          {
            value: 5,
            color: 'color-07',
            label: 'Docto Rejeitado',
            textColor: 'white',
          },
          {
            value: 6,
            color: 'color-07',
            label: 'Docto Cancelado',
            textColor: 'white',
          },
          {
            value: 7,
            color: 'color-07',
            label: 'Docto Inutilizado',
            textColor: 'white',
          },
          {
            value: 8,
            color: 'color-08',
            label: 'Em processamento no Aplicativo de Transmissão',
            textColor: 'white',
          },
          {
            value: 9,
            color: 'color-08',
            label: 'Em processamento na SEFAZ',
            textColor: 'white',
          },
          {
            value: 10,
            color: 'color-08',
            label: 'Em processamento no SCAN',
            textColor: 'white',
          },
          {
            value: 11,
            color: 'color-10',
            label: 'NF-e Gerada',
            textColor: 'white',
          },
          {
            value: 12,
            color: 'color-08',
            label: 'NF-e em Processo de Cancelamento',
            textColor: 'white',
          },
          {
            value: 13,
            color: 'color-08',
            label: 'NF-e em Processo de Inutilizacao',
            textColor: 'white',
          },
          {
            value: 14,
            color: 'color-08',
            label: 'NF-e Pendente de Retorno',
            textColor: 'white',
          },
          {
            value: 15,
            color: 'color-07',
            label: 'DPEC recebido pelo SCE',
            textColor: 'white',
          },
          {
            value: 98,
            color: 'color-08',
            label: 'Aguard.Proc reapi0190',
            textColor: 'white',
          },
          {
            value: 99,
            color: 'color-08',
            label: 'Aguard.Proc.re1005rp',
            textColor: 'white',
          },
          {
            value: 100,
            color: 'color-10',
            label: 'Nota Atualizada Estoque',
            textColor: 'white',
          },
          {
            value: 101,
            color: 'color-07',
            label: 'Situação desconhecida',
            textColor: 'white',
          },
          {
            value: 102,
            color: 'color-07',
            label: 'ERRO verificar pendências',
            textColor: 'white',
          },
          {
            value: 103,
            color: 'color-08',
            label: 'Aguardando Reprocessamento',
            textColor: 'white',
          },
        ],
      },
      { property: 'cod-emitente', label: 'Emitente' },
      { property: 'serie-docto', label: 'Serie' },
      { property: 'nro-docto', label: 'Docto' },
      { property: 'nat-operacao', label: 'Nat.Oper' },
    ];
  }

  obterColunasSaidas(): Array<PoTableColumn> {
    return [
      {
        property: 'idi-sit',
        label: 'Sefaz',
        type: 'label',
        labels: [
          {
            value: 1,
            color: 'color-08',
            label: 'NFe não autorizada',
            textColor: 'white',
          },
          {
            value: 2,
            color: 'color-08',
            label: 'Em Processamento',
            textColor: 'white',
          },
          {
            value: 3,
            color: 'color-09',
            label: 'Autorizada',
            textColor: 'white',
          },
          {
            value: 4,
            color: 'color-07',
            label: 'Uso denegado',
            textColor: 'white',
          },
          {
            value: 5,
            color: 'color-07',
            label: 'Docto Rejeitado',
            textColor: 'white',
          },
          {
            value: 6,
            color: 'color-07',
            label: 'Docto Cancelado',
            textColor: 'white',
          },
          {
            value: 7,
            color: 'color-07',
            label: 'Docto Inutilizado',
            textColor: 'white',
          },
          {
            value: 8,
            color: 'color-08',
            label: 'Em processamento no Aplicativo de Transmissão',
            textColor: 'white',
          },
          {
            value: 9,
            color: 'color-08',
            label: 'Em processamento na SEFAZ',
            textColor: 'white',
          },
          {
            value: 10,
            color: 'color-08',
            label: 'Em processamento no SCAN',
            textColor: 'white',
          },
          {
            value: 11,
            color: 'color-10',
            label: 'NF-e Gerada',
            textColor: 'white',
          },
          {
            value: 12,
            color: 'color-08',
            label: 'NF-e em Processo de Cancelamento',
            textColor: 'white',
          },
          {
            value: 13,
            color: 'color-08',
            label: 'NF-e em Processo de Inutilizacao',
            textColor: 'white',
          },
          {
            value: 14,
            color: 'color-08',
            label: 'NF-e Pendente de Retorno',
            textColor: 'white',
          },
          {
            value: 15,
            color: 'color-07',
            label: 'DPEC recebido pelo SCE',
            textColor: 'white',
          },
          {
            value: 99,
            color: 'color-08',
            label: 'Aguardando NFE',
            textColor: 'white',
          },
          {
            value: 100,
            color: 'color-10',
            label: 'Nota Atualizada Estoque',
            textColor: 'white',
          },
          {
            value: 102,
            color: 'color-07',
            label: 'ERRO verificar pendências',
            textColor: 'white',
          },
          {
            value: 103,
            color: 'color-08',
            label: 'Aguardando Reprocessamento',
            textColor: 'white',
          },
        ],
      },
      { property: 'cod-estabel', label: 'Estab' },
      { property: 'serie', label: 'Série' },
      { property: 'nr-nota-fis', label: 'Nr Nota' },
      { property: 'nome-ab-cli', label: 'Emitente' },
      { property: 'nat-operacao', label: 'Nat.Oper' },
    ];
  }

  obterColunasEntradasEstoque(): Array<PoTableColumn> {
    return [
      {
        property: 'idi-sit',
        label: 'Estoque',
        type: 'label',
        labels: [
          { value: 0, color: 'color-07', label: 'Não atualizada' },
          { value: 1, color: 'color-10', label: 'Atualizada' },
        ],
      },
      { property: 'cod-estabel', label: 'Estab' },
      { property: 'cod-emitente', label: 'Emitente' },
      { property: 'serie-docto', label: 'Serie' },
      { property: 'nro-docto', label: 'Docto' },
      { property: 'nat-operacao', label: 'Nat.Oper' },
    ];
  }

  obterColunasErrosProcessamento(): Array<PoTableColumn> {
    return [
      { property: 'nomeArquivo', label: 'Arquivo', type: 'columnTemplate' },
      { property: 'mensagem', label: 'Mensagem' },
      {
        property: 'dataHora',
        label: 'Data',
        type: 'date',
        format: 'dd/MM/yyyy hh:mm:ss',
      },
    ];
  }

  obterColunasReparos(): Array<PoTableColumn> {
    return [
      { property: 'cod-estabel', label: 'Estab' },
      { property: 'CodFilial', label: 'Filial' },
      { property: 'it-codigo', label: 'Item' },
      { property: 'qt-reparos', label: 'Qtd.Rep' },
      /* {property: 'l-equivalente', label: "EQV", type: 'columnTemplate'}, */
      { property: 'it-codigo-equiv', label: 'Item Equiv' },
      { property: 'qt-equiv', label: 'Qtd.Equiv' },
      { property: 'nr-enc', label: 'ENC' },
      { property: 'num-serie-it', label: 'Num.Serie Garantia' },
      { property: 'opcoes', label: 'Ações Disponíveis', type: 'cellTemplate' },
    ];
  }

  obterColunasMonitor(): Array<PoTableColumn> {
    return [
      { property: 'situacao', label:' ', type:'cellTemplate', width:'45px'},
      { property: 'nr-process', label: 'Processo' },
      { property: 'cod-emitente', label: 'Técnico' },
      { property: 'nome-abrev', label: 'Nome' },
      { property: 'num-ped-exec', label: 'Num Ped Exec', type:'cellTemplate' },
      { property: 'nome-almoxa', label: 'Almox' },
      { property: 'opcoes', label: 'Ações Disponíveis', type: 'cellTemplate' },
    ];
  }

  obterColunasEmbalagem(): Array<PoTableColumn> {
    return [
      { property: 'qt-volume', label: 'Volumes',type: 'number', format:'1.0-0' },
      { property: 'cod-embal', label: 'Embalagem' },
      { property: 'qt-embal', label: 'Qtd Embalagem' },
      { property: 'peso-liq', label: 'Peso Liq.', type: 'number', format:'1.3-3' },
      { property: 'peso-bru', label: 'Peso Bru', type: 'number', format:'1.3-3' },
      { property: 'modal', label: 'Modalidade' },
      { property: 'opcoes', label: 'Ações', type: 'cellTemplate' },
    ];
  }

  public ObterUsuario(): Observable<Usuario> {
    return of(this.UsuarioLogado).pipe(take(1));
  }

  public SetarUsuario(estab: string, usuario: string, processo: string) {
    this.UsuarioLogado = {
      codEstabelecimento: estab,
      codUsuario: usuario,
      nrProcesso: processo,
    };
  }

  public SetarMonitor(monitor?: Monitor) {
    this.monitorLogado = monitor ?? undefined;
  }

  public ObterMonitor(monitor?: Monitor) {
    return this.monitorLogado!;
  }

  //---------------------- COMBOBOX ESTABELECIMENTOS
  //Retorno transformado no formato {label: xxx, value: yyyy}
  public ObterEstabelecimentos(params?: any) {
    return this.http.get<any>(`${this._url}/ObterEstab`, {params: params, headers: headersTotvs})
      .pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codEstab + ' ' + item.nome,
              value: item.codEstab,
              codFilial: item.codFilial,
            };
          });
        }),
        take(1)
      );
  }

  //---------------------- COMBOBOX TECNICOS
  /*Retorno transformado no formato {label: xxx, value: yyyy}*/
  public ObterEmitentesDoEstabelecimento(id: string) {
    return this.http
      .get<any>(`${this._url}/ObterTecEstab?codEstabel=${id}`, {
        headers: headersTotvs,
      })
      .pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codTec + ' ' + item.nomeAbrev,
              value: item.codTec,
            };
          });
        }),
        take(1)
      );
  }

  //Parametros do Estabelecimento
  public ObterParamsDoEstabelecimento(id: string) {
    return this.http
      .get<any>(`${this._url}/ObterParamsEstab?codEstabel=${id}`, {
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- COMBOBOX TRANSPORTES
  /*Retorno transformado no formato {label: xxx, value: yyyy}*/
  public ObterTransportadoras() {
    return this.http
      .get<any>(`${this._url}/ObterTransp`, { headers: headersTotvs })
      .pipe(
        map((item) => {
          return item.items.map((item: any) => {
            return {
              label: item.codTransp + ' ' + item.nomeAbrev,
              value: item.codTransp,
            };
          });
        }),
        ///tap(data => {console.log("Data Transformada pelo Map =>", data)}),
        take(1)
      );
  }

  //---------------------- COMBOBOX ENTREGA
  /*Retorno transformado no formato {label: xxx, value: yyyy}*/
  public ObterEntrega(param: any) {
    return this.http
      .get<any>(
        `${this._url}/ObterEntrega?codTecnico=${param.codTecnico}&codEstabel=${param.codEstabel}`,
        { headers: headersTotvs }
      )
      .pipe(
        map((item) => {
          return {
            nrProcesso: item.nrProcesso,
            listaEntrega: item.listaEntrega.map((x: any) => {
              return {
                label: x.codEntrega + ' ' + x.nomeAbrev,
                value: x.codEntrega,
                cidade: x.nomeAbrev,
              };
            }),
          };
        }),
        take(1)
      );
  }

  //---------------------- Eliminar por id
  public EliminarPorId(params?: any) {
    return this.http
      .post(`${this._url}/EliminarPorId`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- GRID EXTRAKIT
  public ObterExtraKit(params?: any) {
    return this.http
      .post(`${this._url}/ObterExtrakit`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Resumo
  public PrepararResumo(params?: any) {
    return this.http
      .post(`${this._url}/PrepararCalculo`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Resumo
  public AprovarCalculo(params?: any) {
    return this.http
      .post(`${this._url}/AprovarCalculo`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Resumo
  public ReprocessarCalculo(params?: any) {
    return this.http
      .post(`${this._url}/ReprocessarCalculo`, params, {
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Processar Entradas
  public ProcessarEntradas(params?: any) {
    return this.http
      .post(`${this._url}/ProcessarEntradas`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Processar Entradas
  public ProcessarSaidasReparos(params?: any) {
    return this.http
      .post(`${this._url}/ProcessarSaidasReparos`, params, {
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Login
  public LoginAlmoxarifado(params?: any) {
    return this.http
      .post(`${this._url}/LoginAlmoxa`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Login
  public LoginAdmin(params?: any) {
    return this.http
      .post(`${this._url}/LoginAdmin`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Login Usuario
  public LoginUsuario(params?: any) {
    return this.http
      .post(`${this._url}/LoginUsuario`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Variaveis Globais
  public ObterVariaveisGlobais(params?: any) {
    return this.http
      .get(`${this._url}/ObterVariaveisGlobais`, {
        params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

   //---------------------- Variaveis Globais
   public SetarVariaveisGlobais(params?: any) {
    return this.http
      .get(`${this._url}/SetarVariaveisGlobais`, {
        params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Processo
  public ObterNrProcesso(params?: any) {
    return this.http
      .get(`${this._url}/ObterNrProcesso`, { params, headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Login
  public ObterNotas(params?: any) {
    return this.http
      .post(`${this._url}/ObterNotas`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  public ObterPrimeiraNota(params?: any) {
    return this.http
      .post(`${this._url}/ObterPrimeiraNota`, params, { headers: headersTotvs })
      .pipe(take(1));
  }


  //---------------------- Salvar registro
  public Salvar(params?: any) {
    return this.http
      .post(`${this._url}/SalvarCalcEstab`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Obter Lista
  public Obter(params?: any) {
    return this.http
      .get(`${this._url}/ObterCalcEstab`, {
        params: params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Deletar registro
  public Deletar(params?: any) {
    return this.http
      .get(`${this._url}/DeletarCalcEstab`, {
        params: params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Abrir Arquivos
  public AbrirArquivo(params?: any) {
    return this.http
      .get(`${this._url}/AbrirArquivo`, {
        params: params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //Parametros do Estabelecimento
  public ObterProcessosEstab(params?: any) {
    return this.http
      .get(`${this._url}/ObterProcessosEstab`, {
        params: params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Salvar registro
  public InformarEmbalagem(params?: any) {
    return this.http
      .post(`${this._url}/InformarEmbalagem`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  public ObterItensParaReparo(params?: any) {
    return this.http
      .get(`${this._url}/ObterItensParaReparo`, {
        params: params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //---------------------- Programas DDK
  public AbrirProgramaTotvs(params?: any) {
    return this.http
      .get('/totvs-menu/rest/exec', { params, headers: headersTotvs })
      .pipe(take(1));
  }

  public AbrirReparo(params?: any) {
    return this.http
      .post(`${this._url}/AbrirReparos`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  //---------------------- Salvar registro
  public ValidarItensReparo(params?: any) {
    return this.http
      .post<Reparo[]>(`${this._url}/ValidarItensReparo`, params, {
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  public ImprimirConfOS(params?: any) {
    return this.http
      .get(`${this._url}/ImprimirConfOS`, { params, headers: headersTotvs })
      .pipe(take(1));
  }

  public EncerrarProcesso(params?: any) {
    return this.http
      .get(`${this._url}/EncerrarProcesso`, { params, headers: headersTotvs })
      .pipe(take(1));
  }

  public ForcarEfetivacaoSaida(params?: any) {
    return this.http
      .get(`${this._url}/ForcarEfetivacaoSaida`, {
        params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  public ReenviarNotasSefaz(params?: any) {
    return this.http
      .get(`${this._url}/ReenviarNotasSefaz`, {
        params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  public ReprocessarErros(params?: any) {
    return this.http
      .post(`${this._url}/ReprocessarErros`, params, { headers: headersTotvs })
      .pipe(take(1));
  }

  public ObterItensNota(params?: any) {
    return this.http
      .get(`${this._url}/ObterItensNota`, {
        params,
        headers: headersTotvs,
      })
      .pipe(take(1));
  }

  //Ordenacao campos num array
  public ordenarCampos =
    (fields: any[]) =>
    (a: { [x: string]: number }, b: { [x: string]: number }) =>
      fields
        .map((o) => {
          let dir = 1;
          if (o[0] === '-') {
            dir = -1;
            o = o.substring(1);
          }
          return a[o] > b[o] ? dir : a[o] < b[o] ? -dir : 0;
        })
        .reduce((p, n) => (p ? p : n), 0);
}

const removeAttrFromObject = <O extends object, A extends keyof O>(
  object: O,
  attr: A
): Omit<O, A> => {
  const newObject = { ...object };

  if (attr in newObject) {
    delete newObject[attr];
  }

  return newObject;
};
