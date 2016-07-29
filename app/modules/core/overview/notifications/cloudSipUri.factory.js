(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCloudSipUriNotification', OverviewCloudSipUriNotification);

  /* @ngInject */
  function OverviewCloudSipUriNotification($state) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $state.go('setupwizardmodal', {
              currentTab: 'enterpriseSettings'
            });
          },
          linkText: 'homePage.goSetupCloudSipUri',
          name: 'cloudSipUri',
          text: 'homePage.setupCloudSipUriMessage'
        };

        return notification;
      }
    };
  }
})();
