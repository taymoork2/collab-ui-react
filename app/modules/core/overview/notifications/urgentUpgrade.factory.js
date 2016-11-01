(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUrgentUpgradeNotification', OverviewUrgentUpgradeNotification);

  /* @ngInject */
  function OverviewUrgentUpgradeNotification($state, $translate) {
    return {
      createNotification: function createNotification(connectorType) {
        var notification = {
          badgeText: 'common.alert',
          badgeType: 'warning',
          canDismiss: false,
          link: function () {
            if (connectorType === 'c_cal') {
              $state.go('calendar-service.list');
            } else if (connectorType === 'c_ucmc') {
              $state.go('call-service.list');
            }
          },
          linkText: 'homePage.upgrade',
          name: connectorType,
          text: 'homePage.urgentUpgrade',
          textValues: {
            connector: $translate.instant('hercules.connectorNameFromConnectorType.' + connectorType)
          }
        };
        return notification;
      }
    };
  }
})();
