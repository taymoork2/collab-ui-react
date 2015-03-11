(function () {
  'use strict';

  /* global X2JS */

  angular.module('WebExUserSettings').factory('XmlApiSvc', [
    '$http',
    '$log',
    '$interpolate',
    '$q',
    '$rootScope',
    'Authinfo',
    'Storage',
    'XmlApiConstants',
    function (
      $http,
      $log,
      $interpolate,
      $q,
      $rootScope,
      Authinfo,
      Storage,
      constants
    ) {
      var _self = this;
      var x2js = new X2JS();

      this.getXMLApi = function (xmlServerURL, xmlRequest, resolve, reject) {
        $http({
          url: xmlServerURL,
          method: "POST",
          data: xmlRequest,
          headers: {
            'Content-Type': 'application/x-www-rform-urlencoded'
          }
        }).success(function (data) {
          resolve(data);
        }).error(function (data) {
          reject(data);
        });
      }; //getXMLApi()

      return {
        getSiteInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlServerURL = xmlApiAccessInfo.xmlServerURL;
            var xmlRequest = $interpolate(constants.siteInfoRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //getSiteInfo()

        getUserInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlServerURL = xmlApiAccessInfo.xmlServerURL;
            var xmlRequest = $interpolate(constants.userInfoRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //getUserInfo()

        getMeetingTypeInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlServerURL = xmlApiAccessInfo.xmlServerURL;
            var xmlRequest = $interpolate(constants.meetingTypeInfoRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //getMeetingTypeInfo()

        updateUserPrivileges: function (xmlApiAccessInfo, userPrivileges) {
          var funcName = "getMeetingTypeInfo()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "xmlApiAccessInfo=" + JSON.stringify(xmlApiAccessInfo);
          // $log.log(logMsg);

          return $q(function (resolve, reject) {
            var xmlServerURL = xmlApiAccessInfo.xmlServerURL;
            var xmlRequest = $interpolate(constants.updateUserPrivileges1)(xmlApiAccessInfo);
            xmlRequest += $interpolate(constants.updateUserPrivileges2)(xmlApiAccessInfo);
            xmlRequest += constants.updateUserPrivileges3_1;

            for (var i = 0; i < userPrivileges.meetingTypes.length; i++) {
              var tmpMeetingTypesObj = {};
              tmpMeetingTypesObj.meetingType = userPrivileges.meetingTypes[i];
              xmlRequest += $interpolate(constants.updateUserPrivileges3_2)(tmpMeetingTypesObj);
              // xmlRequest += "                <use:meetingType>" + userPrivileges.meetingTypes[i] + "</use:meetingType>";
            }

            xmlRequest += constants.updateUserPrivileges3_3;

            xmlRequest += $interpolate(constants.updateUserPrivileges4)(userPrivileges);
            $log.log("xmlRequest after second interpolate = " + xmlRequest);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, // updateUserPrivileges()

        getSessionTicketInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlServerURL = xmlApiAccessInfo.xmlServerURL;
            var xmlRequest = $interpolate(constants.sessionTicketRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //getSessionTicketInfo()

        getSessionTicket: function (wbxSiteUrl) {
          var funcName = "getSessionTicket()";
          var logMsg = "";
          var index = wbxSiteUrl.indexOf(".");
          var wbxSiteName = wbxSiteUrl.slice(0, index);

          if (!$rootScope.sessionTickets) {
            $log.log("No Session tickets in $rootScope, will check Storage");
            var storedSessionTicketsJson = Storage.get('sessionTickets');
            if (storedSessionTicketsJson !== null) {
              $rootScope.sessionTickets = JSON.parse(storedSessionTicketsJson);
              $log.log("Found some session tickets in Storage.sessionTickets = " + $rootScope.sessionTickets);
            } else {
              $log.log("No Storage.sessionTickets");
              $rootScope.sessionTickets = {};
              logMsg = funcName + ": " + "No Session tickets in scope or Storage, will create new one for site= " + wbxSiteName;
              $log.log(logMsg);
              return this.getNewSessionTicket(wbxSiteName, wbxSiteUrl);
            }
          }

          var ticket = $rootScope.sessionTickets[wbxSiteName];
          if ((typeof ticket === "undefined") || (ticket === null)) {
            logMsg = funcName + ": " + "No Session ticket in scope for Site= " + wbxSiteName + " will create new one for this site";
            $log.log(logMsg);
            return this.getNewSessionTicket(wbxSiteName, wbxSiteUrl);
          } else {
            var validTime = ticket.validUntil;
            var d = new Date();
            var currentTime = d.getTime();
            logMsg = funcName + ": " + "Found Session ticket for Site= " + wbxSiteName;
            $log.log(logMsg);
            logMsg = funcName + ": " + "currentTime= " + currentTime + " Ticket Validity= " + validTime;
            $log.log(logMsg);
            if (currentTime < validTime) {
              logMsg = funcName + ": " + "Returning session ticket for Site= " + wbxSiteName + " from cache";
              $log.log(logMsg);
              return ticket.sessionTik;
            } else {
              logMsg = funcName + ": " + " Session ticket for Site= " + wbxSiteName + " in cache has expired. Will get a new ticket";
              $log.log(logMsg);
              return this.getNewSessionTicket(wbxSiteName, wbxSiteUrl);
            }
          }
        }, //getSessionTicket()

        getNewSessionTicket: function (wbxSiteName, wbxSiteUrl) {
          var funcName = "getSessionTicket()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "wbxSiteName=" + wbxSiteName + "\n" +
            "wbxSiteUrl=" + wbxSiteUrl;
          // $log.log(logMsg);

          var currView = this;

          var xmlApiAccessInfo = {
            xmlServerURL: "https://" + wbxSiteUrl + "/WBXService/XMLService",
            wbxSiteName: wbxSiteName,
            webexAdminID: Authinfo.getUserName(),
            accessToken: $rootScope.token
          };

          this.getSessionTicketInfo(xmlApiAccessInfo).then(

            function getSessionTicketInfoSuccess(result) {
              var funcName = "getSessionTicketInfoSuccess()";
              var logMsg = "";

              logMsg = funcName + ".success()" + ": " + "\n" + "data=" + result;
              $log.log(logMsg);

              var JsonData = currView.xml2JsonConvert("User Data", result, "<serv:message", "<//serv:message>");
              logMsg = funcName + ".success()" + ": " + "\n" + "JsonData=" + JSON.stringify(JsonData);
              $log.log(logMsg);
              result = JsonData.body.serv_message.serv_header.serv_response.serv_result;
              if (result != "SUCCESS") {
                logMsg = funcName + ".error()" + ": " + "\n" + "JsonData=" + JSON.stringify(JsonData) + " , result=" + result;
                $log.log(logMsg);
                return null;
              }
              var sessionTicket = JsonData.body.serv_message.serv_body.serv_bodyContent.use_sessionTicket;
              var createTime = JsonData.body.serv_message.serv_body.serv_bodyContent.use_createTime;
              var ttl = JsonData.body.serv_message.serv_body.serv_bodyContent.use_timeToLive;
              var ttlMSec = (parseInt(ttl) - 100) * 1000;
              if (sessionTicket !== null) {
                var ticket = {}; //new object
                ticket.site = wbxSiteName;
                ticket.sessionTik = sessionTicket;
                ticket.validUntil = parseInt(createTime) + ttlMSec;
                $log.log(ticket.validUntil);
                if ($rootScope.sessionTickets === null) {
                  $rootScope.sessionTickets = {};
                }
                $rootScope.sessionTickets[wbxSiteName] = ticket;
                Storage.put('sessionTickets', JSON.stringify($rootScope.sessionTickets));
              }
            }, //getSessionTicketInfoSuccess();

            function getSessionTicketInfoError(result) {
              var funcName = "getSessionTicketInfoError()";
              var logMsg = "";
              logMsg = funcName + ".error()" + ": " + "\n" + "data=" + result;
              $log.log(logMsg);
            });
        }, // getNewSessionTicket()

        xml2JsonConvert: function (commentText, xmlDataText, startOfBodyStr, endOfBodyStr) {
          var funcName = "xml2JsonConvert()";
          var logMsg = "";

          logMsg = funcName + ": " + commentText + "\n" +
            "startOfBodyStr=" + startOfBodyStr + "\n" +
            "endOfBodyStr=" + endOfBodyStr + "\n" +
            "xmlDataText=" + "\n" + xmlDataText;
          // $log.log(logMsg);
          // alert(logMsg);

          var startOfBodyIndex = xmlDataText.indexOf(startOfBodyStr);
          var endOfBodyIndex = (null == endOfBodyStr) ? 0 : xmlDataText.indexOf(endOfBodyStr);

          // logMsg = funcName + ": " + commentText + "\n" +
          //   "startOfBodyIndex=" + startOfBodyIndex + "\n" +
          //   "endOfBodyIndex=" + endOfBodyIndex;
          // $log.log(logMsg);
          // alert(logMsg);

          var bodySlice = "";
          if (
            (0 <= startOfBodyIndex) &&
            (0 <= endOfBodyIndex)
          ) {
            bodySlice = (startOfBodyIndex < endOfBodyIndex) ? xmlDataText.slice(startOfBodyIndex, endOfBodyIndex) : xmlDataText.slice(startOfBodyIndex);
          } else {
            logMsg = funcName + ": " + commentText + "; " + "ERROR!" + "\n" +
              "startOfBodyStr=" + startOfBodyStr + "\n" +
              "endOfBodyStr=" + endOfBodyStr + "\n" +
              "xmlDataText=" + "\n" + xmlDataText;
            $log.log(logMsg);
            // alert(logMsg);
          }

          constants.replaceSets.forEach(function (replaceSet) {
            bodySlice = bodySlice.replace(replaceSet.replaceThis, replaceSet.withThis);
          });

          logMsg = funcName + ": " + commentText + "\n" +
            "bodySlice=" + "\n" + bodySlice;
          // $log.log(logMsg);
          // alert(logMsg);

          var fullBody = "<body>" + bodySlice + "</body>";

          logMsg = funcName + ": " + commentText + "\n" +
            "fullBody=" + "\n" + fullBody;
          // $log.log(logMsg);
          // alert(logMsg);

          var bodyJson = x2js.xml_str2json(fullBody);

          logMsg = funcName + ": " + commentText + "\n" +
            "bodyJson=\n" + JSON.stringify(bodyJson);
          $log.log(logMsg);
          // alert(logMsg);

          return bodyJson;
        }, // xml2JsonConvert()
      }; // return
    } //WebExUserSettingsSvc()
  ]);
})();
