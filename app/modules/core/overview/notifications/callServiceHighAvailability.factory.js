(function () {
  'use strict';

  angular
    .module('Core')
    .factory('CallServiceHighAvailability', CallServiceHighAvailability);

  /* @ngInject */
  function CallServiceHighAvailability($window, HybridServicesFlagService) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.info',
          badgeType: 'info',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag('atlas.notification.squared-fusion-uc-high-availability.acknowledged');
          },
          link: function () {
            $window.open('http://www.cisco.com/go/hybrid-services-call');
          },
          linkText: 'homePage.callServiceHighAvailabilityLink',
          name: 'callServiceHighAvailability',
          text: 'homePage.callServiceHighAvailability',
        };
        return notification;
      },
    };
  }
})();
