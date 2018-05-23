(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AADynamicAnnouncementsModalCtrl', AADynamicAnnouncementsModalCtrl);

  /* @ngInject */
  function AADynamicAnnouncementsModalCtrl($modalInstance, $translate, aaElementType, readAsSelection, variableSelection, AACommonService, AAModelService, AASessionVariableService, AAUiModelService/*, aa_schedule, aa_index*/) {
    var vm = this;

    vm.selectPlaceholder = $translate.instant('common.select');
    vm.ok = ok;
    vm.isSaveEnabled = isSaveEnabled;
    vm.isReadAsVisible = true;
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
      {
        label: $translate.instant('autoAttendant.word'),
        value: '',
      },
    ];
    vm.readAsSelection = {
      label: '',
      value: '',
    };
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
      var result = {
        variable: vm.variableSelection,
        readAs: vm.readAsSelection,
      };
      $modalInstance.close(result);
    }

    function isSaveEnabled() {
      return vm.variableSelection.label;
    }

    function getIsReadAsVisible() {
      if (_.isEqual(aaElementType, 'REST')) {
        vm.isReadAsVisible = !vm.isReadAsVisible;
      }
      return vm.isReadAsVisible;
    }

    function populateUiModel() {
      //TODO
    }

    function activate() {
      vm.readAsSelection = _.find(vm.readAsOptions, { value: readAsSelection });
      vm.variableSelection = _.find(vm.variableOptions, { value: variableSelection });
      if (_.isUndefined(vm.readAsSelection)) {
        vm.readAsSelection = vm.readAsOptions[3];
      }
      if (_.isUndefined(vm.variableSelection)) {
        vm.variableSelection = {
          label: '',
          value: '',
        };
      }
      populateUiModel();
    }

    function populateScope() {
      //TODO
    }

    function setUpVariablesOptions(variableOptionsArray) {
      var custonVariablesFromUiModel = [];

      _.forEach(variableOptionsArray, function (variableOptions) {
        _.forEach(variableOptions, function (variableOption) {
          vm.variableOptions.push(variableOption);
        });
      });

      custonVariablesFromUiModel = AACommonService.collectThisCeActionValue(AAUiModelService.getUiModel(), true, false);

      _.forEach(custonVariablesFromUiModel, function (uiVar) {
        vm.variableOptions = _.concat(vm.variableOptions, { label: uiVar, value: uiVar });
      });

      vm.variableOptions = _.uniqWith(vm.variableOptions, _.isEqual).sort(AACommonService.sortByProperty('label'));
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
      getIsReadAsVisible();
      var variablesOptions = [];
      executeAsyncWaitTasks(variablesOptions)
        .catch(_.noop)
        .finally(function () {
          setUpVariablesOptions(variablesOptions);
          activate();
        }
        );
    }

    init();
  }
})();
