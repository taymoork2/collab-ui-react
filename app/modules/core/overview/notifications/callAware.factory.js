(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallAwareNotification', OverviewCallAwareNotification);

  /* @ngInject */
  function OverviewCallAwareNotification($state, HybridServicesFlagService, HybridServicesUtilsService) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtilsService.getAckFlagForHybridServiceId('squared-fusion-uc'));
          },
          link: function () {
            $state.go('services-overview');
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
