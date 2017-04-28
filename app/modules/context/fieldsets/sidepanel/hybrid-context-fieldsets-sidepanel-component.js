require('./_fieldsets-sidepanel.scss');

(function () {
  'use strict';

  angular.module('Context')
    .component('contextFieldsetsSidepanel', {
      controller: ContextFieldsetsSidepanelCtrl,
      templateUrl: 'modules/context/fieldsets/sidepanel/hybrid-context-fieldsets-sidepanel.html',
      bindings: {
        fieldset: '<',
        process: '<',
        callback: '<',
      },
    });

  /* @ngInject */
  function ContextFieldsetsSidepanelCtrl(ContextFieldsetsService, $translate, $filter, $state) {

    var vm = this;
    vm.inUse = false;
    vm.inUseTooltipMessage = $translate.instant('context.dictionary.fieldsetPage.notInUseTooltip');
    vm.hasDescription = false;
    vm.statusFetchFailure = false;
    vm.publiclyAccessible = false;
    vm.actionList = [{
      actionKey: 'common.edit',
      actionFunction: function () {
        $state.go('context-fieldset-modal', {
          existingFieldsetData: vm.fieldset,
          callback: function (updatedFieldset) {
            vm.fieldset = vm.process(_.cloneDeep(updatedFieldset));
            vm.callback(updatedFieldset);
          },
        });
      },
    }];

    vm._fixFieldsetData = function () {
      vm.fields = vm.fieldset.fieldDefinitions;
      vm.lastUpdated = $filter('date')(vm.fieldset.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
      if (!_.isEmpty(vm.fieldset.description)) {
        vm.hasDescription = true;
      }

      //convert the UI friendly text to the actual boolean value
      vm.publiclyAccessible = vm.fieldset.publiclyAccessible;
    };

    vm._getInUse = function () {
      return ContextFieldsetsService.getInUse(vm.fieldset.id)
        .then(function (status) {
          vm.inUse = status;

          if (vm.inUse) {
            vm.inUseTooltipMessage = $translate.instant('context.dictionary.fieldsetPage.inUseTooltip');
          }
        }).catch(function () {
          vm.statusFetchFailure = true;
        });
    };

    vm.$onInit = function () {
      vm._fixFieldsetData();
      vm._getInUse();
    };
  }
})();
