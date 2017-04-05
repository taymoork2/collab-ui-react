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
  function ContextFieldsetsSidepanelCtrl($translate, $filter) {

    var vm = this;

    vm.$onInit = function () {
      vm.fields = vm.fieldset.fieldDefinitions;
      vm.lastUpdated = $filter('date')(vm.fieldset.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
    };
  }
})();
