(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewNotificationFactory', OverviewNotificationFactory);

  /* @ngInject */
  function OverviewNotificationFactory(OverviewCrashLogNotification, OverviewSetupNotification, OverviewUrgentUpgradeNotification, OverviewCalendarNotification, OverviewGoogleCalendarNotification, OverviewCallConnectNotification, OverviewCallAwareNotification, OverviewCloudSipUriNotification, OverviewDevicesNotification, OverviewHybridMediaNotification, OverviewDataSecurityNotification, OverviewCareLicenseNotification, OverviewPstnTermsOfServiceNotification, OverviewEsaDisclaimerNotification, CallServiceHighAvailability, OverviewHybridMessagingNotification, OverviewAllHybridCalendarsNotification, OverviewCareNotSetupNotification, OverviewAutoAssignNotificationFactory, LinkedSiteNotification) {
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
    };
  }
})();
