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
      settingPagesInfo: null,

      commonSiteSettingPages: null,
      centerSpecificSettingPages: null,

      sessionTypes: null,

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
