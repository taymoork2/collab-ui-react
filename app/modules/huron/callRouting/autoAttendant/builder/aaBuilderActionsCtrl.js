(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderActionsCtrl', AABuilderActionsCtrl);

  /* @ngInject */
  function AABuilderActionsCtrl($scope, $translate, $controller) {

    var vm = this;
    vm.schedule = '';
    vm.isNewStepFormOpen = false;

    vm.templates = [{
      title: $translate.instant('autoAttendant.actionSayMessage'),
      controller: '',
      url: '',
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
    }, {
      title: $translate.instant('autoAttendant.actionEndCall'),
      controller: '',
      url: '',
      help: ''
    }];

    vm.template = ""; // no default template

    vm.getTemplateController = getTemplateController;
    vm.getTemplateUrl = getTemplateUrl;

    vm.addAction = addAction();
    vm.removeAction = removeAction();

    function getTemplateUrl() {
      return vm.template.url;
    }

    function getTemplateController() {
      var template = vm.template;
      if (template && template.controller) {
        return $controller(template.controller, {
          $scope: $scope
        });
      }
    }

    function addAction() {

    }

    function removeAction() {

    }

    function activate() {

    }

    activate();
  }
})();
