'use strict';

angular.module('WebExSiteSettings').service('WebExSiteSettingsSvc', [
  function WebExSiteSettingsModel() {
    return {
      viewReady: false,
      hasLoadError: false,
      sessionTicketError: false,
      allowRetry: false,
      errMsg: "",

      siteUrl: null,
      siteName: null,

      siteInfo: null,
      meetingTypesInfo: null,
      // sessionTypesInfo: null,
      settingPagesInfo: null,

      siteSettingsTableColumnLabel: {
        settings: null,
        common: null,
        remoteAccess: null,
        webACD: null,
        meetingCenter: null,
        eventCenter: null,
        trainingCenter: null,
        supportCenter: null,
      },

      additionalSiteSettingsLabel: null,

      commonSiteSettingPages: null,
      centerSpecificSettingPages: null,
      settingPageTypeObjs: [],
      emailAllHostsPageObj: null,

      meetingCenter: {
        id: "MC",
        label: "Meeting Center",
        serviceType: "MeetingCenter",
        isSiteEnabled: false
      }, // meetingCenter

      trainingCenter: {
        id: "TC",
        label: "Training Center",
        serviceType: "TrainingCenter",
        isSiteEnabled: false,
      }, // trainingCenter

      eventCenter: {
        id: "EC",
        label: "Event Center",
        serviceType: "EventCenter",
        isSiteEnabled: false,
      }, // eventCenter

      supportCenter: {
        id: "SC",
        label: "Support Center",
        serviceType: "SupportCenter",
        isSiteEnabled: false
      }, // supportCenter
    }; // return
  } // WebExSiteSettingsModel
]);
