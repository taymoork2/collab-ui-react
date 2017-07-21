require('../resources/_resources.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextContainerController', HybridContextContainerController);

  /* @ngInject */
  function HybridContextContainerController($translate, backState) {
    var vm = this;
    // default backState to the services-overview page unless otherwise specified
    vm.backState = backState || 'services-overview';
    vm.header = $translate.instant('hercules.hybridServiceNames.hybrid-context');
    vm.tabs = [
      {
        title: this.$translate.instant('servicesOverview.cards.hybridContext.buttons.resources'),
        state: 'context-resources',
      },
      {
        title: this.$translate.instant('servicesOverview.cards.hybridContext.buttons.fields'),
        state: 'context-fields',
      },
      {
        title: this.$translate.instant('servicesOverview.cards.hybridContext.buttons.fieldsets'),
        state: 'context-fieldsets',
      },
    ];
  }
}());
