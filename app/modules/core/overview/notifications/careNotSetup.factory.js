(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCareNotSetupNotification', OverviewCareNotSetupNotification);

  /* @ngInject */
  function OverviewCareNotSetupNotification($state, SunlightUtilitiesService) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {
            SunlightUtilitiesService.cacheCareSetupStatus();
          },
          link: function () {
            $state.go('care.Settings');
          },
          linkText: 'homePage.setUpCareLinkText',
          name: 'careSetupNotification',
          text: SunlightUtilitiesService.getCareSetupNotificationText(),
        };

        return notification;
      },
    };
  }
})();
