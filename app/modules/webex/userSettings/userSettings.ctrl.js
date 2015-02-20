(function () {
  'use strict';

  angular
    .module('WebExUserSettings')
    .controller('WebExUserSettingsCtrl', [
      '$scope',
      function ($scope) {
        this.getUserPrivileges = function () {
            // alert("getUserPrivileges(): START");
            console.log("getUserPrivileges(): START");

            var userPrivileges = {
              label: "Service",

              general: {
                label: "General",

                recordingEditor: {
                  id: "recordingEditor",
                  label: "Recording Editor",
                  value: true
                },

                personalRoom: {
                  id: "personalRoom",
                  label: "Personal Room",
                  value: true
                },

                collabRoom: {
                  id: "collabRoom",
                  label: "Collabration Room",
                  value: true
                },

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

                assist: {
                  id: "assist",
                  label: "Assist",
                  value: true
                }
              }, // general

              trainingCenter: {
                label: "Training Center",

                handsOnLabAdmin: {
                  id: "handsOnLabAdmin",
                  label: "Hands-on Lab Admin (effective only when hands-on lab is enabled)",
                  value: true
                }
              }, // trainingCenter

              eventCenter: {
                label: "Event Center",

                optimizeBandwidthUsage: {
                  id: "optimizeBandwidthUsage",
                  label: "Optimized bandwidth usage for attendees within the same network",
                  value: true
                }
              }, // trainingCenter

              telephonyPriviledge: {
                label: "Telephony Privilege",

                callInTeleconf: {
                  id: "callInTeleconf",
                  label: "Call-in teleconferencing",
                  value: true,
                  currCallInTollType: 2,

                  callInTollTypes: [{
                    id: "toll",
                    label: "Toll",
                    value: 0
                  }, {
                    id: "tollFree",
                    label: "Toll free",
                    value: 1
                  }, {
                    id: "tollAndTollFree",
                    label: "Toll and Toll free",
                    value: 2
                  }],

                  teleconfViaGlobalCallin: {
                    id: "teleconfViaGlobalCallin",
                    label: "Allow access to teleconference via global call-in numbers",
                    value: true
                  },

                  cliAuth: {
                    id: "cliAuth",
                    label: "Enable teleconferencing CLI authentication",
                    value: true
                  },

                  pinEnabled: {
                    id: "pinEnabled",
                    label: "Host and attendees must have PIN enabled",
                    value: true
                  }
                },

                callBackTeleconf: {
                  id: "callBackTeleconf",
                  label: "Call-back teleconferencing",
                  value: true
                },

                globalCallBackTeleconf: {
                  id: "globalCallBackTeleconf",
                  label: "Global call-back teleconferencing",
                  value: true
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

                  teleconfLocations: [
                    "North America",
                    "South America",
                    "Asia",
                    "Africa",
                    "Australia"
                  ]
                }
              }, // telephonyPriviledges

              webexCenters: [{
                centerName: "Meeting Center",
                sessionTypes: [{
                  sessionName: "STD",
                  sessionEnabled: true,
                  sessionDescription: "Meeting Center Standard"
                }, {
                  sessionName: "PRO",
                  sessionEnabled: false,
                  sessionDescription: "Meeting Center Pro"
                }]
              }, {
                centerName: "Event Center",
                sessionTypes: [{
                  sessionName: "STD",
                  sessionEnabled: false,
                  sessionDescription: "Event Center Standard"
                }, {
                  sessionName: "PRO",
                  sessionEnabled: true,
                  sessionDescription: "Event Center Pro"
                }]
              }]
            };

            console.log("getUserPrivileges(): END");

            return userPrivileges;
          }, // getUserPrivileges()

          this.updateUserSettings = function () {
            alert("updateUserSettings(): START");

            alert("updateUserSettings(): END");
          } // updateUserSettings()

        this.userPrivileges = this.getUserPrivileges();
      } // WebExUserSettingsCtrl()
    ])
})();
