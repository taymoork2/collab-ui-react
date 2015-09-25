(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderActionsCtrl', AABuilderActionsCtrl);

  /* @ngInject */
  function AABuilderActionsCtrl($scope, $translate, $controller, AAUiModelService, AutoAttendantCeMenuModelService) {

    var vm = this;

    vm.templates = [{
      title: $translate.instant('autoAttendant.actionSayMessage'),
      controller: 'AASayCtrl as aaSay',
      url: 'modules/huron/callRouting/autoAttendant/aaSay.tpl.html',
      help: ''
    }, {
      title: $translate.instant('autoAttendant.actionPhoneMenu'),
      controller: 'AutoAttendantMainCtrl as aaMain',
      url: 'modules/huron/callRouting/autoAttendant/autoAttendantMenu.tpl.html',
      help: ''
    }, {
      title: $translate.instant('autoAttendant.actionRouteCall'),
      controller: '',
      url: '',
      help: ''
    }];

    vm.template = ""; // no default template
    vm.schedule = "";

    vm.getTemplateController = getTemplateController;
    vm.getTemplateUrl = getTemplateUrl;
    vm.removeAction = removeAction;

    /////////////////////

    function getTemplateUrl() {
      return vm.template.url;
    }

    function getTemplateController() {
      var template = vm.template;
      if (vm.template && vm.template.controller) {
        return $controller(vm.template.controller, {
          $scope: $scope
        });
      }
    }

    function removeAction(index) {
      var uiModel = AAUiModelService.getUiModel();
      var uiMenu = uiModel[vm.schedule];

      uiMenu.deleteEntryAt(index);
    }

    function activate() {
      var menuEntry;
      vm.schedule = $scope.schedule;
      vm.uiModel = AAUiModelService.getUiModel();
      if ($scope.index >= 0) {
        menuEntry = vm.uiModel[vm.schedule].getEntryAt($scope.index);
        if (menuEntry.actions.length > 0 && menuEntry.actions[0].getName() === 'play') {
          vm.template = vm.templates[0];
        }
      }

    }

    activate();
  }
})();
