(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCalendarNotification', OverviewCalendarNotification);

  /* @ngInject */
  function OverviewCalendarNotification($state, HybridServicesFlagService, HybridServicesUtilsService) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtilsService.getAckFlagForHybridServiceId('squared-fusion-cal'));
          },
          link: function () {
            $state.go('services-overview');
          },
          linkText: 'homePage.getStarted',
          name: 'calendar',
          text: 'homePage.setUpCalendarService',
        };

        return notification;
      },
    };
  }
})();
