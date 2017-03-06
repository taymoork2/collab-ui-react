(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCareLicenseNotification', OverviewCareLicenseNotification);

  /* @ngInject */
  function OverviewCareLicenseNotification($state) {
    return {
      createNotification: function createNotification(text, linkText) {
        var notification = {
          badgeText: 'homePage.todo',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            $state.go('my-company.subscriptions');
          },
          linkText: linkText,
          name: 'careLicense',
          text: text,
        };

        return notification;
      },
    };
  }
})();
