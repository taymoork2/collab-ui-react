(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCardFactory', OverviewCardFactory);

  /* @ngInject */
  function OverviewCardFactory(OverviewCallCard, OverviewMeetingCard, OverviewRoomSystemsCard, OverviewMessageCard, OverviewHybridServicesCard, OverviewUsersCard) {
    return {
      createMessageCard: OverviewMessageCard.createCard,
      createMeetingCard: OverviewMeetingCard.createCard,
      createCallCard: OverviewCallCard.createCard,
      createRoomSystemsCard: OverviewRoomSystemsCard.createCard,
      createHybridServicesCard: OverviewHybridServicesCard.createCard,
      createUsersCard: OverviewUsersCard.createCard
    };
  }
})();
