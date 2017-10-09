(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('aaBuilderNameCtrl', AutoAttendantNameBuilderCtrl);

  /* @ngInject */
  function AutoAttendantNameBuilderCtrl($rootScope, $scope, AARestModelService, AAUiModelService, AAValidationService) {
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
    var canCreateAA = true;

    /////////////////////

    function saveAARecord() {
      if (!AAValidationService.isNameValidationSuccess(vm.name, '') || !canCreateAA) {
        return;
      }

      if (canCreateAA) {
        saveUiModel();
        canCreateAA = false;
        $rootScope.$broadcast('AANameCreated');
      }
    }

    $scope.$on('AACreationFailed', function () {
      canCreateAA = true;
    });

    function saveUiModel() {
      vm.ui.builder.ceInfo_name = vm.name;
      vm.ui.ceInfo.name = vm.name;
    }

    function activate() {
      vm.ui = AAUiModelService.getUiModel();
      AARestModelService.setUiRestBlocks({});
      AARestModelService.setRestBlocks({});
    }

    function previousButton() {
      return 'hidden';
    }

    function nextButton() {
      if (vm.name === '' || canCreateAA === false) {
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
        //right arrow - CR
        case 39:
        case 13:
          nextPage();
          break;

        default:
          break;
      }
    }

    activate();
  }
})();
