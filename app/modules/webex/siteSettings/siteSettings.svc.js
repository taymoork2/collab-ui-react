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

      // siteInfo: null,
      // meetingTypesInfo: null,
      // sessionTypesInfo: null,
      settingPagesInfo: null,

      /*
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
      */

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
          count: null
        },

        licensesAvailable: {
          id: "licensesAvailable",
          count: null
        },

        siteInfoPageObj: null,
        siteFeaturesPageObj: null
      }, // siteInfoCardObj

      settingCardObjs: [{
        id: "CommonSettings",
        label: null,
        pageObjs: null,
      }, {
        id: "MC",
        label: "Meeting Center",
        pageObjs: null,
      }, {
        id: "TC",
        label: "Training Center",
        pageObjs: null
      }, {
        id: "SC",
        label: "Support Center",
        pageObjs: null,

        webACDObj: {
          id: "WebACD",
          label: "WebACD",
          pageObjs: null
        },

        remoteAccessObj: {
          id: "RA",
          label: "Remote Access",
          pageObjs: null
        },
      }, {
        id: "EC",
        label: "Event Center",
        pageObjs: null,
      }, ], // settingCardObjs

      categoryObjs: [{
        id: "siteInfo",
        pageObjs: []
      }, {
        id: "EMAIL",
        pageObjs: []
      }, {
        id: "CommonSettings",
        pageObjs: []
      }, {
        id: "MC",
        pageObjs: []
      }, {
        id: "EC",
        pageObjs: []
      }, {
        id: "SC",
        pageObjs: []
      }, {
        id: "TC",
        pageObjs: []
      }, {
        id: "RA",
        pageObjs: []
      }, {
        id: "WebACD",
        pageObjs: []
      }], // categoryObjs
    }; // return
  } // WebExSiteSettingsModel
]);
