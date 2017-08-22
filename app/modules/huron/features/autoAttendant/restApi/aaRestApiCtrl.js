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
      return decodeURIComponent(evalValue).trim();
    }

    function openConfigureApiModal() {
      openModal().result.then(function () {
        vm.method = action.method;
        vm.variables = action.variableSet;
        if (!_.isEmpty(action)) {
          if (_.has(action, 'dynamicList')) {
            vm.dynamicValues = [];
            _.forEach(action.dynamicList, function (opt) {
              var model = {};
              if (!opt.isDynamic) {
                model = {
                  model: decodedValue(_.get(opt.action.eval, 'value')),
                  html: _.get(opt.action.eval, 'value'),
                  isDynamic: false,
                };
              } else {
                model = {
                  model: _.get(opt.action.eval, 'value'),
                  label: checkVariableName(_.get(opt.action.eval, 'value')),
                  html: decodeURIComponent(opt.htmlModel),
                  isDynamic: true,
                };
              }
              if (!_.isEqual(opt.htmlModel, '%3Cbr%3E')) {
                vm.dynamicValues.push(model);
              }
            });
          }
        }
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
        templateUrl: 'modules/huron/features/autoAttendant/restApi/aaConfigureApiModal.tpl.html',
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
      if (!_.has(action, 'dynamicList')) {
        return;
      }
      vm.dynamicValues = [];
      _.forEach(action.dynamicList, function (opt) {
        var model = {};
        if (!opt.isDynamic) {
          model = {
            model: _.get(opt.action.eval, 'value'),
            html: _.get(opt.action.eval, 'value'),
            isDynamic: false,
          };
        } else {
          model = {
            model: _.get(opt.action.eval, 'value'),
            label: checkVariableName(_.get(opt.action.eval, 'value')),
            html: decodeURIComponent(opt.htmlModel),
            isDynamic: true,
          };
        }
        vm.dynamicValues.push(model);
      });
      vm.method = action.method;
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
        vm.menuEntry.addAction(action);
        AACommonService.setRestApiStatus(false);
        AACommonService.setIsValid(vm.uniqueCtrlIdentifer, false);
      }

      populateUiModel();
    }

    activate();
  }
})();
