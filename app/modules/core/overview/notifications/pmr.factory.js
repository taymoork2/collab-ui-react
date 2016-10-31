(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewPMRNotification', OverviewPMRNotification);

  /* @ngInject */
  function OverviewPMRNotification($state) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $state.go('services-overview');
          },
          linkText: 'homePage.setUpPMRUrl',
          name: 'pmr',
          text: 'homePage.setUpPMRDescription'
        };

        return notification;
      }
    };
  }
})();
