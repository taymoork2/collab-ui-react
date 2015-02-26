(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', ['$scope', '$http',
    function ($scope, $http) {
      this.xml2JsonConvert = function (xmlDataText, startOfBodyStr, endOfBodyStr) {
        console.log("xml2JsonConvert: xmlDataText=\n" + xmlDataText);

        // alert("xml2JsonConvert(): " + "startOfBodyStr=" + startOfBodyStr + " ; endOfBodyStr=" + endOfBodyStr);
        console.log("xml2JsonConvert(): " + "startOfBodyStr=" + startOfBodyStr + " ; endOfBodyStr=" + endOfBodyStr);

        var startOfBodyIndex = xmlDataText.indexOf(startOfBodyStr);
        var endOfBodyIndex = (null == endOfBodyStr) ? 0 : xmlDataText.indexOf(endOfBodyStr);

        // alert("xml2JsonConvert(): startOfBodyStr=" + "startOfBodyIndex=" + startOfBodyIndex + "; endOfBodyIndex=" + endOfBodyIndex);
        console.log("xml2JsonConvert(): startOfBodyStr=" + "startOfBodyIndex=" + startOfBodyIndex + "; endOfBodyIndex=" + endOfBodyIndex);

        var regExp = null;
        var bodySlice = (startOfBodyIndex < endOfBodyIndex) ? xmlDataText.slice(startOfBodyIndex, endOfBodyIndex) : xmlDataText.slice(startOfBodyIndex);

        regExp = /<use:/g;
        bodySlice = bodySlice.replace(regExp, "<use_");

        regExp = /<\/use:/g;
        bodySlice = bodySlice.replace(regExp, "</use_");

        regExp = /<com:/g;
        bodySlice = bodySlice.replace(regExp, "<com_");

        regExp = /<\/com:/g;
        bodySlice = bodySlice.replace(regExp, "</com_");

        bodySlice = "<body>" + bodySlice + "</body>";

        console.log("xml2JsonConvert: bodySlice=\n" + bodySlice);

        var x2js = new X2JS();
        var bodyJson = x2js.xml_str2json(bodySlice);

        console.log("xml2JsonConvert: bodyJson=\n" + JSON.stringify(bodyJson));
        return bodyJson;
      };
      // xml2JsonConvert()

      this.updateUserPrivileges = function () {
        // alert("updateUserPrivileges()");

        var currView = this;
        var userPrivileges = currView.userPrivileges;
        var userDataXml = currView.userDataXml;
        var userDataJson = currView.userDataJson;

        // alert("updateUserPrivileges(): userDataJson=\n" + userDataJson);
        console.log("updateUserPrivileges(): userDataJson=\n" + JSON.stringify(userDataJson));

        // var firstName = userDataXml.find("use\\:firstName").text();
        // var lastName = userDataXml.find("use\\:lastName").text();
        var firstName = userDataJson.body.use_firstName;
        var lastName = userDataJson.body.use_lastName;

        // alert("User name=" + "[" + firstName + " " + lastName + "]");
        console.log("User name: " + firstName + " " + lastName);

        // var meetingTypes = [];
        // userDataXml.find("use\\:meetingType").each(function () {
        // var marker = $(this);
        // meetingTypes.push(marker.text());
        // })
        var meetingTypes = userDataJson.body.use_meetingTypes.use_meetingType;

        // alert("Meeting Types: " + meetingTypes);
        console.log("Meeting Types: " + meetingTypes);

        userPrivileges.label = "Services";
        $("#webexUserSettingsPage").removeClass("hidden");

        // alert("updateUserPrivileges(): DONE");
      };
      // updateUserPrivileges()

      this.getUserData = function () {
        // alert("getUserData()");

        var currView = this;
        var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";
        var webExID = "jpallapa";
        // Host username
        var password = "C!sco123";
        // Host password
        var siteID = "4272";
        // Site ID
        var partnerID = "4272";
        // Partner ID

        var reqXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" + "    <header>" + "        <securityContext>" + "            <webExID>" + webExID + "</webExID>" + "            <password>" + password + "</password>" + "            <siteID>" + siteID + "</siteID>" + "            <partnerID>" + partnerID + "</partnerID>" + "        </securityContext>" + "    </header>" + "    <body>" + "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" + "            <webExId>jpallapa</webExId>" + "        </bodyContent>" + "    </body>" + "</serv:message>";

        $http({
          url: xmlServerURL,
          method: "POST",
          data: reqXML,
          headers: {
            'Content-Type': 'application/x-www-rform-urlencoded'
          }
        }).success(function (data) {
          currView.userDataXml = $(data);

          // TODO: add code to validate currView.userDataXml

          currView.userDataJson = currView.xml2JsonConvert(data, "<use:", "</serv:bodyContent>");
          // currView.userDataJson = currView.xml2JsonConvert(data, "<serv:", null);
          currView.updateUserPrivileges();
        }).error(function (data) {
          alert("error()");
        });
      };
      // getUserData()

      this.initUserPrivileges = function () {
        // alert("initUserPrivileges(): START");
        console.log("initUserPrivileges(): START");

        var userPrivileges = {
          webexCenters: [{
            centerName: "Meeting Center",

            sessionTypes: [{
              sessionName: "STD",
              sessionEnabled: false,
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
              sessionEnabled: false,
              sessionDescription: "Event Center Pro"
            }]
          }, {
            centerName: "Training Center",

            sessionTypes: [{
              sessionName: "STD",
              sessionEnabled: false,
              sessionDescription: "Training Center Standard"
            }, {
              sessionName: "PRO",
              sessionEnabled: false,
              sessionDescription: "Training Center Pro"
            }]
          }], // webexCenters

          /* cut it out
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
           }, // eventCenter

           telephonyPriviledge: {
           label: "Telephony Privilege",

           callInTeleconf: {
           id: "callInTeleconf",
           label: "Call-in teleconferencing",
           value: true,
           currCallInTollType: 2,

           callInTollTypes: [ {
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
           } ],

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
           }, // callInTeleconf

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

           teleconfLocations: ["North America",
           "South America",
           "Asia",
           "Africa",
           "Australia"]
           } // selectTeleconfLocation
           }, // telephonyPriviledges
           /* end of cut it out*/

          label: null
        };
        // userPrivileges

        // alert("initUserPrivileges(): END");
        console.log("initUserPrivileges(): END");

        this.userPrivileges = userPrivileges;
      };
      // initUserPrivileges()

      this.updateUserSettings = function () {
        alert("updateUserSettings(): START");
        alert("updateUserSettings(): END");
      };
      // updateUserSettings()

      this.userPrivileges = null;
      this.userDataXml = null;
      this.userDataJson = null;

      this.initUserPrivileges();
      this.getUserData();
    } // WebExUserSettingsCtrl()

  ]);
})();
