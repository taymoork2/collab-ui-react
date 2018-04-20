(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewDevicesNotification', OverviewDevicesNotification);

  /* @ngInject */
  function OverviewDevicesNotification($state) {
    return {
      createNotification: function createNotification(text) {
        var devicesLocation = 'devices';
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {
          },
          link: function () {
            $state.go(devicesLocation);
          },
          linkText: 'homePage.getStarted',
          name: 'devices',
          text: text,
        };

        return notification;
      },
    };
  }
})();
