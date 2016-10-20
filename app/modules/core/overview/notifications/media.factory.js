(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHybridMediaNotification', OverviewHybridMediaNotification);

  /* @ngInject */
  function OverviewHybridMediaNotification($state, Orgservice) {
    return {
      createNotification: function createNotification() {
        var notification = {
          badgeText: 'common.new',
          badgeType: 'success',
          canDismiss: true,
          dismiss: function () {
            Orgservice.setHybridServiceAcknowledged('squared-fusion-media');
          },
          link: function () {
            $state.go('media-service-v2.list');
          },
          linkText: 'homePage.getStarted',
          name: 'media',
          text: 'homePage.setUpHybridMediaService'
        };

        return notification;
      }
    };
  }
})();
