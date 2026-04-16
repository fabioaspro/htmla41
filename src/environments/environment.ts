// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false ,
  versao:'2.1',
  totvs_url:   'https://hawebdev.dieboldnixdorf.com.br:8143/api/integracao/aat/v1/apiesaa041',
  totvs46_url: 'https://hawebdev.dieboldnixdorf.com.br:8143/api/integracao/aat/v1/apiesaa046',
  /* totvs_url: 'https://totvsapptst.dieboldnixdorf.com.br:8543/api/integracao/aat/v1/apiesaa041',
  totvs46_url: 'https://totvsapptst.dieboldnixdorf.com.br:8543/api/integracao/aat/v1/apiesaa046', */

  
  totvs_header:{
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa("super:prodiebold12"),
    'CompanyId': 1
  },
  
};


//2.1 - ordenação do grid de extrakit por numero de nota