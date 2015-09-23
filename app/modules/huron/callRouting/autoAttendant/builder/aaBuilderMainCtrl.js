(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderMainCtrl', AABuilderMainCtrl); /* was AutoAttendantMainCtrl */

  /* @ngInject */
  function AABuilderMainCtrl($scope, $translate, $stateParams, AAModelService, AutoAttendantCeInfoModelService, AutoAttendantCeService, Notification, AAUiModelService) {
    var vm = this;
    vm.aaModel = {};
    vm.ui = {};

    function activate() {

      vm.aaModel = AAModelService.getAAModel();

      vm.aaModel.aaRecord = {};
      vm.aaModel.aaRecord = AAModelService.newAARecord();

      AAUiModelService.setCeInfo(vm.aaModel.aaRecord);

      vm.ui = AAUiModelService.getCeInfo();

    }
    ///////////////////

    activate();

  }
})();
