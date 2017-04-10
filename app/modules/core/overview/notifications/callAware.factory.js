(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallAwareNotification', OverviewCallAwareNotification);

  /* @ngInject */
  function OverviewCallAwareNotification($state, HybridServicesFlagService, HybridServicesUtils) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtils.getAckFlagForHybridServiceId('squared-fusion-uc'));
          },
          link: function () {
            $state.go('call-service.list');
          },
          linkText: 'homePage.getStarted',
          name: 'callAware',
          text: 'homePage.setUpCallAwareService',
        };

        return notification;
      },
    };
  }
})();
