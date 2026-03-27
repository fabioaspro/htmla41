/*global define */
define([
    'index',
    '/dts/totvs-arq-sample/html/thf1sample/thf1sample-main.controller.js',		
    'css!/dts/totvs-arq-sample/html/thf1sample/thf1sample.css'
], function (index) {
    'use strict';

    index.stateProvider
        .state('dts/totvs-arq-sample/thf1sample', {
            "abstract": true,
            "template": '<ui-view />'
        })
        .state('dts/totvs-arq-sample/thf1sample.start', {
            url: '/dts/totvs-arq-sample/thf1sample',
            controller: 'fnd.thf1sample.main.controller',
            controllerAs: 'controller',
            templateUrl: '/dts/totvs-arq-sample/html/thf1sample/thf1sample-main.view.html'
        });       
       
});