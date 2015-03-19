'use strict';

angular.module('WebExUserSettings')
  .service('WebexUserSettingsSvc', [
    function WebexUserSettingsModel() {
      return {
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

          handsOnLabAdmin: {
            id: "handsOnLabAdmin",
            label: "Hands-on Lab Admin (effective only when hands-on lab is enabled)",
            value: false,
            isSiteEnabled: false
          }
        }, // trainingCenter

        eventCenter: {
          id: "EC",
          label: "Event Center",
          serviceType: "EventCenter",
          isSiteEnabled: false,

          optimizeBandwidthUsage: {
            id: "optimizeBandwidthUsage",
            label: "Optimized bandwidth usage for attendees within the same network (Note 1)",
            isSiteEnabled: true, // TODO
            value: false // TODO
          }
        }, // eventCenter

        supportCenter: {
          id: "SC",
          label: "Support Center",
          serviceType: "SupportCenter",
          isSiteEnabled: false
        }, // supportCenter

        collabMeetingRoom: {
          id: "collabMeetingRoom",
          label: "Collabration Room Cloud Service",
          isSiteEnabled: false,
          value: false
        }, // collabMeetingRoom

        general: {
          label: "General",

          hiQualVideo: {
            id: "hiQualVideo",
            label: "Turn on high-quality video (360p) (Note 1)",
            isSiteEnabled: true, // TODO
            value: false, // TODO

            hiDefVideo: {
              id: "hiDefVideo",
              label: "Turn on high-definition video video (720p) (Note 1)", // TODO
              value: false // TODO
            }
          }
        }, // general

        telephonyPriviledge: {
          label: "Telephony Privilege",

          callInTeleconf: {
            id: "callInTeleconf",
            label: "Call-in teleconferencing",
            value: true,
            isSiteEnabled: false,
            selectedCallInTollType: 0,

            callInTollOnly: {
              id: "tollOnly",
              label: "Toll",
              isSiteEnabled: false,
              value: 1
            },

            callInTollFreeOnly: {
              id: "tollFreeOnly",
              label: "Toll free",
              isSiteEnabled: false,
              value: 2
            },

            callInTollAndTollFree: {
              id: "tollAndTollFree",
              label: "Toll & Toll free",
              isSiteEnabled: false,
              value: 3
            },

            teleconfViaGlobalCallin: {
              id: "teleconfViaGlobalCallin",
              label: "Allow access to teleconference via global call-in numbers (Note 2)",
              isSiteEnabled: true, // TODO
              value: false
            },

            cliAuth: {
              id: "cliAuth",
              label: "Enable teleconferencing CLI authentication (Note 1)",
              isSiteEnabled: true, // TODO
              value: false, // TODO

              reqPinEnabled: {
                id: "reqPinEnabled",
                label: "Host and attendees must have PIN enabled (Note 1)",
                value: false // TODO
              }
            }
          }, // callInTeleconf

          callBackTeleconf: {
            id: "callBackTeleconf",
            label: "Call-back teleconferencing",
            isSiteEnabled: false,
            value: false,

            globalCallBackTeleconf: {
              id: "globalCallBackTeleconf",
              label: "Global call-back teleconferencing",
              value: false
            },
          },

          otherTeleconfServices: {
            id: "otherTeleconfServices",
            label: "Other teleconference services (Note 2)",
            isSiteEnabled: true, // TODO
            value: false
          },

          integratedVoIP: {
            id: "integratedVoIP",
            label: "Integrated VoIP",
            isSiteEnabled: false,
            value: false
          },

          teleConfCallIn: false,
          teleConfTollFreeCallIn: false,
        }, // telephonyPriviledges
      }; // return
    } // WebexUserSettingsModel
  ]); // service
