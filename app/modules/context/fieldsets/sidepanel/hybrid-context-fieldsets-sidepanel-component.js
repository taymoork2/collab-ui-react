require('./_fieldsets-sidepanel.scss');

(function () {
  'use strict';

  angular.module('Context')
    .component('contextFieldsetsSidepanel', {
      controller: ContextFieldsetsSidepanelCtrl,
      templateUrl: 'modules/context/fieldsets/sidepanel/hybrid-context-fieldsets-sidepanel.html',
      bindings: {
        fieldset: '<',
      },
    });

  /* @ngInject */
  function ContextFieldsetsSidepanelCtrl(ContextFieldsetsService, $translate, $filter) {

    var vm = this;
    vm.inUse = false;
    vm.inUseTooltipMessage = $translate.instant('context.dictionary.fieldsetPage.notInUseTooltip');
    vm.actionList = [{
      actionKey: 'common.edit',
    }];
    vm.hasDescription = false;
    vm.statusFetchFailure = false;
    vm.publiclyAccessible = true;

    vm.$onInit = function () {
      vm._getInUse();
      vm.fields = vm.fieldset.fieldDefinitions;
      vm.lastUpdated = $filter('date')(vm.fieldset.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
      if (!_.isEmpty(vm.fieldset.description)) {
        vm.hasDescription = true;
      }

      if (!_.isEmpty(vm.fieldset.publiclyAccessible)) {
        vm.publiclyAccessible = vm.fieldset.publiclyAccessible.toLowerCase() === 'cisco';
      }
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
  }
})();
