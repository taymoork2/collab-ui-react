require('../resources/_resources.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextContainerController', HybridContextContainerController);

  /* @ngInject */
  function HybridContextContainerController(backState) {
    var vm = this;
    // default backState to the services-overview page unless otherwise specified
    vm.backState = backState || 'services-overview';
    vm.tabs = [
      {
        title: 'servicesOverview.cards.hybridContext.buttons.resources',
        state: 'context-resources',
      },
      {
        title: 'servicesOverview.cards.hybridContext.buttons.fields',
        state: 'context-fields',
      },
      {
        title: 'servicesOverview.cards.hybridContext.buttons.fieldsets',
        state: 'context-fieldsets',
      },
    ];

  }
}());
