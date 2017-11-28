(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAConfigureApiModalCtrl', AAConfigureApiModalCtrl);

  /* @ngInject */
  function AAConfigureApiModalCtrl($modalInstance, $scope, $translate, aa_schedule, aa_index, AACommonService, AADynaAnnounceService, AAModelService, AASessionVariableService, AAUiModelService, RestApiService) {
    var vm = this;

    var GET = 'GET';
    var action;
    var CONSTANTS = {};
    var ui;
    var initialPageEnterCount;

    var dependentCeSessionVariablesList = [];
    var dynamicVariablesList = [];
    var availableSessionVariablesList = [];
    var lastSavedDynList = [];
    var lastSavedVariableList = [];
    var lastSaveDynamicValueSet = [];
    var lastSavedApiRequest = '';
    var lastSavedApiResponse = '';
    var sessionVarOptions = [];
    var urlUpdated = false;
    CONSTANTS.idSelectorPrefix = '#';

    vm.url = '';
    vm.aaElementType = 'REST';

    vm.variableSet = [];
    vm.deletedSessionVariablesList = [];
    vm.addElement = '<aa-insertion-element element-text="DynamicText" read-as="ReadAs" element-id="elementId" id="Id" aa-schedule="' + aa_schedule + '" aa-index="' + aa_index + '" aa-element-type="' + vm.aaElementType + '"></aa-insertion-element>';

    vm.dynamicTags = ['DYNAMIC-EXAMPLE'];
    vm.isDynamicToggle = isDynamicToggle;
    vm.save = save;
    vm.cancel = cancel;
    vm.saveDynamicUi = saveDynamicUi;
    vm.isSaveDisabled = isSaveDisabled;

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
    vm.isNextDisabled = isNextDisabled;
    vm.callTestRestApiConfigs = callTestRestApiConfigs;
    vm.isDynamicListEmpty = isDynamicListEmpty;
    vm.dynamicData = [];
    vm.stepBack = stepBack;
    vm.stepNext = stepNext;
    vm.restApiRequest = '';
    vm.restApiResponse = '';
    vm.currentStep = 0;
    vm.isTestDisabled = isTestDisabled;
    vm.showStep = showStep;
    vm.tableData = [];
    vm.isDynamicsValueUpdated = isDynamicsValueUpdated;
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
      availableSessionVariablesList = _.concat(dependentCeSessionVariablesList, AACommonService.collectThisCeActionValue(ui, true, false));
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
          if (!_.includes(AACommonService.getprePopulatedSessionVariablesList(), (_.get(entry, 'action.eval.value', '')))) {
            dynamicVariablesList.push(entry.action.eval.value);
          }
        }
      });
    }

    function save() {
      //for now set method to GET as default
      action.method = GET;
      updateApiDetails();
      action.variableSet = saveUpdatedVariableSet();
      action.dynamics = saveDynamics(vm.dynamics);
      $modalInstance.close();
    }

    function updateApiDetails() {
      action.restApiRequest = vm.restApiRequest;
      action.restApiResponse = vm.restApiResponse;
    }

    function cancel() {
      updateUiModel();
      $modalInstance.close();
    }

    function updateUiModel() {
      action.url = lastSavedDynList;
      action.variableSet = lastSavedVariableList;
      action.dynamics = saveDynamics(lastSaveDynamicValueSet);
      action.restApiRequest = lastSavedApiRequest;
      action.restApiResponse = lastSavedApiResponse;
    }

    function saveDynamicUi() {
      angular.element(CONSTANTS.idSelectorPrefix.concat('configureApiUrl')).focus();
      var range = AADynaAnnounceService.getRange();
      var dynamicList = range.endContainer.ownerDocument.activeElement;
      if (dynamicList.className.includes('dynamic-prompt') && !(_.isEqual(dynamicList.id, 'configureApiUrl{{schedule + index}}'))) {
        vm.menuEntry.actions[0].dynamicList = createDynamicList(dynamicList, []);
        vm.menuEntry.actions[0].url = vm.menuEntry.actions[0].dynamicList;
        urlUpdated = true;
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
      if (_.isEmpty(dynamicList)) {
        opt = createAction('', false, '');
        finalDynamicList.push(opt);
      } else if (!vm.isDynamicToggle()) {
        opt = createAction(dynamicList.value, false, '');
        finalDynamicList.push(opt);
      } else {
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
              var ele = '<aa-insertion-element element-text="' + attributes[0].value + '" read-as="' + attributes[1].value + '" element-id="' + attributes[2].value + '"id="' + attributes[2].value + '" aa-element-type="' + vm.aaElementType + '"></aa-insertion-element>';
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
      }
      return finalDynamicList;
    }

    function isDynamicListEmpty() {
      var status = true;
      vm.menuEntry.actions[0].url = vm.menuEntry.actions[0].dynamicList;
      var dynamicList = _.get(vm.menuEntry, 'actions[0].url');
      _.forEach(dynamicList, function (dynamic) {
        if (!_.isEmpty(_.get(dynamic, 'action.eval.value', ''))) {
          status = false;
        }
      });
      return status;
    }

    function decodedValue(evalValue) {
      return decodeURIComponent(evalValue).trim();
    }

    function populateUiModel() {
      if (!_.isEmpty(action)) {
        if (!_.isEmpty(action.url)) {
          vm.url = action.url;
          vm.dynamicValues = [];
          _.forEach(action.url, function (opt) {
            var model;
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
        if (!_.isEmpty(action.variableSet)) {
          vm.variableSet = action.variableSet;
        }
        if (!_.isEmpty(action.dynamics)) {
          vm.dynamics = [];
          _.forEach(action.dynamics, function (dyna) {
            vm.dynamics.push(dyna.assignVar);
          });
        }
        if (!_.isEmpty(action.restApiRequest)) {
          vm.restApiRequest = action.restApiRequest;
        }
        if (!_.isEmpty(action.restApiResponse)) {
          vm.restApiResponse = action.restApiResponse;
        }
        if (initialPageEnterCount === 0) {
          lastSavedVariableList = action.variableSet;
          lastSavedDynList = _.get(vm.menuEntry, 'actions[0].url');
          lastSaveDynamicValueSet = vm.dynamics;
          lastSavedApiRequest = vm.restApiRequest;
          lastSavedApiResponse = vm.restApiResponse;
        }
      }
    }

    function isDynamicToggle() {
      return AACommonService.isDynAnnounceToggle();
    }

    function activate() {
      ui = AAUiModelService.getUiModel();
      // will be covered with error user story for variable assignments
      //apiConfig = 'apiConfig' + aa_schedule + '-' + aa_index + '-' + AACommonService.getUniqueId();
      var uiMenu = ui[aa_schedule];

      vm.menuEntry = uiMenu.entries[aa_index];
      if (!_.isUndefined(vm.menuEntry.actions[0])) {
        action = vm.menuEntry.actions[0];
      }
      populateUiModel();
      AASessionVariableService.getSessionVariables(AAModelService.getAAModel().aaRecordUUID).then(function (data) {
        if (!_.isUndefined(data) && data.length > 0) {
          sessionVarOptions = data;
          sessionVarOptions.sort();
        }
      });
      getSessionVariablesOfDependentCe().finally(function () {
        getDynamicVariables();
        refreshVarSelects();
      });
    }

    function showStep(step) {
      return step == vm.currentStep;
    }

    function stepBack() {
      vm.currentStep--;
      initialPageEnterCount++;
      updateApiDetails();
      populateUiModel();
    }

    function stepNext() {
      vm.currentStep++;
      if (vm.menuEntry.actions[0].dynamicList) {
        action.url = vm.menuEntry.actions[0].dynamicList;
      } else {
        action.url = vm.menuEntry.actions[0].url;
      }
      if (vm.currentStep === 2) {
        updateDynamicsList(action.url);
        if (!_.isEmpty(vm.restApiResponse) && (initialPageEnterCount === 0)) {
          createAssignmentTable();
        }
      }
    }

    function updateDynamicsList(url) {
      var arr = [];
      _.forEach(url, function (dyna) {
        if (_.isEqual(dyna.isDynamic, true) && !_.isEmpty(dyna.action.eval.value)) {
          arr.push({ variableName: dyna.action.eval.value, value: '' });
        }
      });
      if (vm.dynamics.length !== 0) {
        _.forEach(vm.dynamics, function (newValue) {
          _.forEach(arr, function (oldValue) {
            if (newValue.variableName === oldValue.variableName) {
              oldValue.value = newValue.value;
            }
          });
        });
      }
      vm.dynamics = arr;
      action.dynamics = saveDynamics(vm.dynamics);
    }


    function isNextDisabled() {
      return (_.isEmpty(vm.url) || vm.url === '<br class="ng-scope">');
    }

    function callTestRestApiConfigs() {
      return RestApiService.testRestApiConfigs(JSON.stringify(updateRequestBody()))
        .then(function (data) {
          vm.restApiRequest = JSON.stringify(JSON.parse(data.request), null, 2);
          if (data.responseCode === '200') {
            vm.restApiResponse = data.response;
            urlUpdated = false;
            createAssignmentTable();
          } else {
            vm.restApiResponse = data.responseCode + ': ' + data.response;
            vm.tableData = [];
          }
        });
    }

    function updateRequestBody() {
      var req = {},
        urlData = _.cloneDeep(action.url);
      _.forEach(urlData, function (dyna) {
        dyna.action.eval.value = decodedValue(dyna.action.eval.value);
        delete (dyna.htmlModel);
        _.forEach(vm.dynamics, function (dynamic) {
          if (_.isEqual(dyna.action.eval.value, dynamic.variableName)) {
            dyna.action.eval.value = dynamic.value;
            dyna.isDynamic = false;
          }
        });
      });
      _.set(req, 'url.action.concat.actions[0].dynamic.dynamicOperations', urlData);
      _.set(req, 'method', 'GET');
      return req;
    }

    function isTestDisabled() {
      var status = false;
      if (!_.isEmpty(vm.dynamics)) {
        _.forEach(vm.dynamics, function (dyna) {
          if (_.isEmpty(dyna.value)) {
            status = true;
            urlUpdated = true;
          }
        });
      }
      return status;
    }

    function saveDynamics(dynamics) {
      var preTestActions = [];
      var assignedVariables = {};
      _.forEach(dynamics, function (dyna) {
        assignedVariables = {};
        _.set(assignedVariables, 'assignVar', dyna);
        preTestActions.push(assignedVariables);
        if (dyna.$$hashKey) {
          delete (dyna.$$hashKey);
        }
      });
      return preTestActions;
    }

    function isDynamicsValueUpdated() {
      urlUpdated = true;
    }

    function isSaveDisabled() {
      var isDisabled = true;
      if (!_.isEmpty(vm.tableData)) {
        _.forEach(vm.tableData, function (data) {
          if (!_.isEmpty(data.selected)) {
            isDisabled = false;
            return isDisabled || urlUpdated;
          }
        });
      }
      return isDisabled || urlUpdated;
    }

    function saveUpdatedVariableSet() {
      var arr = [];
      _.forEach(vm.tableData, function (data) {
        if (!_.isEmpty(data.selected)) {
          var obj = {};
          obj.variableName = data.selected;
          obj.value = data.responseKey;
          arr.push(obj);
        }
      });
      vm.variableSet = _.sortBy(arr, 'variableName');
      return vm.variableSet;
    }

    function createAssignmentTable() {
      var tempTableData = [];
      _.forEach(JSON.parse(vm.restApiResponse), function (value, key) {
        if (_.isString(value)) {
          var obj = {};
          obj.responseKey = key;
          obj.responseValue = value;
          obj.options = sessionVarOptions;
          _.forEach(vm.variableSet, function (set) {
            if (_.isEqual(set.value, key)) {
              obj.selected = set.variableName;
            }
          });
          tempTableData.push(obj);
        }
      });
      vm.tableData = tempTableData;
    }

    function init() {
      $scope.schedule = aa_schedule;
      $scope.index = aa_index;
      vm.currentStep = 1;
      vm.dynamics = [];
      initialPageEnterCount = 0;
      activate();
    }

    init();
  }
})();
