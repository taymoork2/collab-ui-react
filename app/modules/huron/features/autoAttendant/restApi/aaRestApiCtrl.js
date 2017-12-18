(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARestApiCtrl', AARestApiCtrl);

  /* @ngInject */
  function AARestApiCtrl($modal, $scope, AutoAttendantCeMenuModelService, AACommonService, AAUiModelService) {
    var vm = this;

    var doREST = 'doREST';
    var action;
    vm.variables = [];

    vm.method = '';
    vm.url = '';
    vm.uniqueCtrlIdentifer = '';

    vm.openConfigureApiModal = openConfigureApiModal;

    /////////////////////

    function checkVariableName(value) {
      if (_.isEmpty(value) || !(AACommonService.getVarOption(value))) {
        return value;
      } else {
        return AACommonService.getVarOption(value);
      }
    }

    function decodedValue(evalValue) {
      return _.trim(decodeURIComponent(evalValue));
    }

    function createAction(actionValue, htmlValue, isDynamicValue) {
      var action = {
        model: actionValue,
        html: htmlValue,
        isDynamic: isDynamicValue,
      };
      if (isDynamicValue) {
        action.label = checkVariableName(actionValue);
      }
      return action;
    }

    function openConfigureApiModal() {
      openModal().result.then(function () {
        vm.method = action.method;
        vm.variables = action.variableSet;
        if (!_.isEmpty(action)) {
          if (!_.isEmpty(action.url)) {
            vm.dynamicValues = [];
            _.forEach(action.url, function (opt) {
              var model;
              var evalValue = _.get(opt.action.eval, 'value', '');
              if (!opt.isDynamic) {
                model = createAction(decodedValue(evalValue), evalValue, false);
              } else {
                model = createAction(evalValue, opt.htmlModel, true);
              }
              if (!_.isEqual(opt.htmlModel, '%3Cbr%3E')) {
                vm.dynamicValues.push(model);
              }
            });
          }
        }
        vm.url = action.url;
        if (!_.isEmpty(vm.method) && !_.isEmpty(vm.dynamicValues)) {
          AACommonService.setRestApiStatus(true);
          AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
        }
      });
    }

    $scope.$on(
      '$destroy',
      function () {
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, true);
      }
    );

    function openModal() {
      return $modal.open({
        template: require('modules/huron/features/autoAttendant/restApi/aaConfigureApiModal.tpl.html'),
        controller: 'AAConfigureApiModalCtrl',
        controllerAs: 'aaConfigureApiModal',
        type: 'full',
        resolve: {
          aa_schedule: function () {
            return $scope.schedule;
          },
          aa_index: function () {
            return $scope.index;
          },
        },
      });
    }

    function populateUiModel() {
      if (_.isEmpty(action)) {
        return;
      }
      if (_.isEmpty(action.url)) {
        return;
      }
      vm.dynamicValues = [];
      _.forEach(action.url, function (opt) {
        var model;
        var evalValue = _.get(opt.action.eval, 'value');
        if (!opt.isDynamic) {
          model = createAction(decodeURIComponent(evalValue), evalValue, false);
        } else {
          model = createAction(evalValue, decodeURIComponent(opt.htmlModel), true);
        }

        if (!_.isEqual(opt.htmlModel, '%3Cbr%3E')) {
          vm.dynamicValues.push(model);
        }
      });
      vm.method = action.method;
      vm.variables = action.variableSet;
    }

    function activate() {
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[$scope.schedule];
      vm.menuEntry = vm.uiMenu.entries[$scope.index];
      action = _.get(vm.menuEntry, 'actions[0]', '');
      vm.uniqueCtrlIdentifer = AACommonService.makeKey($scope.schedule, AACommonService.getUniqueId());
      if (_.get(action, 'name', '') !== doREST) {
        action = AutoAttendantCeMenuModelService.newCeActionEntry(doREST, '');
        action.url = '';
        action.method = '';
        action.variables = [];
        action.restApiRequest = '';
        action.restApiResponse = '';
        action.username = '';
        action.password = '';
        action.credentialId = '';
        vm.menuEntry.addAction(action);
        AACommonService.setRestApiStatus(false);
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, false);
      }

      populateUiModel();
    }

    activate();
  }
})();
