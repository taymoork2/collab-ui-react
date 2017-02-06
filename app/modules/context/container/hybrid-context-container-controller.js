(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextContainerController', HybridContextContainerController);

  /* @ngInject */
  function HybridContextContainerController($translate) {

    var vm = this;
    vm.backState = 'services-overview';
    vm.tabs = [
      {
        title: $translate.instant('servicesOverview.cards.hybridContext.buttons.resources'),
        state: 'context-resources',
      },
      {
        title: $translate.instant('servicesOverview.cards.hybridContext.buttons.fields'),
        state: 'context-fields'
      },
      {
        title: $translate.instant('servicesOverview.cards.hybridContext.buttons.fieldsets'),
        state: 'context-fieldsets'
      }
    ];
  }
}());
