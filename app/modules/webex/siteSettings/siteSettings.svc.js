'use strict';

angular.module('WebExSiteSettings').service('WebExSiteSettingsSvc', [
  function WebExSiteSettingsModel() {
    return {
      viewReady: false,
      hasLoadError: false,
      sessionTicketErr: false,
      allowRetry: false,
      errMsg: "",

      siteUrl: null,
      siteName: null,
      siteInfo: null,
      meetingTypesInfo: null,

      setingPages: null,

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
