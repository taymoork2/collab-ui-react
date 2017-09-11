(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUrgentUpgradeNotification', OverviewUrgentUpgradeNotification);

  /* @ngInject */
  function OverviewUrgentUpgradeNotification($translate) {
    return {
      createNotification: function createNotification(connectorType) {
        var notification = {
          badgeText: 'common.alert',
          badgeType: 'warning',
          canDismiss: false,
          name: connectorType,
          text: 'homePage.urgentUpgrade',
          textValues: {
            connector: $translate.instant('hercules.connectorNameFromConnectorType.' + connectorType),
            link: 'cluster-list',
          },
        };
        return notification;
      },
    };
  }
})();
