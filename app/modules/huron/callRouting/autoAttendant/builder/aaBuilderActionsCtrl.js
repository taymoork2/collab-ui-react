(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderActionsCtrl', AABuilderActionsCtrl);

  /* @ngInject */
  function AABuilderActionsCtrl($scope, $controller) {

    var vm = this;

    vm.templates = [{
      title: 'Say Message',
      controller: '',
      url: '',
      help: ''
    }, {
      title: 'Phone Menu',
      controller: 'AutoAttendantMainCtrl as aaMain',
      url: 'modules/huron/callRouting/autoAttendant/autoAttendantMenu.tpl.html',
      help: ''
    }, {
      title: 'Route Call',
      controller: '',
      url: '',
      help: ''
    }, {
      title: 'End Call',
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
      if (vm.template && vm.template.controller) {
        return $controller(vm.template.controller, {
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
