(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCalendarNotification', OverviewCalendarNotification);

  /* @ngInject */
  function OverviewCalendarNotification($state, Orgservice) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            Orgservice.setHybridServiceAcknowledged('calendar-service');
          },
          link: function () {
            $state.go('calendar-service.list');
          },
          linkText: 'homePage.getStarted',
          name: 'calendar',
          text: 'homePage.setUpCalendarService'
        };

        return notification;
      }
    };
  }
})();
