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
    var lastSavedUsername = '';
    var lastSavedPassword = '';
    var lastSavedCredentialId = '';
    var sessionVarOptions = [];
    var urlUpdated = false;
    var hasSessionVarOptionsChecked = false;
    var basicCredentialUpdated = false;
    CONSTANTS.passwordToBeDisplayed = '**********';
    CONSTANTS.idSelectorPrefix = '#';

    vm.url = '';
    vm.username = '';
    vm.password = '';
    vm.aaElementType = 'REST';
    vm.basicAuthButton = false;

    vm.variableSet = [];
    vm.deletedSessionVariablesList = [];
    vm.usernameMinLength = 1;
    vm.usernameMaxLength = 128;
    vm.passwordMaxLength = 128;
    vm.addElement = '<aa-insertion-element element-text="DynamicText" read-as="ReadAs" element-id="elementId" id="Id" aa-schedule="' + aa_schedule + '" aa-index="' + aa_index + '" aa-element-type="' + vm.aaElementType + '"></aa-insertion-element>';

    vm.dynamicTags = ['DYNAMIC-EXAMPLE'];
    vm.isDynamicToggle = isDynamicToggle;
    vm.isRestApiTogglePhase2 = isRestApiTogglePhase2;
    vm.save = save;
    vm.cancel = cancel;
    vm.saveDynamicUi = saveDynamicUi;
    vm.isSaveDisabled = isSaveDisabled;
    vm.passwordCheck = passwordCheck;
    vm.isBasicCredentialUpdated = isBasicCredentialUpdated;

    vm.newVariable = $translate.instant('autoAttendant.newVariable');
    vm.validationUsernameMsgs = {
      maxlength: $translate.instant('autoAttendant.usernameTooLongMsg'),
      required: $translate.instant('autoAttendant.usernameRequiredMsg'),
    };
    vm.validationPasswordMsgs = {
      maxlength: $translate.instant('autoAttendant.passwordTooLongMsg'),
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
    vm.onBasicAuthSlider = onBasicAuthSlider;
    vm.displayWarning = displayWarning;
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

    function isRestApiTogglePhase2() {
      return AACommonService.isRestApiTogglePhase2();
    }

    function passwordCheck() {
      basicCredentialUpdated = true;
      if (_.isEqual(vm.password, CONSTANTS.passwordToBeDisplayed)) {
        vm.password = '';
      }
    }

    function onBasicAuthSlider() {
      basicCredentialUpdated = true;
      if (!vm.basicAuthButton) {
        vm.username = '';
        vm.password = '';
      } else {
        vm.username = lastSavedUsername;
        if (_.isUndefined(lastSavedUsername)) {
          vm.username = '';
        } else {
          vm.username = lastSavedUsername;
        }
      }
    }

    function displayWarning() {
      // We have to bind the AuthButton status with the username
      // field validation. It's required as the moment the
      // authButton goes false, the username is set to empty which
      // causes the warning red flag.
      if (vm.basicAuthButton && vm.username !== '') {
        return true;
      }
      return false;
    }

    function save() {
      //for now set method to GET as default
      action.method = GET;
      updateApiDetails();
      action.variableSet = saveUpdatedVariableSet();
      action.dynamics = saveDynamics(vm.dynamics);
      if (isRestApiTogglePhase2()) {
        if (vm.basicAuthButton) {
          action.username = vm.username;
          if (!_.isEqual(vm.password, CONSTANTS.passwordToBeDisplayed)) {
            action.password = Buffer.from(vm.password).toString('base64');
            action.credentialId = '';
          } else {
            action.credentialId = lastSavedCredentialId;
            action.password = lastSavedPassword;
          }
        }
      }
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
      action.username = lastSavedUsername;
      action.password = lastSavedPassword;
      action.credentialId = lastSavedCredentialId;
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

    function createAuthentication() {
      var authenticationBlock = {
        type: 'BASIC',
        credentials: {
          username: action.username,
          password: action.password,
          id: action.credentialId,
        },
      };
      return authenticationBlock;
    }

    function populateBasicAuth(action) {
      if (isRestApiTogglePhase2()) {
        if (!_.isEmpty(action.username)) {
          vm.basicAuthButton = true;
          vm.username = action.username;
          if (_.isEmpty(vm.password) || _.isEqual(vm.password, CONSTANTS.passwordToBeDisplayed)) {
            vm.password = CONSTANTS.passwordToBeDisplayed;
          } else {
            vm.password = Buffer.from(action.password, 'base64').toString();
          }
        }
        if (initialPageEnterCount === 0) {
          lastSavedUsername = action.username;
          lastSavedPassword = action.password;
          lastSavedCredentialId = action.credentialId;
        }
      }
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
        populateBasicAuth(action);
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
        hasSessionVarOptionsChecked = true;
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
      if (urlUpdated) {
        action.url = vm.menuEntry.actions[0].dynamicList;
      } else {
        action.url = vm.menuEntry.actions[0].url;
      }
      action.username = vm.username;
      if (!_.isEqual(vm.password, CONSTANTS.passwordToBeDisplayed)) {
        action.password = Buffer.from(vm.password).toString('base64');
        action.credentialId = '';
      } else {
        action.credentialId = lastSavedCredentialId;
        action.password = lastSavedPassword;
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

    function validatePassword() {
      return (!_.isUndefined(vm.password));
    }

    function validateUserName() {
      return !_.isEmpty(vm.username);
    }

    function isNextDisabled() {
      if (vm.basicAuthButton) {
        return (_.isEmpty(vm.url) || vm.url === '<br class="ng-scope">' || !validatePassword() || !validateUserName() || !hasSessionVarOptionsChecked);
      }
      return (_.isEmpty(vm.url) || vm.url === '<br class="ng-scope">' || !hasSessionVarOptionsChecked);
    }

    function callTestRestApiConfigs() {
      vm.restApiRequest = '';
      vm.restApiResponse = '';
      vm.tableData = [];
      return RestApiService.testRestApiConfigs(JSON.stringify(updateRequestBody()))
        .then(function (data) {
          vm.restApiRequest = JSON.stringify(JSON.parse(data.request), null, 2);
          if (data.responseCode === '200') {
            vm.restApiResponse = data.response;
            urlUpdated = false;
            basicCredentialUpdated = false;
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
      if (isRestApiTogglePhase2() && vm.basicAuthButton) {
        _.set(req, 'authentication', createAuthentication());
      }
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

    function isBasicCredentialUpdated() {
      basicCredentialUpdated = true;
    }

    function isSaveDisabled() {
      var isDisabled = true;
      if (!_.isEmpty(vm.tableData)) {
        _.forEach(vm.tableData, function (data) {
          if (!_.isEmpty(data.selected)) {
            isDisabled = false;
            return isDisabled || urlUpdated || basicCredentialUpdated;
          }
        });
      }
      return isDisabled || urlUpdated || basicCredentialUpdated;
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
      var selectedVariables = [];
      var nonSelectedVariables = [];
      var tableWithSortedVariables = [];
      var tempTableData = [];
      var validJsonResponse = isValidJson(vm.restApiResponse);
      if (validJsonResponse) {
        _.forEach(validJsonResponse, function (value, key) {
          if (_.isString(value)) {
            var obj = {};
            obj.responseKey = key;
            obj.responseValue = value;
            obj.options = _.cloneDeep(sessionVarOptions);
            _.forEach(vm.variableSet, function (set) {
              if (_.isEqual(set.value, key)) {
                obj.selected = set.variableName;
              }
            });
            tempTableData.push(obj);
          }
        });
        _.forEach(tempTableData, function (tempData) {
          if (tempData.hasOwnProperty('selected')) {
            selectedVariables.push(tempData);
          } else {
            nonSelectedVariables.push(tempData);
          }
        });
        tableWithSortedVariables = _.concat(_.orderBy(selectedVariables, ['responseKey'], ['asc']), _.orderBy(nonSelectedVariables, ['responseKey'], ['asc']));
      }
      vm.tableData = tableWithSortedVariables;
    }

    function isValidJson(jsonData) {
      try {
        return JSON.parse(jsonData);
      } catch (exception) {
        return false;
      }
    }

    $scope.$on('dynamicListUpdated', function () {
      isDynamicsValueUpdated();
    });


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
