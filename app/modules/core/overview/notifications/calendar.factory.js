(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCalendarNotification', OverviewCalendarNotification);

  /* @ngInject */
  function OverviewCalendarNotification($state, HybridServicesFlagService, HybridServicesUtils) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtils.getAckFlagForHybridServiceId('squared-fusion-cal'));
          },
          link: function () {
            $state.go('calendar-service.list');
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
