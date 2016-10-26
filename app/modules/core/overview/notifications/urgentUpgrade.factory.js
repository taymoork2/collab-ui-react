(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewUrgentUpgradeNotification', OverviewUrgentUpgradeNotification);

  /* @ngInject */
  function OverviewUrgentUpgradeNotification($state, $translate) {
    return {
      createNotification: function createNotification(clusterWithUrgentUpgrade) {
        var connectorType = _.find(clusterWithUrgentUpgrade.provisioning, function (p) {
          return p.availablePackageIsUrgent && p.connectorType !== 'c_mgmt';
        }).connectorType;
        var clusterId = clusterWithUrgentUpgrade.id;
        var notification = {
          badgeText: 'common.alert',
          badgeType: 'warning',
          canDismiss: true,
          dismiss: function () {},
          link: function () {
            if (connectorType === 'c_cal') {
              $state.go('calendar-service.list', {
                clusterId: clusterId
              });
            } else if (connectorType === 'c_ucmc') {
              $state.go('call-service.list', {
                clusterId: clusterId
              });
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
