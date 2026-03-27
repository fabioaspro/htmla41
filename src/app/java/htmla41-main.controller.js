/* JSLint */
/*global define, angular, TOTVSEvent */

define([
    'index'
], function (index) {

    'use strict';

    var thf1sampleMainController = function (
        $rootScope,
        $scope,
        $location,
        appViewService,
        TOTVSEvent) {

        var view = this;

        view.thf1sample = {};
		
        view.thf1sample.openProperties = function () {
			var splitParams = view.thf1sample.params.split("|");
			var params = {};
			for (var i=0; i < splitParams.length; i++) {
				var values = splitParams[i].split("=");
				params[values[0]] = values[1];
			}
			
			if ($rootScope.appRootContext === '/menu-html/')
				$location.path('menu-html/program-html/html.thf2sample/').search(params);
			else
				$location.path('totvs-menu/program-html/html.thf2sample/').search(params);
        }

        view.init = function () {
            appViewService.startView('THF1 Sample', 'fnd.thf1sample.main.controller', view);
        };

        if ($rootScope.currentuserLoaded) {
            view.init();
        }

        $scope.$on(TOTVSEvent.rootScopeInitialize, function () {
            view.init();
        });
    };

    thf1sampleMainController.$inject = [
        '$rootScope',
        '$scope',
        '$location',
        'totvs.app-main-view.Service',
        'TOTVSEvent'
    ];

    index.register.controller('fnd.thf1sample.main.controller', thf1sampleMainController);
});