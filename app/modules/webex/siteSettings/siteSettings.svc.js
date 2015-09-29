'use strict';

angular.module('WebExSiteSettings').service('WebExSiteSettingsSvc', [
  function WebExSiteSettingsModel() {
    return {
      viewReady: false,
      hasLoadError: false,
      sessionTicketError: false,
      allowRetry: false,
      errMsg: "",
      pageTitle: null,
      pageTitleFull: null,

      siteUrl: null,
      siteName: null,

      siteInfo: null,
      meetingTypesInfo: null,
      // sessionTypesInfo: null,
      settingPagesInfo: null,

      siteStatus: {
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
      }, // siteStatus

      emailAllHostsBtnObj: {
        id: "emailAllHostsBtn",
        pageObj: null,
      }, // emailAllHostsBtnObj

      siteInfoCardObj: {
        id: "siteInfo",
        label: null,

        licensesTotal: {
          id: "licensesTotal",
          count: 0
        },

        licensesUsage: {
          id: "licensesUsage",
          count: 0
        },

        licensesAvailable: {
          id: "licensesAvailable",
          count: 0
        },

        siteInfoPageObj: null,
        siteFeaturesPageObj: null
      }, // siteInfoCardObj

      settingCardObjs: [{
        id: "common",
        label: null,
        pageObjs: null,
      }, {
        id: "meetingCenter",
        label: "Meeting Center",
        pageObjs: null,
      }, {
        id: "trainingCenter",
        label: "Training Center",
        pageObjs: null
      }, {
        id: "supportCenter",
        label: "Support Center",
        pageObjs: null,

        webACDObj: {
          id: "webACD",
          label: "WebACD",
          pageObjs: null
        },

        remoteAccessObj: {
          id: "remoteAccess",
          label: "Remote Access",
          pageObjs: null
        },
      }, {
        id: "eventCenter",
        label: "Event Center",
        pageObjs: null,
      }, ], // settingCardObjs

      categoryObjs: [{
        id: "emailAllHosts",
        pageObjs: []
      }, {
        id: "siteInfo",
        pageObjs: []
      }, {
        id: "common",
        pageObjs: []
      }, {
        id: "meetingCenter",
        pageObjs: []
      }, {
        id: "eventCenter",
        pageObjs: []
      }, {
        id: "supportCenter",
        pageObjs: []
      }, {
        id: "trainingCenter",
        pageObjs: []
      }, {
        id: "webACD",
        pageObjs: []
      }, {
        id: "remoteAccess",
        pageObjs: []
      }, ], // categoryObjs
    }; // return
  } // WebExSiteSettingsModel
]);
