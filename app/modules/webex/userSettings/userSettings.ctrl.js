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

      this.processData = function () {
        var funcName = "processData()";
        var logMsg = "";

        logMsg = funcName + ": " + "\n" +
          "processDataNeeded=" + this.processDataNeeded + "\n" +
          "userDataLoaded=" + this.userDataLoaded + "\n" +
          "siteInfoLoaded=" + this.siteInfoLoaded + "\n" +
          "meetingTypesInfoLoaded=" + this.meetingTypesInfoLoaded;
        console.log(logMsg);
        // alert(logMsg);

        if (
          (this.processDataNeeded) &&
          (this.userDataLoaded) &&
          (this.siteInfoLoaded) &&
          (this.meetingTypesInfoLoaded)
        ) {

          this.processDataNeeded = false;
          this.initUserPrivilegesModel();
          this.updateUserPrivilegesModel();
        }
      }; // processData()

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
          currView.processData();
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
            currView.processData();
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
          currView.processData();
        }).error(function () {
          logMsg = funcName + ".error()" + ": " + "\n" + "data=" + data;
          alert(logMsg);
        });
      }; // loadSiteInfo()

      this.initUserPrivilegesModel = function () {
        function initSessionType(centerObj) {
          var funcName = "initSessionType()";
          var logMsg = "";
          var siteInfoJson = currView.siteInfoJson;
          var siteServiceTypes = [].concat(siteInfoJson.body.ns1_siteInstance.ns1_metaData.ns1_serviceType);

          siteServiceTypes.forEach(function (siteServiceType) {
            if (siteServiceType == centerObj.name) { // center type is enabled for the site
              centerObj.isEnabled = true;
            } // // center type is enabled for the site
          }); // siteServiceTypes.forEach()

          centerObj.sessionTypes = getSessionTypes(
            centerObj.name,
            centerObj.serviceType
          );

          logMsg = funcName + ": " + "\n" +
            "Meeting Center sessionTypesLen=" + userPrivilegesModel.meetingCenter.sessionTypes.length;
          console.log(logMsg);
          // alert(logMsg);
        }; // initSessionType()

        function getSessionTypes(targetCenterName, targetServiceType) {
          var funcName = "getSessionTypes()";
          var logMsg = "";

          var sessionTypes = new Array;
          var meetingTypesInfoJson = currView.meetingTypesInfoJson.body;

          var siteMeetingTypes = meetingTypesInfoJson.mtgtype_meetingType;

          logMsg = funcName + ": " + "\n" +
            "siteMeetingTypes=" + JSON.stringify(siteMeetingTypes);
          console.log(logMsg);

          siteMeetingTypes.forEach(function (siteMeetingType) {
            var siteMtgServiceTypeID = siteMeetingType.mtgtype_meetingTypeID;
            var siteMtgProductCodePrefix = siteMeetingType.mtgtype_productCodePrefix;
            var siteMtgDisplayName = siteMeetingType.mtgtype_displayName;
            var siteMtgServiceTypes = [].concat(siteMeetingType.mtgtype_serviceTypes.mtgtype_serviceType);
            var siteMtgServiceTypesIsMultiCenter = (siteMtgServiceTypes.length > 1) ? true : false;

            logMsg = funcName + ": " + "\n" +
              "targetCenterName=" + targetCenterName + "\n" +
              "targetServiceType=" + targetServiceType + "\n" +
              "siteMtgServiceTypeID=" + siteMtgServiceTypeID + "\n" +
              "siteMtgProductCodePrefix=" + siteMtgProductCodePrefix + "\n" +
              "siteMtgDisplayName=" + siteMtgDisplayName + "\n" +
              "siteMtgServiceTypes=" + siteMtgServiceTypes + "\n" +
              "siteMtgServiceTypesIsMultiCenter=" + siteMtgServiceTypesIsMultiCenter;
            console.log(logMsg);
            // alert(logMsg);

            siteMtgServiceTypes.forEach(function (siteMtgServiceType) {
              if (siteMtgServiceType == targetServiceType) { // session type applies to the center being checked                
                var sessionType = {
                  id: siteMtgServiceType + "-" + siteMtgServiceTypeID,
                  sessionTypeID: siteMtgServiceTypeID,
                  sessionName: siteMtgProductCodePrefix,
                  sessionDescription: siteMtgDisplayName,
                  sessionIsMultiCenter: siteMtgServiceTypesIsMultiCenter,
                  sessionEnabled: false
                };

                logMsg = funcName + ": " + "\n" +
                  "sessionType=" + JSON.stringify(sessionType) + "\n" +
                  "Added for " + targetCenterName;
                console.log(logMsg);
                // alert(logMsg);

                sessionTypes.push(sessionType);
              } // session type applys to the center being checked
            }); // siteMeetingTypes.forEach()
          }); // siteMeetingTypes.forEach()

          return sessionTypes;
        }; // getSessionTypes()

        /*----------------------------------------------------------------------*/

        var funcName = "initUserPrivilegesModel()";
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
            sessionTypes: null
          }, // meetingCenter

          trainingCenter: {
            name: "Training Center",
            serviceType: "TrainingCenter",
            isEnabled: false,
            sessionTypes: null,

            handsOnLabAdmin: {
              id: "handsOnLabAdmin",
              label: "Hands-on Lab Admin (effective only when hands-on lab is enabled)",
              value: false
            },

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
            sessionTypes: null,

            optimizeBandwidthUsage: {
              id: "optimizeBandwidthUsage",
              label: "Optimized bandwidth usage for attendees within the same network",
              value: false
            },

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
            isEnabled: false,
            sessionTypes: null
          } // supportCenter
        }; // userPrivilegesModel

        initSessionType(userPrivilegesModel.meetingCenter);
        initSessionType(userPrivilegesModel.trainingCenter);
        initSessionType(userPrivilegesModel.eventCenter);
        initSessionType(userPrivilegesModel.supportCenter);

        this.userPrivilegesModel = userPrivilegesModel;
      }; // initUserPrivilegesModel()

      this.updateUserPrivilegesModel = function (sessionTypes) {
        function updateSessionPrivilege(centerobj) {
          var funcName = "updateSessionPrivilege()";
          var logMsg = null;

          enabledSessionTypesIDs.forEach(function (enabledSessionTypeID) { // loop through user's enabled session type
            var availableSessionTypes = centerobj.sessionTypes;

            availableSessionTypes.forEach(function (sessionType) { // loop through all the session types available
              logMsg = funcName + ": " + "\n" +
                "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                "sessionTypeID=" + sessionType.sessionTypeID;
              console.log(logMsg);
              // alert(logMsg);

              if (enabledSessionTypeID == sessionType.sessionTypeID) {
                sessionType.sessionEnabled = true;

                logMsg = funcName + ": " + "\n" +
                  "enabledSessionTypeID=" + enabledSessionTypeID + "\n" +
                  "sessionType.id=" + sessionType.id + "\n" +
                  "Enabled for the user";
                console.log(logMsg);
                // alert(logMsg);
              }
            }); // enabledSessionTypesIDs.forEach()
          }); // enabledSessionTypesIDs.forEach()
        }; // updateSessionPrivilege()

        /*----------------------------------------------------------------------*/

        var funcName = "updateUserPrivilegesModel()";
        var logMsg = null;
        var currView = this;
        var userPrivilegesModel = currView.userPrivilegesModel;
        var userDataXml = currView.userDataXml;
        var userDataJson = currView.userDataJson;

        logMsg = funcName + ": " + "\n" + "userDataJson=\n" + JSON.stringify(userDataJson);
        console.log(logMsg);
        // alert(logMsg);

        var enabledSessionTypesIDs = [].concat(userDataJson.body.use_meetingTypes.use_meetingType);

        logMsg = funcName + ": " + "\n" +
          "enabledSessionTypesIDs=" + enabledSessionTypesIDs + "";
        console.log(logMsg);
        // alert(logMsg);

        updateSessionPrivilege(userPrivilegesModel.meetingCenter);
        updateSessionPrivilege(userPrivilegesModel.trainingCenter);
        updateSessionPrivilege(userPrivilegesModel.eventCenter);
        updateSessionPrivilege(userPrivilegesModel.supportCenter);

        $("#webexUserSettingsPage").removeClass("hidden");
      }; // updateUserPrivilegesModel()

      this.updateUserSettings = function () {
        alert("updateUserSettings(): START");
        alert("updateUserSettings(): END");
      }; // updateUserSettings()

      /*----------------------------------------------------------------------*/

      this.userPrivilegesModel = null;
      this.userDataXml = null;
      this.userDataJson = null;
      this.siteInfoXml = null;
      this.siteInfoJson = null;
      this.meetingTypesInfoXml = null;
      this.meetingTypesInfoJson = null;
      this.siteInfoLoaded = false;
      this.meetingTypesInfoLoaded = false;
      this.userDataLoaded = false;
      this.processDataNeeded = true;

      this.loadSiteInfo();
      this.loadMeetingTypesInfo();
      this.loadUserData();
    } // WebExUserSettingsCtrl()
  ]);
})();
