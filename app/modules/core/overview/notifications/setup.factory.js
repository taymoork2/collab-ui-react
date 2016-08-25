(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewSetupNotification', OverviewSetupNotification);

  /* @ngInject */
  function OverviewSetupNotification($state) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: false,
          dismiss: function () {},
          link: function () {
            $state.go('firsttimewizard');
          },
          linkText: 'homePage.beginTrial',
          name: 'setup',
          text: 'homePage.setUpYourTrial'
        };

        return notification;
      }
    };
  }
})();
