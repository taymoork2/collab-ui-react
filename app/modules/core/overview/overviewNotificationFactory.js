(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewNotificationFactory', OverviewNotificationFactory);

  /* @ngInject */
  function OverviewNotificationFactory(OverviewCrashLogNotification, OverviewSetupNotification, OverviewUrgentUpgradeNotification, OverviewCalendarNotification, OverviewGoogleCalendarNotification, OverviewCallConnectNotification, OverviewCallAwareNotification, OverviewCloudSipUriNotification, OverviewDevicesNotification, OverviewHybridMediaNotification, OverviewPMRNotification, OverviewDataSecurityNotification) {
    return {
      createCrashLogNotification: OverviewCrashLogNotification.createNotification,
      createSetupNotification: OverviewSetupNotification.createNotification,
      createUrgentUpgradeNotification: OverviewUrgentUpgradeNotification.createNotification,
      createCalendarNotification: OverviewCalendarNotification.createNotification,
      createGoogleCalendarNotification: OverviewGoogleCalendarNotification.createNotification,
      createCallConnectNotification: OverviewCallConnectNotification.createNotification,
      createCallAwareNotification: OverviewCallAwareNotification.createNotification,
      createCloudSipUriNotification: OverviewCloudSipUriNotification.createNotification,
      createDevicesNotification: OverviewDevicesNotification.createNotification,
      createHybridMediaNotification: OverviewHybridMediaNotification.createNotification,
      createPMRNotification: OverviewPMRNotification.createNotification,
      createHybridDataSecurityNotification: OverviewDataSecurityNotification.createNotification
    };
  }
})();
