(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridMediaNotification', OverviewHybridMediaNotification);

  /* @ngInject */
  function OverviewHybridMediaNotification($state, HybridServicesFlagService, HybridServicesUtils) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            HybridServicesFlagService.raiseFlag(HybridServicesUtils.getAckFlagForHybridServiceId('squared-fusion-media'));
          },
          link: function () {
            $state.go('media-service-v2.list');
          },
          linkText: 'homePage.getStarted',
          name: 'media',
          text: 'homePage.setUpHybridMediaService',
        };

        return notification;
      },
    };
  }
})();
