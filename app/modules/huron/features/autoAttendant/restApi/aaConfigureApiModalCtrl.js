(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAConfigureApiModalCtrl', AAConfigureApiModalCtrl);

  /* @ngInject */
  function AAConfigureApiModalCtrl($modalInstance, $scope, $translate, aa_schedule, aa_index, AACommonService, AADynaAnnounceService, AAModelService, AASessionVariableService, AAUiModelService) {
    var vm = this;

    var GET = 'GET';
    var apiConfig;
    var action;
    var CONSTANTS = {};

    var dependentCeSessionVariablesList = [];
    var dynamicVariablesList = [];
    var availableSessionVariablesList = [];
    var lastSavedDynList = [];
    var lastSavedVariableList = [];

    CONSTANTS.idSelectorPrefix = '#';

    vm.url = '';
    vm.aaElementType = 'REST';

    vm.sessionVarOptions = [];
    vm.variableSet = [{
      value: '',
      variableName: '',
      isWarn: false,
    }];
    vm.ui = {};
    vm.deletedSessionVariablesList = [];

    vm.selectVariablePlaceholder = $translate.instant('autoAttendant.selectVariablePlaceholder');
    vm.addElement = '<aa-insertion-element element-text="DynamicText" read-as="ReadAs" element-id="Id" aa-schedule="' + aa_schedule + '" aa-index="' + aa_index + '" aa-element-type="' + vm.aaElementType + '"></aa-insertion-element>';

    vm.dynamicTags = ['DYNAMIC-EXAMPLE'];
    vm.isDynamicToggle = isDynamicToggle;
    vm.deleteVariableSet = deleteVariableSet;
    vm.addVariableSet = addVariableSet;
    vm.save = save;
    vm.cancel = cancel;
    vm.isNewVariable = isNewVariable;
    vm.canShowWarn = canShowWarn;
    vm.isSaveDisabled = isSaveDisabled;
    vm.saveDynamicUi = saveDynamicUi;

    vm.newVariable = $translate.instant('autoAttendant.newVariable');
    vm.validationMsgs = {
      maxlength: $translate.instant('autoAttendant.callerInputVariableTooLongMsg'),
      minlength: $translate.instant('autoAttendant.callerInputVariableTooShortMsg'),
      required: $translate.instant('autoAttendant.callerInputVariableRequiredMsg'),
      pattern: $translate.instant('autoAttendant.invalidCharacter'),
    };
    vm.toggleFullWarningMsg = toggleFullWarningMsg;
    vm.closeFullWarningMsg = closeFullWarningMsg;
    vm.getWarning = getWarning;
    vm.fullWarningMsgValue = false;
    vm.deletedSessionVariablesListAlongWithWarning = '';

    vm.maxVariableLength = 16;
    vm.minVariableLength = 3;
    /////////////////////

    $scope.$on('CE Updated', function () {
      getDynamicVariables();
      refreshVarSelects();
      if (_.isEmpty(vm.deletedSessionVariablesList)) {
        vm.fullWarningMsgValue = false;
      }
    });

    $scope.$on('CIVarNameChanged', function () {
      getDynamicVariables();
      refreshVarSelects();
    });

    function toggleFullWarningMsg() {
      vm.fullWarningMsgValue = !vm.fullWarningMsgValue;
    }

    function closeFullWarningMsg() {
      vm.fullWarningMsgValue = false;
    }

    function getWarning() {
      if (_.isEmpty(vm.deletedSessionVariablesList)) {
        return false;
      }
      if (vm.deletedSessionVariablesList.length > 1) {
        vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariables', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
      } else {
        vm.deletedSessionVariablesListAlongWithWarning = $translate.instant('autoAttendant.dynamicMissingCustomVariable', { deletedSessionVariablesList: vm.deletedSessionVariablesList.toString() });
      }
      return true;
    }

    function addLocalAndQueriedSessionVars() {
      // reset the displayed SessionVars to the original queried items
      availableSessionVariablesList = dependentCeSessionVariablesList;
      availableSessionVariablesList = _.concat(dependentCeSessionVariablesList, AACommonService.collectThisCeActionValue(vm.ui, true, false));
      availableSessionVariablesList = _.uniq(availableSessionVariablesList).sort();
    }

    function refreshVarSelects() {
      // reload the session variables.
      addLocalAndQueriedSessionVars();
      // resets possibly warning messages
      updateIsWarnFlag();
    }

    function updateIsWarnFlag() {
      vm.deletedSessionVariablesList = [];
      if (_.isEmpty(dynamicVariablesList)) {
        return;
      }
      _.forEach(dynamicVariablesList, function (variable) {
        if (!_.includes(availableSessionVariablesList, variable)) {
          vm.deletedSessionVariablesList.push(JSON.stringify(variable));
        }
      });
      vm.deletedSessionVariablesList = _.uniq(vm.deletedSessionVariablesList).sort();
    }

    function getSessionVariablesOfDependentCe() {
      dependentCeSessionVariablesList = [];
      return AASessionVariableService.getSessionVariablesOfDependentCeOnly(_.get(AAModelService.getAAModel(), 'aaRecordUUID')).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          dependentCeSessionVariablesList = data;
        }
      });
    }

    function getDynamicVariables() {
      dynamicVariablesList = [];
      var dynamVarList = _.get(vm.menuEntry, 'actions[0].dynamicList', '');
      _.forEach(dynamVarList, function (entry) {
        if (entry.isDynamic) {
          if (!_.includes(AACommonService.getprePopulatedSessionVariablesList(), entry.action.eval.value)) {
            dynamicVariablesList.push(entry.action.eval.value);
          }
        }
      });
    }

    function save() {
      action.url = vm.url;
      action.variableSet = vm.variableSet;
      //for now set method to GET as default
      action.method = GET;
      $modalInstance.close();
    }

    function cancel() {
      updateUiModel();
      $modalInstance.close();
    }

    function updateUiModel() {
      vm.menuEntry.actions[0].dynamicList = lastSavedDynList;
      vm.menuEntry.actions[0].variableSet = lastSavedVariableList;
    }

    function saveDynamicUi() {
      angular.element(CONSTANTS.idSelectorPrefix.concat('configureApiUrl')).focus();
      var range = AADynaAnnounceService.getRange();
      var dynamicList = range.endContainer.ownerDocument.activeElement;
      if (dynamicList.className.includes('dynamic-prompt') && !(_.isEqual(dynamicList.id, 'configureApiUrl{{schedule + index}}'))) {
        vm.menuEntry.actions[0].dynamicList = createDynamicList(dynamicList, []);
        if (_.isEmpty(_.get(vm.menuEntry, 'actions[0].dynamicList'))) {
          vm.menuEntry.actions[0].dynamicList.push({
            action: {
              eval: {
                value: '',
              },
            },
            isDynamic: false,
            htmlModel: '',
          });
        }
      }
    }

    function createAction(value, isDynamicValue, htmlModelValue) {
      var node = {
        action: {
          eval: {
            value: value,
          },
        },
        isDynamic: isDynamicValue,
        htmlModel: htmlModelValue,
      };
      return node;
    }

    function createDynamicList(dynamicList, finalDynamicList) {
      var opt;
      if (!vm.isDynamicToggle()) {
        opt = createAction(dynamicList.value, false, '');
        finalDynamicList.push(opt);
        return finalDynamicList;
      }
      _.forEach(dynamicList.childNodes, function (node) {
        if ((_.isEqual(node.nodeName, 'AA-INSERTION-ELEMENT') && node.childNodes.length > 0) || node.nodeName === 'DIV') {
          return createDynamicList(node, finalDynamicList);
        }
        switch (node.nodeName) {
          case 'BR':
            opt = createAction('', true, encodeURIComponent('<br>'));
            break;

          case '#text':
            opt = createAction(node.nodeValue, false, '');
            break;

          case 'SPAN':
          case 'AA-INSERTION-ELEMENT':
            var attributes;
            if (_.isEqual(node.nodeName, 'SPAN')) {
              attributes = node.parentElement.attributes;
            } else {
              attributes = node.attributes;
            }
            var ele = '<aa-insertion-element element-text="' + attributes[0].value + '" read-as="' + attributes[1].value + '" element-id="' + attributes[2].value + '" aa-element-type="' + vm.aaElementType + '"></aa-insertion-element>';
            opt = createAction(attributes[0].value, true, encodeURIComponent(ele));
        }

        if (!opt.isDynamic && !_.isEmpty(_.get(opt.action.eval, 'value').trim())) {
          var encodedValue = encodeURIComponent(_.get(opt.action.eval, 'value').trim());
          opt = createAction(encodedValue, false, '');
          finalDynamicList.push(opt);
        } else if (opt.isDynamic) {
          finalDynamicList.push(opt);
        }
      });
      return finalDynamicList;
    }

    function isSaveDisabled() {
      return (areVariableSetsEmpty() || isDynamicListEmpty());
    }

    function isDynamicListEmpty() {
      var status = true;
      var dynamicList = _.get(vm.menuEntry, 'actions[0].dynamicList');
      _.forEach(dynamicList, function (dynamic) {
        if (!_.isEmpty(_.get(dynamic, 'action.eval.value', ''))) {
          status = false;
        }
      });
      return status;
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
        variable.isWarn = AACommonService.collectThisCeActionValue(vm.ui, true, false).filter(function (value) {
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

    function decodedValue(evalValue) {
      return decodeURIComponent(evalValue).trim();
    }

    function populateUiModel() {
      if (!_.isEmpty(action)) {
        if (_.has(action, 'dynamicList')) {
          lastSavedDynList = _.get(vm.menuEntry, 'actions[0].dynamicList');
          vm.dynamicValues = [];
          _.forEach(action.dynamicList, function (opt) {
            var model = {};
            if (!opt.isDynamic) {
              model = {
                model: decodedValue(_.get(opt.action.eval, 'value')),
                html: decodedValue(_.get(opt.action.eval, 'value')),
              };
            } else {
              model = {
                model: _.get(opt.action.eval, 'value'),
                html: decodeURIComponent(opt.htmlModel),
              };
            }
            vm.dynamicValues.push(model);
          });
        }
      }
      vm.url = action.url;
      if (!_.isEmpty(action.variableSet)) {
        lastSavedVariableList = action.variableSet;
        vm.variableSet = action.variableSet;
      }
    }

    function isDynamicToggle() {
      return AACommonService.isDynAnnounceToggle();
    }

    function activate() {
      vm.ui = AAUiModelService.getUiModel();
      apiConfig = 'apiConfig' + aa_schedule + '-' + aa_index + '-' + AACommonService.getUniqueId();
      var uiMenu = vm.ui[aa_schedule];

      vm.menuEntry = uiMenu.entries[aa_index];
      if (!_.isUndefined(vm.menuEntry.actions[0])) {
        action = vm.menuEntry.actions[0];
      }
      populateUiModel();
      AASessionVariableService.getSessionVariables(AAModelService.getAAModel().aaRecordUUID).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          vm.sessionVarOptions = data;
          vm.sessionVarOptions.sort();
        }
      }).finally(function () {
        vm.sessionVarOptions.push(vm.newVariable);
      });
      getSessionVariablesOfDependentCe().finally(function () {
        getDynamicVariables();
        refreshVarSelects();
      });
    }

    function init() {
      $scope.schedule = aa_schedule;
      $scope.index = aa_index;
      activate();
    }

    init();
  }
})();
