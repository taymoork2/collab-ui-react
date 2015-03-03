(function () {
  'use strict';

  angular.module('WebExUserSettings').controller('WebExUserSettingsCtrl', ['$scope', '$http',
    function ($scope, $http) {
      this.xml2JsonConvert = function (commentText, xmlDataText, startOfBodyStr, endOfBodyStr) {
        var funcName = "xml2JsonConvert()";
        var logMsg = "";

        logMsg = funcName + ": " + commentText + "\n" + "startOfBodyStr=" + startOfBodyStr + "\n" + "endOfBodyStr=" + endOfBodyStr;
        console.log(logMsg);
        // alert(logMsg);

        var startOfBodyIndex = xmlDataText.indexOf(startOfBodyStr);
        var endOfBodyIndex = (null == endOfBodyStr) ? 0 : xmlDataText.indexOf(endOfBodyStr);

        logMsg = funcName + ": " + commentText + "\n" + "startOfBodyIndex=" + startOfBodyIndex + "\n" + "endOfBodyIndex=" + endOfBodyIndex;
        console.log(logMsg);
        // alert(logMsg);

        var regExp = null;
        var bodySlice = (startOfBodyIndex < endOfBodyIndex) ? xmlDataText.slice(startOfBodyIndex, endOfBodyIndex) : xmlDataText.slice(startOfBodyIndex);

        regExp = /<ns1:/g;
        bodySlice = bodySlice.replace(regExp, "<ns1_");

        regExp = /<\/ns1:/g;
        bodySlice = bodySlice.replace(regExp, "</ns1_");

        regExp = /<serv:/g;
        bodySlice = bodySlice.replace(regExp, "<serv_");

        regExp = /<\/serv:/g;
        bodySlice = bodySlice.replace(regExp, "</serv_");

        regExp = /<use:/g;
        bodySlice = bodySlice.replace(regExp, "<use_");

        regExp = /<\/use:/g;
        bodySlice = bodySlice.replace(regExp, "</use_");

        regExp = /<com:/g;
        bodySlice = bodySlice.replace(regExp, "<com_");

        regExp = /<\/com:/g;
        bodySlice = bodySlice.replace(regExp, "</com_");

        regExp = /<mtgtype:/g;
        bodySlice = bodySlice.replace(regExp, "<mtgtype_");

        regExp = /<\/mtgtype:/g;
        bodySlice = bodySlice.replace(regExp, "</mtgtype_");

        bodySlice = "<body>" + bodySlice + "</body>";

        logMsg = funcName + ": " + commentText + "\n" + "bodySlice=\n" + bodySlice;
        console.log(logMsg);

        var x2js = new X2JS();
        var bodyJson = x2js.xml_str2json(bodySlice);

        logMsg = funcName + ": " + commentText + "\n" + "bodyJson=\n" + JSON.stringify(bodyJson);
        console.log(logMsg);

        return bodyJson;
      }; // xml2JsonConvert()

      this.processDataLoaded = function () {
        var funcName = "processDataLoaded()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "userDataLoaded=" + this.userDataLoaded + "\n" +
          "siteInfoLoaded=" + this.siteInfoLoaded + "\n" +
          "meetingTypesInfoLoaded=" + this.meetingTypesInfoLoaded;
        console.log(logMsg);
        // alert(logMsg);

        if (
          (this.userDataLoaded) &&
          (this.siteInfoLoaded) &&
          (this.meetingTypesInfoLoaded)
        ) {
          this.updateUserPrivilegesModel();
        }
      }; // processDataLoaded()

      this.loadUserData = function () {
        var funcName = "loadUserData()";
        var logMsg = "";
        var currView = this;

        var webexAdminId = "jpallapa";
        var webexAdminPswd = "C!sco123";
        var siteID = "4272";
        var partnerID = "4272";
        var webexUserId = "jpallapa";
        var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";

        var reqXML =
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
          "    <header>" +
          "        <securityContext>" +
          "            <webExID>" + webexAdminId + "</webExID>" +
          "            <password>" + webexAdminPswd + "</password>" +
          "            <siteID>" + siteID + "</siteID>" +
          "            <partnerID>" + partnerID + "</partnerID>" +
          "        </securityContext>" +
          "    </header>" +
          "    <body>" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" +
          "            <webExId>" + webexUserId + "</webExId>" +
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
        }).success(function (data) {
          currView.userDataXml = $(data);

          // TODO:
          //   add code to validate currView.userDataXml

          currView.userDataJson = currView.xml2JsonConvert("User Data", data, "<use:", "</serv:bodyContent>");
          currView.userDataLoaded = true;
          currView.processDataLoaded();
        }).error(function (data) {
          logMsg = funcName + ".error()" + ": " + "\n" + "data=" + data;
          alert(logMsg);
        });
      }; // loadUserData()

      this.loadMeetingTypesInfo = function () {
        var funcName = "loadMeetingTypesInfo()";
        var logMsg = "";
        var currView = this;

        var webexAdminId = "jpallapa";
        var webexAdminPswd = "C!sco123";
        var siteID = "4272";
        var partnerID = "4272";
        var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";

        var reqXML =
          "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>\n" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">\n" +
          "    <header>\n" +
          "        <securityContext>\n" +
          "            <webExID>" + webexAdminId + "</webExID>\r\n" +
          "            <password>" + webexAdminPswd + "</password>\r\n" +
          "            <siteID>" + siteID + "</siteID>\r\n" +
          "            <partnerID>" + partnerID + "</partnerID>\r\n" +
          "        </securityContext>\n" +
          "    </header>\n" +
          "    <body>\n" +
          "      <bodyContent " +
          "        xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\">\r\n" +
          "      </bodyContent>" +
          "    </body>\n" +
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
            currView.meetingTypesInfoXml = $(data);

            // TODO:
            //   add code to validate currView.meetingTypesInfoXml

            currView.meetingTypesInfoJson = currView.xml2JsonConvert("Meeting Types Info", data, "<mtgtype:", "</serv:bodyContent>");
            currView.meetingTypesInfoLoaded = true;
            currView.processDataLoaded();
          })
          .error(function () {
            alert("Error " + data);
          });
      }; // loadMeetingTypesInfo()

      this.loadSiteInfo = function () {
        var funcName = "loadSiteInfo()";
        var logMsg = "";
        var currView = this;

        var webexAdminId = "jpallapa";
        var webexAdminPswd = "C!sco123";
        var webexAdminEmail = "jpallapa@cisco.com";
        var siteID = "4272";
        var partnerID = "4272";
        var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";

        var reqXML =
          "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
          "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
          "    <header>" +
          "        <securityContext>" +
          "            <webExID>" + webexAdminId + "</webExID>" +
          "            <password>" + webexAdminPswd + "</password>" +
          "            <siteID>" + siteID + "</siteID>" +
          "            <partnerID>" + partnerID + "</partnerID>" +
          "            <email>" + webexAdminEmail + "</email>" +
          "        </securityContext>" +
          "    </header>" +
          "    <body>" +
          "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />" +
          "    </body>" +
          "</serv:message>";

        $http({
          url: xmlServerURL,
          method: "POST",
          data: reqXML,
          headers: {
            'Content-Type': 'application/x-www-rform-urlencoded'
          }
        }).success(function (data) {
          currView.siteInfoXml = $(data);

          // TODO:
          //   add code to validate currView.siteInfoXml

          currView.siteInfoJson = currView.xml2JsonConvert("Site Info", data, "<ns1:", "</serv:bodyContent>");
          currView.siteInfoLoaded = true;
          currView.processDataLoaded();
        }).error(function () {
          logMsg = funcName + ".error()" + ": " + "\n" + "data=" + data;
          alert(logMsg);
        });
      }; // loadSiteInfo()

      this.createUserPrivilegesModel = function () {
        var funcName = "createUserPrivilegesModel()";
        var logMsg = "";
        var currView = this;

        var userPrivilegesModel = {
          /*
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
          }, //trainingCenter

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
                "Australia"
              ]
            } //selectTeleconfLocation
          }, // telephonyPriviledges
          */

          label: "Services",
          webexCenters: new Array,

          meetingCenter: {
            name: "Meeting Center",
            serviceType: "MeetingCenter",
            isEnabled: false,

            /*
            cmr: {
              id: "cmr",
              label: "Collabration Room",
              value: true
            },
            */
          }, // meetingCenter

          trainingCenter: {
            name: "Training Center",
            serviceType: "TrainingCenter",
            isEnabled: false,

            /*
            handsOnLabAdmin: {
              id: "handsOnLabAdmin",
              label: "Hands-on Lab Admin (effective only when hands-on lab is enabled)",
              value: true
            }
            */
          }, // trainingCenter

          eventCenter: {
            name: "Event Center",
            serviceType: "EventCenter",
            isEnabled: false,

            /*
            optimizeBandwidthUsage: {
              id: "optimizeBandwidthUsage",
              label: "Optimized bandwidth usage for attendees within the same network",
              value: true
            }
            */
          }, // eventCenter

          supportCenter: {
            name: "Support Center",
            serviceType: "SupportCenter",
            isEnabled: false
          }, // supportCenter

          sessionTypes: null
        }; // userPrivilegesModel

        return userPrivilegesModel;
      }; // createUserPrivilegesModel()

      this.updateUserPrivilegesModel = function () {
        function updateCenterStatus() {
          var funcName = "updateCenterStatus()";
          var logMsg = "";
          var siteInfoJson = currView.siteInfoJson;
          var siteServiceTypes = [].concat(siteInfoJson.body.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          siteServiceTypes.forEach(function (siteServiceType) {
            if (siteServiceType == userPrivilegesModel.meetingCenter.name) {
              userPrivilegesModel.meetingCenter.isEnabled = true;
            } else if (siteServiceType == userPrivilegesModel.eventCenter.name) {
              userPrivilegesModel.eventCenter.isEnabled = true;
            } else if (siteServiceType == userPrivilegesModel.trainingCenter.name) {
              userPrivilegesModel.trainingCenter.isEnabled = true;
            } else if (siteServiceType == userPrivilegesModel.supportCenter.name) {
              userPrivilegesModel.supportCenter.isEnabled = true;
            }
          }); // siteServiceTypes.forEach()
        }; // updateCenterStatus()

        function updateSessionTypes() {
          var funcName = "updateSessionTypes()";
          var logMsg = null;

          var meetingTypesInfoJson = currView.meetingTypesInfoJson.body;
          var siteMeetingTypes = meetingTypesInfoJson.mtgtype_meetingType;
          var sessionTypes = new Array;

          siteMeetingTypes.forEach(function (siteMeetingType) {
            var siteMtgServiceTypeID = siteMeetingType.mtgtype_meetingTypeID;
            var siteMtgProductCodePrefix = siteMeetingType.mtgtype_productCodePrefix;
            var siteMtgDisplayName = siteMeetingType.mtgtype_displayName;
            var siteMtgServiceTypes = [].concat(siteMeetingType.mtgtype_serviceTypes.mtgtype_serviceType);

            if (1 < siteMtgServiceTypes.length) {
              logMsg = funcName + ": " + "\n" +
                "siteMtgServiceTypeID=" + siteMtgServiceTypeID + "\n" +
                "siteMtgProductCodePrefix=" + siteMtgProductCodePrefix + "\n" +
                "siteMtgServiceTypes=" + siteMtgServiceTypes;
              console.log(logMsg);
              // alert(logMsg);
            }

            var meetingCenterApplicable = false;
            var trainingCenterApplicable = false;
            var eventCenterApplicable = false;
            var supportCenterApplicable = false;

            siteMtgServiceTypes.forEach(function (siteMtgServiceType) {
              if (userPrivilegesModel.meetingCenter.serviceType == siteMtgServiceType) {
                meetingCenterApplicable = true;
              } else if (userPrivilegesModel.eventCenter.serviceType == siteMtgServiceType) {
                if ("AUO" != siteMtgProductCodePrefix) {
                  eventCenterApplicable = true;
                }
              } else if (userPrivilegesModel.trainingCenter.serviceType == siteMtgServiceType) {
                if ("AUO" != siteMtgProductCodePrefix) {
                  trainingCenterApplicable = true;
                }
              } else if (userPrivilegesModel.supportCenter.serviceType == siteMtgServiceType) {
                if (
                  ("SMT" != siteMtgProductCodePrefix) &&
                  ("AUO" != siteMtgProductCodePrefix)
                ) {
                  
                  supportCenterApplicable = true;
                }
              }
            }); // siteMtgServiceTypes.forEach

            var sessionType = {
              id: "sessionType-" + siteMtgServiceTypeID,
              sessionTypeId: siteMtgServiceTypeID,
              sessionName: siteMtgProductCodePrefix,
              sessionDescription: siteMtgDisplayName,
              meetingCenterApplicable: meetingCenterApplicable,
              trainingCenterApplicable: trainingCenterApplicable,
              eventCenterApplicable: eventCenterApplicable,
              supportCenterApplicable: supportCenterApplicable,
              sessionEnabled: false
            };

            sessionTypes.push(sessionType);
          });

          userPrivilegesModel.sessionTypes = sessionTypes;

          var enabledSessionTypesIDs = [].concat(userDataJson.body.use_meetingTypes.use_meetingType);

          logMsg = funcName + ": " + "\n" +
            "enabledSessionTypesIDs=" + enabledSessionTypesIDs;
          console.log(logMsg);
          // alert(logMsg);

          enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
            userPrivilegesModel.sessionTypes.forEach(function (sessionType) {
              var sessionTypeId = sessionType.sessionTypeId;

              logMsg = funcName + ": " + "\n" +
                "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                "sessionTypeId=" + sessionTypeId;
              console.log(logMsg);
              // alert(logMsg);

              if (sessionType.sessionTypeId == enabledSessionTypeID) {
                sessionType.sessionEnabled = true;
              }
            }); // userPrivilegesModel.sessionTypes.forEach()
          }); // enabledSessionTypesIDs.forEach()
        }; // updateSessionTypes()

        /*---------------------------------------*/

        var funcName = "updateUserPrivilegesModel()";
        var logMsg = null;
        var currView = this;
        var userPrivilegesModel = currView.userPrivilegesModel;
        var userDataXml = currView.userDataXml;
        var userDataJson = currView.userDataJson;

        logMsg = funcName + ": " + "\n" + "userDataJson=\n" + JSON.stringify(userDataJson);
        console.log(logMsg);
        // alert(logMsg);

        updateCenterStatus();
        updateSessionTypes();
        $("#webexUserSettingsPage").removeClass("hidden");
      }; // updateUserPrivilegesModel()

      this.updateUserSettings = function () {
        alert("updateUserSettings(): START");
        alert("updateUserSettings(): END");
      }; // updateUserSettings()

      /*----------------------------------------------------------------------*/

      this.userPrivilegesModel = this.createUserPrivilegesModel();

      this.userDataXml = null;
      this.userDataJson = null;
      this.userDataLoaded = false;

      this.siteInfoXml = null;
      this.siteInfoJson = null;
      this.siteInfoLoaded = false;

      this.meetingTypesInfoXml = null;
      this.meetingTypesInfoJson = null;
      this.meetingTypesInfoLoaded = false;

      this.loadSiteInfo();
      this.loadMeetingTypesInfo();
      this.loadUserData();
    } // WebExUserSettingsCtrl()
  ]);
})();
