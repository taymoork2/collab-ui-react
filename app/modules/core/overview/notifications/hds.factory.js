(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewDataSecurityNotification', OverviewDataSecurityNotification);

  /* @ngInject */
  function OverviewDataSecurityNotification($state, HybridServicesFlagService, HybridServicesUtils) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtils.getAckFlagForHybridServiceId('spark-hybrid-datasecurity'));
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
