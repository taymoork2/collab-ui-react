(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallConnectNotification', OverviewCallConnectNotification);

  /* @ngInject */
  function OverviewCallConnectNotification($state, HybridServicesFlagService, HybridServicesUtils) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtils.getAckFlagForHybridServiceId('squared-fusion-ec'));
          },
          link: function () {
            $state.go('call-service.list');
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
