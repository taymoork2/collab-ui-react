(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewCallAwareNotification', OverviewCallAwareNotification);

  /* @ngInject */
  function OverviewCallAwareNotification($state, Orgservice) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            Orgservice.setHybridServiceAcknowledged('call-aware-service');
          },
          link: function () {
            $state.go('call-service.list');
          },
          linkText: 'homePage.getStarted',
          name: 'callAware',
          text: 'homePage.setUpCallAwareService'
        };

        return notification;
      }
    };
  }
})();
