(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCardFactory', OverviewCardFactory);

  /* @ngInject */
  function OverviewCardFactory(OverviewBroadsoftCard, OverviewHybridServicesCard, OverviewUsersCard, OverviewCareCard) {
    return {
      createBroadsoftCard: OverviewBroadsoftCard.createCard,
      createCareCard: OverviewCareCard.createCard,
      createHybridServicesCard: OverviewHybridServicesCard.createCard,
      createUsersCard: OverviewUsersCard.createCard,
    };
  }
})();
