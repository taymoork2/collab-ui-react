(function () {
  'use strict';

  angular.module('WebExApp')
    .service('WebexUserSettingsSvc', WebexUserSettingsSvc);

  /* @ngInject */
  function WebexUserSettingsSvc() {
    return {
      sessionTypes: null,

      meetingCenter: {
        id: "MC",
        label: "Meeting Center",
        serviceType: "MeetingCenter",
        isEntitledOnAtlas: false,
        isEntitledOnWebEx: false,
        isSiteEnabled: false
      }, // meetingCenter

      trainingCenter: {
        id: "TC",
        label: "Training Center",
        serviceType: "TrainingCenter",
        isEntitledOnAtlas: false,
        isEntitledOnWebEx: false,
        isSiteEnabled: false,

        handsOnLabAdmin: {
          id: "handsOnLabAdmin",
          label: "",
          value: false,
          isSiteEnabled: false
        }
      }, // trainingCenter

      eventCenter: {
        id: "EC",
        label: "Event Center",
        serviceType: "EventCenter",
        isEntitledOnAtlas: false,
        isEntitledOnWebEx: false,
        isSiteEnabled: false,

        optimizeBandwidthUsage: {
          id: "optimizeBandwidthUsage",
          label: "",
          isSiteEnabled: false,
          value: false
        }
      }, // eventCenter

      supportCenter: {
        id: "SC",
        label: "Support Center",
        serviceType: "SupportCenter",
        isEntitledOnAtlas: false,
        isEntitledOnWebEx: false,
        isSiteEnabled: false
      }, // supportCenter

      pmr: {
        id: "PMR",
        label: "Personal Room",
        isSiteEnabled: false,
        value: false
      },

      cmr: {
        id: "CMR",
        label: "Collaboration Meeting Rooms",
        value: false
      },

      otherPrivilegesSection: {
        label: "Other Privileges"
      },

      videoSettings: {
        label: "",

        hiQualVideo: {
          id: "hiQualVideo",
          label: "",
          isSiteEnabled: false,
          value: false,

          hiDefVideo: {
            id: "hiDefVideo",
            label: "",
            isSiteEnabled: false,
            value: false
          }
        }
      }, // videoSettings

      telephonyPriviledge: {
        label: "",

        hybridVoipOnly: {
          isSiteEnabled: false
        },

        hybridAudio: {
          isSiteEnabled: false
        },

        telephonyType: {
          isWebExAudio: false,
          isTspAudio: false
        },

        callInTeleconf: {
          id: "callInTeleconf",
          label: "",
          value: false,

          toll: {
            isSiteEnabled: false,
            value: false,
          },

          tollFree: {
            isSiteEnabled: false,
            value: false,
          },

          selectedCallInTollType: 0,

          callInTollTypes: [{
            label: "",
            value: 1,
            id: "tollOnly",
            name: "callInTollType",
          }, {
            label: "",
            value: 2,
            id: "tollAndTollFree",
            name: "callInTollType",
          }],

          teleconfViaGlobalCallIn: {
            id: "teleconfViaGlobalCallIn",
            label: "",
            isSiteEnabled: false,
            value: false
          },
          teleCLIAuthEnabled: {
            id: "teleCLIAuthEnabled",
            label: "",
            isSiteEnabled: false,
            value: false
          }
        }, // callInTeleconf

        callBackTeleconf: {
          id: "callBackTeleconf",
          label: "",
          isSiteEnabled: false,
          value: false,

          globalCallBackTeleconf: {
            id: "globalCallBackTeleconf",
            label: "",
            isSiteEnabled: false,
            value: false
          },
        },

        otherTeleconfServices: {
          id: "otherTeleconfServices",
          label: "",
          isSiteEnabled: false,
          value: false
        },

        integratedVoIP: {
          id: "integratedVoIP",
          label: "",
          isSiteEnabled: false,
          value: false
        },

        viewReady: false,
        hasLoadError: false,
        sessionTicketErr: false,
        errMsg: "",
        allowRetry: false,
        disableCancel: false,
        disableCancel2: false,
        disableSave: false,
        disableSave2: false,
        isT31Site: false,

        userInfo: null,
        siteInfo: null,
        meetingTypesInfo: null,
        siteVersionInfo: null,
      }, // telephonyPriviledges
    }; // return
  } // WebexUserSettingsSvc
})();
