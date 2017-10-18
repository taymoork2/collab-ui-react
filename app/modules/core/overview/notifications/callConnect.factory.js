(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallConnectNotification', OverviewCallConnectNotification);

  /* @ngInject */
  function OverviewCallConnectNotification($state, HybridServicesFlagService, HybridServicesUtilsService) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtilsService.getAckFlagForHybridServiceId('squared-fusion-ec'));
          },
          link: function () {
            $state.go('services-overview');
          },
          linkText: 'homePage.getStarted',
          name: 'callConnect',
          text: 'homePage.setUpCallConnectService',
        };

        return notification;
      },
    };
  }
})();
