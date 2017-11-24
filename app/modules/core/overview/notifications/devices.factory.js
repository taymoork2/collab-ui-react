(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewDevicesNotification', OverviewDevicesNotification);

  /* @ngInject */
  function OverviewDevicesNotification($state, FeatureToggleService) {
    return {
      createNotification: function createNotification(text) {
        var devicesLocation = 'devices';
        FeatureToggleService.csdmDevRedGetStatus().then(function (toggle) {
          if (toggle) {
            devicesLocation = 'devices-redux';
          }
        });
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
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
