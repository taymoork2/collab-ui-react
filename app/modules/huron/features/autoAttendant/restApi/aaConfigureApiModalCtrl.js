(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAConfigureApiModalCtrl', AAConfigureApiModalCtrl);

  /* @ngInject */
  function AAConfigureApiModalCtrl(AAModelService, $modalInstance, AAUiModelService, aa_schedule, aa_index, $translate, AASessionVariableService, AACommonService) {
    var vm = this;

    var GET = 'GET';
    var ui;
    var apiConfig;
    var action;

    vm.url = '';

    vm.sessionVarOptions = [];
    vm.variableSet = [{
      value: '',
      variableName: '',
      isWarn: false,
    }];

    vm.selectVariablePlaceholder = $translate.instant('autoAttendant.selectVariablePlaceholder');

    vm.deleteVariableSet = deleteVariableSet;
    vm.addVariableSet = addVariableSet;
    vm.save = save;
    vm.isNewVariable = isNewVariable;
    vm.canShowWarn = canShowWarn;
    vm.isSaveDisabled = isSaveDisabled;

    vm.newVariable = $translate.instant('autoAttendant.newVariable');
    vm.validationMsgs = {
      maxlength: $translate.instant('autoAttendant.callerInputVariableTooLongMsg'),
      minlength: $translate.instant('autoAttendant.callerInputVariableTooShortMsg'),
      required: $translate.instant('autoAttendant.callerInputVariableRequiredMsg'),
      pattern: $translate.instant('autoAttendant.invalidCharacter'),
    };

    vm.maxVariableLength = 16;
    vm.minVariableLength = 3;

    /////////////////////

    function save() {
      action.url = vm.url;
      action.variableSet = vm.variableSet;
      //for now set method to GET as default
      action.method = GET;
      $modalInstance.close();
    }

    function isSaveDisabled() {
      return (_.isEmpty(vm.url) || areVariableSetsEmpty());
    }

    function areVariableSetsEmpty() {
      var status = false;
      _.forEach(vm.variableSet, function (variable) {
        if (_.isEmpty(variable.value) || _.isEmpty(variable.variableName === vm.newVariable ? variable.newVariableValue : variable.variableName)) {
          status = true;
        }
      });
      return status;
    }

    function canShowWarn(variable) {
      // if invalid (from html, too short or too long nameInput is undefined
      var nameInput = variable.newVariableValue;
      AACommonService.setIsValid(apiConfig, nameInput);

      action.variableSet = vm.variableSet;
      if (!nameInput) {
        // don't bother with undefined for warnings as other lanes could have invalid inputs also
        variable.isWarn = false;
        return;
      }
      variable.isWarn = !_.isUndefined(vm.sessionVarOptions[nameInput]);

      if (!variable.isWarn) {
        // args to collect - ui to examine, true for sessionVars, false for conditionals
        variable.isWarn = AACommonService.collectThisCeActionValue(ui, true, false).filter(function (value) {
          return _.isEqual(value, nameInput);
        }).length > 1;
      }
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
      if (!_.isEmpty(action)) {
        vm.url = action.url;
        if (!_.isEmpty(action.variableSet)) {
          vm.variableSet = action.variableSet;
        }
      }
    }

    function activate() {
      ui = AAUiModelService.getUiModel();
      apiConfig = 'apiConfig' + aa_schedule + "-" + aa_index + "-" + AACommonService.getUniqueId();
      var uiMenu = ui[aa_schedule];

      ui = AAUiModelService.getUiModel();
      vm.sessionVarOptions.push(vm.newVariable);
      vm.menuEntry = uiMenu.entries[aa_index];
      if (!_.isUndefined(vm.menuEntry.actions[0])) {
        action = vm.menuEntry.actions[0];
      }
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
