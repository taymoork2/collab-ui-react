(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewNotificationFactory', OverviewNotificationFactory);

  /* @ngInject */
  function OverviewNotificationFactory(
    CallServiceHighAvailability,
    LinkedSiteNotification,
    OverviewAllHybridCalendarsNotification,
    OverviewAutoAssignNotificationFactory,
    OverviewCalendarNotification,
    OverviewCallAwareNotification,
    OverviewCallConnectNotification,
    OverviewCareLicenseNotification,
    OverviewCareNotSetupNotification,
    OverviewCloudSipUriNotification,
    OverviewCrashLogNotification,
    OverviewDataSecurityNotification,
    OverviewDevicesNotification,
    OverviewEsaDisclaimerNotification,
    OverviewEVAMissingDefaultSpaceNotification,
    OverviewGoogleCalendarNotification,
    OverviewHybridMediaNotification,
    OverviewHybridMessagingNotification,
    OverviewPstnTermsOfServiceNotification,
    OverviewSetupNotification,
    OverviewUrgentUpgradeNotification,
    OverviewSparkAssistantNotification,
    OverviewWifiProximityNotification
  ) {
    return {
      createCrashLogNotification: OverviewCrashLogNotification.createNotification,
      createSetupNotification: OverviewSetupNotification.createNotification,
      createUrgentUpgradeNotification: OverviewUrgentUpgradeNotification.createNotification,
      createCalendarNotification: OverviewCalendarNotification.createNotification,
      createAllHybridCalendarsNotification: OverviewAllHybridCalendarsNotification.createNotification,
      createGoogleCalendarNotification: OverviewGoogleCalendarNotification.createNotification,
      createCallConnectNotification: OverviewCallConnectNotification.createNotification,
      createCallAwareNotification: OverviewCallAwareNotification.createNotification,
      createCloudSipUriNotification: OverviewCloudSipUriNotification.createNotification,
      createDevicesNotification: OverviewDevicesNotification.createNotification,
      createHybridMediaNotification: OverviewHybridMediaNotification.createNotification,
      createHybridDataSecurityNotification: OverviewDataSecurityNotification.createNotification,
      createHybridMessagingNotification: OverviewHybridMessagingNotification.createNotification,
      createCareLicenseNotification: OverviewCareLicenseNotification.createNotification,
      createPstnTermsOfServiceNotification: OverviewPstnTermsOfServiceNotification.createNotification,
      createEsaDisclaimerNotification: OverviewEsaDisclaimerNotification.createNotification,
      createCallServiceHighAvailability: CallServiceHighAvailability.createNotification,
      createCareNotSetupNotification: OverviewCareNotSetupNotification.createNotification,
      createAutoAssignNotification: OverviewAutoAssignNotificationFactory.createNotification,
      createLinkedSitesNotification: LinkedSiteNotification.createNotification,
      createEvaMissingDefaultSpaceNotification: OverviewEVAMissingDefaultSpaceNotification.createNotification,
      createSparkAssistantNotification: OverviewSparkAssistantNotification.createNotification,
      createWifiProximityOptInNotification: OverviewWifiProximityNotification.createNotification,
    };
  }
})();
