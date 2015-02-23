(function () {
  'use strict';

  angular
    .module('WebExUserSettings')
    .controller('WebExUserSettingsCtrl', [
      '$scope', '$http',
      function ($scope, $http) {
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

            this.getUserPrivileges2();

            return userPrivileges;
          }, // getUserPrivileges()
          this.getUserPrivileges2 = function () {
            var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";
            var reqXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

            var siteID = "4272"; // Site ID
            var partnerID = "4272"; // Partner ID
            var webExID = "jpallapa"; // Host username
            var password = "C!sco123"; // Host password

            reqXML += "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
              "    <header>" +
              "        <securityContext>" +
              "            <webExID>" + webExID + "</webExID>" +
              "            <password>" + password + "</password>" +
              "            <siteID>" + siteID + "</siteID>" +
              "            <partnerID>" + partnerID + "</partnerID>" +
              "        </securityContext>" +
              "    </header>" +
              "    <body>" +
              "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" +
              "            <webExId>jpallapa</webExId>" +
              "        </bodyContent>" +
              "    </body>" +
              "</serv:message>";

            $http({
                url: xmlServerURL,
                method: "POST",
                data: reqXML,
                headers: {
                  'Content-Type': 'application/x-www-rform-urlencoded'
                }
              })
              .success(function (data) {
                // alert("Success: " + data);
                var xmlDoc = $(data);
                var firstName = xmlDoc.find("use\\:firstName").text();
                var lastName = xmlDoc.find("use\\:lastName").text();
                var meetingTypes = [];

                xmlDoc.find("use\\:meetingType").each(function () {
                  var marker = $(this);
                  meetingTypes.push(marker.text());
                });

                console.log("User name: " + firstName + " " + lastName);
                console.log("Meeting Types: " + meetingTypes);
                // .each(function () {
                //     var marker = $(this);
                //     alert("First name: " + marker.text());
                //   });
              })
              .error(function (data) {
                // alert("Error: " + data);
              });

            return userPrivileges;
          },
          this.updateUserSettings = function () {
            alert("updateUserSettings(): START");

            alert("updateUserSettings(): END");
          } // updateUserSettings()

        this.userPrivileges = this.getUserPrivileges();
      } // WebExUserSettingsCtrl()
    ])
})();
