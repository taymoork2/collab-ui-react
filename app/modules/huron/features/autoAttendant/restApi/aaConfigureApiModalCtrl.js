(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAConfigureApiModalCtrl', AAConfigureApiModalCtrl);

  /* @ngInject */
  function AAConfigureApiModalCtrl(AAModelService, $modalInstance, AAUiModelService, aa_schedule, aa_index, $translate, AASessionVariableService) {
    var vm = this;

    vm.url = '';

    vm.sessionVarOptions = [];
    vm.variableSet = [{
      value: '',
      variableName: '',
    }];

    vm.selectVariablePlaceholder = $translate.instant('autoAttendant.selectVariablePlaceholder');

    vm.deleteVariableSet = deleteVariableSet;
    vm.addVariableSet = addVariableSet;
    vm.save = save;
    vm.isNewVariable = isNewVariable;

    var GET = 'GET';
    vm.newVariable = $translate.instant('autoAttendant.newVariable');

    /////////////////////

    function save() {
      vm.menuEntry.doRest.url = vm.url;
      vm.menuEntry.doRest.variableSet = vm.variableSet;
      //for now set method to GET as default
      vm.menuEntry.doRest.method = GET;
      $modalInstance.close();
    }

    function isNewVariable(name) {
      if (name === vm.newVariable) {
        return true;
      }
      return false;
    }

    function addVariableSet() {
      vm.variableSet.push({
        value: '',
        variableName: '',
      });
    }

    // the user has pressed the trash can icon for a key/action pair
    function deleteVariableSet(index) {
      vm.variableSet.splice(index, 1);
    }

    function populateUiModel() {
      if (!_.isEmpty(vm.menuEntry.doRest)) {
        vm.url = vm.menuEntry.doRest.url;
        vm.variableSet = vm.menuEntry.doRest.variableSet;
      }
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      var uiMenu = ui[aa_schedule];
      vm.sessionVarOptions.push(vm.newVariable);
      vm.menuEntry = uiMenu.entries[aa_index];
      populateUiModel();
    }

    function init() {
      AASessionVariableService.getSessionVariables(AAModelService.getAAModel().aaRecordUUID).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          vm.sessionVarOptions = data;
          vm.sessionVarOptions.sort();
        }
      }).finally(function () {
        activate();
      });
    }

    init();
  }
})();
