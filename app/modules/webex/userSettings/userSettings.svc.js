'use strict';

angular.module('WebExUserSettings')
  .service('WebexUserSettingsSvc', [
    function WebexUserSettingsModel() {
      return {
        sessionTypes: null,

        meetingCenter: {
          id: "MC",
          label: "",
          serviceType: "MeetingCenter",
          isSiteEnabled: false
        }, // meetingCenter

        trainingCenter: {
          id: "TC",
          label: "",
          serviceType: "TrainingCenter",
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
          label: "",
          serviceType: "EventCenter",
          isSiteEnabled: false,

          optimizeBandwidthUsage: {
            id: "optimizeBandwidthUsage",
            label: "",
            isSiteEnabled: true, // TODO
            value: false // TODO
          }
        }, // eventCenter

        supportCenter: {
          id: "SC",
          label: "",
          serviceType: "SupportCenter",
          isSiteEnabled: false
        }, // supportCenter

        collabMeetingRoom: {
          id: "collabMeetingRoom",
          label: "",
          isSiteEnabled: false,
          value: false
        }, // collabMeetingRoom

        videoSettings: {
          label: "",

          hiQualVideo: {
            id: "hiQualVideo",
            label: "",
            isSiteEnabled: true, // TODO
            value: false, // TODO

            hiDefVideo: {
              id: "hiDefVideo",
              label: "",
              value: false // TODO
            }
          }
        }, // videoSettings

        telephonyPriviledge: {
          label: "",

          callInTeleconf: {
            id: "callInTeleconf",
            label: "",
            value: true,
            isSiteEnabled: false,
            selectedCallInTollType: 0,

            callInTollTypes: [{
              label: "",
              value: 1,
              id: "tollOnly",
              name: "callInTollType",
              isDisabled: true
            }, {
              label: "",
              value: 2,
              id: "tollFreeOnly",
              name: "callInTollType",
              isDisabled: true
            }, {
              label: "",
              value: 3,
              id: "tollAndTollFree",
              name: "callInTollType",
              isDisabled: true
            }],

            teleconfViaGlobalCallin: {
              id: "teleconfViaGlobalCallin",
              label: "",
              isSiteEnabled: true, // TODO
              value: false
            },

            cliAuth: {
              id: "cliAuth",
              label: "",
              isSiteEnabled: true, // TODO
              value: false, // TODO

              reqPinEnabled: {
                id: "reqPinEnabled",
                label: "", // TODO
                value: false // TODO
              }
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
              value: false
            },
          },

          otherTeleconfServices: {
            id: "otherTeleconfServices",
            label: "",
            isSiteEnabled: true, // TODO
            value: false
          },

          integratedVoIP: {
            id: "integratedVoIP",
            label: "",
            isSiteEnabled: false,
            value: false
          },

          teleConfCallIn: false,
          teleConfTollFreeCallIn: false,
        }, // telephonyPriviledges
      }; // return
    } // WebexUserSettingsModel
  ]); // service
