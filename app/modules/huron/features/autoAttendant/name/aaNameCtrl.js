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

    vm.nextButton = nextButton;
    vm.previousButton = previousButton;
    vm.nextPage = nextPage;
    vm.evalKeyPress = evalKeyPress;
    vm.name = '';

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

    function previousButton() {
      return 'hidden';
    }

    function nextButton() {
      if (vm.name === '') {
        return false;
      } else {
        return true;
      }
    }

    function nextPage() {
      saveAARecord();
    }

    function evalKeyPress($keyCode) {
      switch ($keyCode) {
        //right arrow
        case 39:
          nextPage();
          break;

        default:
          break;
      }
    }

    activate();

  }
})();
