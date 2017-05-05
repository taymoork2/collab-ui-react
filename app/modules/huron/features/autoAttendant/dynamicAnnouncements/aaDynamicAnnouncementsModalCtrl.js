(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADynamicAnnouncementsModalCtrl', AADynamicAnnouncementsModalCtrl);

  /* @ngInject */
  function AADynamicAnnouncementsModalCtrl($modalInstance, $translate, AASessionVariableService, AAModelService, AACommonService) {
    var vm = this;

    vm.selectPlaceholder = $translate.instant('common.select');
    vm.ok = ok;
    vm.isSaveEnabled = isSaveEnabled;
    vm.readAsSelection = {
      label: '',
      value: '',
    };
    vm.readAsOptions = [
      {
        label: $translate.instant('autoAttendant.date'),
        value: 'DATE',
      },
      {
        label: $translate.instant('autoAttendant.digits'),
        value: 'DIGITS',
      },
      {
        label: $translate.instant('autoAttendant.number'),
        value: 'NUMBER',
      },
    ];
    vm.variableSelection = {
      label: '',
      value: '',
    };
    vm.variableOptions = [
      {
        label: $translate.instant('autoAttendant.decisionNumberDialed'),
        value: 'Original-Called-Number',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerNumber'),
        value: 'Original-Caller-Number',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerName'),
        value: 'Original-Remote-Party-ID',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerCountryCode'),
        value: 'Original-Caller-Country-Code',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerAreaCode'),
        value: 'Original-Caller-Area-Code',
      },
    ];

    //////////////////////////////////

    //else the dismiss was called
    function ok() {
      //do something with ng-models
      $modalInstance.close();
    }

    function isSaveEnabled() {
      if (vm.readAsSelection.label && vm.variableSelection.label) {
        return true;
      }
      return false;
    }


    function populateUiModel() {
      //TODO
    }

    function activate() {
      populateUiModel();
    }

    function populateScope() {
      //TODO
    }

    function setUpVariablesOptions(variableOptionsArray) {
      _.forEach(variableOptionsArray, function (variableOptions) {
        _.forEach(variableOptions, function (variableOption) {
          vm.variableOptions.push(variableOption);
        });
      });
      vm.variableOptions.sort(AACommonService.sortByProperty('label'));
    }

    function getSessionVariablesOptions() {
      return AASessionVariableService.getSessionVariables(AAModelService.getAAModel().aaRecordUUID);
    }

    function handleSessionVariablesOptions(variablesOptions, sessionVarOptions) {
      var sessionVarOptionsObjs = [];
      _.forEach(sessionVarOptions, function (sessionVarOption) {
        sessionVarOptionsObjs.push(
          {
            label: sessionVarOption,
            value: sessionVarOption,
          }
        );
      });
      if (!_.isUndefined(sessionVarOptions) && sessionVarOptions.length > 0) {
        variablesOptions.push(sessionVarOptionsObjs);
      }
    }

    function executeAsyncWaitTasks(variablesOptions) {
      return getSessionVariablesOptions()
        .then(handleSessionVariablesOptions.bind(null, variablesOptions)
        //add multiple thens for various types of variables, from scope or elsewhere
      );
    }

    function init() {
      populateScope();
      var variablesOptions = [];
      executeAsyncWaitTasks(variablesOptions)
        .finally(function () {
          setUpVariablesOptions(variablesOptions);
          activate();
        }
      );
    }

    init();
  }
})();
