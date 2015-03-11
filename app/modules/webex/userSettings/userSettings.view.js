'use strict';

angular.module('WebExUserSettings')
  .service('WebexUserPrivilegesModel', [
    function WebexUserPrivilegesModel() {
      return {
        sessionEnablementTitle: "Session Enablement",
        userPrivilegesTitle: "User Privileges",

        sessionTypes: null,

        meetingCenter: {
          label: "Meeting Center",
          serviceType: "MeetingCenter",
          isSiteEnabled: false
        }, // meetingCenter

        trainingCenter: {
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
          label: "Event Center",
          serviceType: "EventCenter",
          isSiteEnabled: false,

          optimizeBandwidthUsage: {
            id: "optimizeBandwidthUsage",
            label: "Optimized bandwidth usage for attendees within the same network",
            value: false,
            isSiteEnabled: false
          }
        }, // eventCenter

        supportCenter: {
          label: "Support Center",
          serviceType: "SupportCenter",
          isSiteEnabled: false
        }, // supportCenter

        /*
        collabRoom: {
          id: "collabRoom",
          label: "Collabration Room",
          value: true
        }, // collabRoom
        */

        /*
        general: {
          label: "General",

          hiQualVideo: {
            id: "hiQualVideo",
            label: "Turn on high-quality video (360p)",
            value: true
          },

          hiDefVideo: {
            id: "hiDefVideo",
            label: "Turn on high-definition video video (720p)",
            value: true
          },

        }, // general
        */

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
              isSiteEnabled: true,
              value: 1
            },

            callInTollFreeOnly: {
              id: "tollFreeOnly",
              label: "Toll free",
              isSiteEnabled: true,
              value: 2
            },

            callInTollAndTollFree: {
              id: "tollAndTollFree",
              label: "Toll & Toll free",
              isSiteEnabled: true,
              value: 3
            },

            teleconfViaGlobalCallin: {
              id: "teleconfViaGlobalCallin",
              label: "Allow access to teleconference via global call-in numbers",
              value: true
            },

            cliAuth: {
              id: "cliAuth",
              label: "Enable teleconferencing CLI authentication",
              value: true
            }
          }, // callInTeleconf

          callBackTeleconf: {
            id: "callBackTeleconf",
            label: "Call-back teleconferencing",
            value: true,

            globalCallBackTeleconf: {
              id: "globalCallBackTeleconf",
              label: "Global call-back teleconferencing",
              value: true
            },
          },

          otherTeleconfServices: {
            id: "otherTeleconfServices",
            label: "Other teleconference services",
            value: true
          },

          integratedVoIP: {
            id: "integratedVoIP",
            label: "Integrated VoIP",
            value: true
          },

          selectTeleconfLocation: {
            id: "selectTeleconfLocation",
            label: "Select teleconferencing location",
            value: true,
            defaultTeleconfLocation: "Asia",

            teleconfLocations: ["North America",
              "South America",
              "Asia",
              "Africa",
              "Australia"
            ]
          } //selectTeleconfLocation
        }, // telephonyPriviledges
      }; // userPrivilegesModel
    }
  ]);
