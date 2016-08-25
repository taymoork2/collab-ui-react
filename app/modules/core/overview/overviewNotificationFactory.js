(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewNotificationFactory', OverviewNotificationFactory);

  /* @ngInject */
  function OverviewNotificationFactory(OverviewSetupNotification, OverviewCalendarNotification, OverviewCallConnectNotification, OverviewCallAwareNotification, OverviewCloudSipUriNotification, OverviewDevicesNotification, OverviewHybridMediaNotification) {
    return {
      createSetupNotification: OverviewSetupNotification.createNotification,
      createCalendarNotification: OverviewCalendarNotification.createNotification,
      createCallConnectNotification: OverviewCallConnectNotification.createNotification,
      createCallAwareNotification: OverviewCallAwareNotification.createNotification,
      createCloudSipUriNotification: OverviewCloudSipUriNotification.createNotification,
      createDevicesNotification: OverviewDevicesNotification.createNotification,
      createHybridMediaNotification: OverviewHybridMediaNotification.createNotification
    };
  }
})();
