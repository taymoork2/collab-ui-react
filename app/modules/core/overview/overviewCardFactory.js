(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCardFactory', OverviewCardFactory);

  /* @ngInject */
  function OverviewCardFactory(OverviewCallCard, OverviewMeetingCard, OverviewRoomSystemsCard, OverviewMessageCard, OverviewHybridServicesCard, OverviewUsersCard) {

    return {
      messageCard: OverviewMessageCard,
      meetingCard: OverviewMeetingCard,
      callCard: OverviewCallCard,
      roomSystemsCard: OverviewRoomSystemsCard,
      hybridServicesCard: OverviewHybridServicesCard,
      usersCard: OverviewUsersCard
    };
  }
})();
