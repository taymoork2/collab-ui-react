(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewDataSecurityNotification', OverviewDataSecurityNotification);

  /* @ngInject */
  function OverviewDataSecurityNotification($state, ServiceDescriptor) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            ServiceDescriptor.acknowledgeService('spark-hybrid-datasecurity');
          },
          link: function () {
            $state.go('hds.settings');
          },
          linkText: 'homePage.getStarted',
          name: 'hds',
          text: 'homePage.setUpHybridDataSecurity',
        };
        return notification;
      },
    };
  }
})();
