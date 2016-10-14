(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($scope, $rootScope, AAUiModelService, AAValidationService) {

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
    vm.flag = true;

    /////////////////////

    function saveAARecord() {

      if (!AAValidationService.isNameValidationSuccess(vm.name, '')) {
        return;
      }

      if (vm.flag) {
        saveUiModel();
        vm.flag = false;
        $rootScope.$broadcast('AANameCreated');
      }
    }

    $scope.$on('AACreationFailed', function () {
      vm.flag = true;
    });

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
      if (vm.name === '' || vm.flag === false) {
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
