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
    vm.tabs = [
      {
        title: $translate.instant('servicesOverview.cards.hybridContext.buttons.resources'),
        state: 'context-resources',
      },
      {
        title: $translate.instant('servicesOverview.cards.hybridContext.buttons.fields'),
        state: 'context-fields',
      },
      {
        title: $translate.instant('servicesOverview.cards.hybridContext.buttons.fieldsets'),
        state: 'context-fieldsets',
      },
    ];

  }
}());
