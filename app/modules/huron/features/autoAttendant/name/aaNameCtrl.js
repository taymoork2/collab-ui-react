(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($rootScope, AAUiModelService, AAValidationService) {

    var vm = this;

    vm.ui = {};
    vm.saveAARecord = saveAARecord;

    // exposed checkNameEntry and saveUiModel for unit tests
    vm.saveUiModel = saveUiModel;

    var name = "";
    var aaBuilderMainCtrl_saveAARecords;

    /////////////////////

    function saveAARecord() {

      if (!AAValidationService.isNameValidationSuccess(vm.name, '')) {
        return;
      }

      saveUiModel();

      $rootScope.$broadcast('AANameCreated');
    }

    function saveUiModel() {
      vm.ui.builder.ceInfo_name = vm.name;
      vm.ui.ceInfo.name = vm.name;
    }

    function activate() {

      vm.ui = AAUiModelService.getUiModel();

    }

    activate();

  }
})();
