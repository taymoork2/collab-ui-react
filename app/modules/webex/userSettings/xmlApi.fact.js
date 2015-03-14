(function () {
  'use strict';

  /* global X2JS */

  angular.module('WebExUserSettings').factory('XmlApiFact', [
    '$http',
    '$log',
    '$interpolate',
    '$q',
    '$timeout',
    '$rootScope',
    'Authinfo',
    'Storage',
    'XmlApiSvc',
    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
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

        updateUserSettings: function (xmlApiAccessInfo, userPrivileges) {
          var funcName = "updateUserSettings()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "xmlApiAccessInfo=" + JSON.stringify(xmlApiAccessInfo);
          $log.log(logMsg);

          var xmlRequest = $interpolate(constants.updateUserSettings1)(xmlApiAccessInfo);

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #1 =\n" + xmlRequest;
          $log.log(logMsg);

          xmlRequest += $interpolate(constants.updateUserSettings2)(xmlApiAccessInfo);

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #2 =\n" + xmlRequest;
          $log.log(logMsg);

          xmlRequest += constants.updateUserSettings3_1;
          $log.log("xmlRequest #3 =\n" + xmlRequest);

          for (var i = 0; i < userPrivileges.meetingTypes.length; i++) {
            var tmpMeetingTypesObj = {};
            tmpMeetingTypesObj.meetingType = userPrivileges.meetingTypes[i];
            xmlRequest += $interpolate(constants.updateUserSettings3_2)(tmpMeetingTypesObj);
          }

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #4 =\n" + xmlRequest;
          $log.log(logMsg);

          xmlRequest += constants.updateUserSettings3_3;

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #5 =\n" + xmlRequest;

          xmlRequest += $interpolate(constants.updateUserSettings4)(userPrivileges);
          $log.log("xmlRequest #6 = " + xmlRequest);

          return $q(
            function (resolve, reject) {
              _self.getXMLApi(
                xmlApiAccessInfo.xmlServerURL,
                xmlRequest,
                resolve,
                reject
              );
            }
          );
        }, // updateUserSettings()

        updateUserSettings2: function (xmlApiAccessInfo, userPrivileges) {
          return null;
        }, // updateUserSettings2()

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
          var ticketObj = null;
          var deferred = $q.defer();
          var currView = this;
          var getNewTicket = true;

          if (!$rootScope.sessionTickets) {
            $log.log("No Session tickets in $rootScope, will check Storage");
            var storedSessionTicketsJson = Storage.get('sessionTickets');
            if (storedSessionTicketsJson !== null) {
              $rootScope.sessionTickets = JSON.parse(storedSessionTicketsJson);
              $log.log("Found some session tickets in Storage.sessionTickets = " + $rootScope.sessionTickets);
            }
          }

          if ($rootScope.sessionTickets) {
            ticketObj = $rootScope.sessionTickets[wbxSiteName];
            if (ticketObj) {
              var validTime = ticketObj.validUntil;
              var d = new Date();
              var currentTime = d.getTime();
              logMsg = funcName + ": " + "Found Session ticket for Site= " + wbxSiteName;
              $log.log(logMsg);
              logMsg = funcName + ": " + "currentTime= " + currentTime + " Ticket Validity= " + validTime;
              $log.log(logMsg);
              if (currentTime < validTime) {
                logMsg = funcName + ": " + "Returning session ticket for Site= " + wbxSiteName + " from cache";
                $log.log(logMsg);
                deferred.resolve(ticketObj.sessionTik);
                getNewTicket = false;
              }
            }
          }

          if (getNewTicket) {
            logMsg = funcName + ": " + "No valid Session ticket in scope for Site= " + wbxSiteName + " will create new one for this site";
            $log.log(logMsg);

            currView.getNewSessionTicket(wbxSiteName, wbxSiteUrl).then(
              function getNewSessionTicketSuccess(tik) {
                funcName = "getNewSessionTicketSuccess()";
                if ($rootScope.sessionTickets) {
                  ticketObj = $rootScope.sessionTickets[wbxSiteName];
                  if (ticketObj && ticketObj.sessionTik) {
                    logMsg = funcName + ": " + "Returning a new session ticket for Site= " + wbxSiteName;
                    $log.log(logMsg);
                    deferred.resolve(ticketObj.sessionTik);
                  }
                }
              },
              function getNewSessionTicketError(reason) {
                funcName = "getNewSessionTicketError()";
                logMsg = funcName + ": " + "ERROR - Failed to create a valid Session ticket for Site= " + wbxSiteName;
                $log.log(logMsg);
                deferred.reject(reason);
              });
          }

          logMsg = funcName + " Exiting";
          $log.log(logMsg);
          return deferred.promise;
        }, //getSessionTicket()

        getNewSessionTicket: function (wbxSiteName, wbxSiteUrl) {
          var currView = this;
          var defer = $q.defer();
          var funcName = "getSessionTicketInfoSuccess()";
          var logMsg = "";

          var xmlApiAccessInfo = {
            xmlServerURL: "https://" + wbxSiteUrl + "/WBXService/XMLService",
            wbxSiteName: wbxSiteName,
            webexAdminID: Authinfo.getUserName(),
            accessToken: $rootScope.token
          };

          this.getSessionTicketInfo(xmlApiAccessInfo).then(

            function getSessionTicketInfoSuccess(result) {
              funcName = "getSessionTicketInfoSuccess()";

              logMsg = funcName + ".success()" + ": " + "\n" + "data=" + result;
              $log.log(logMsg);

              var JsonData = currView.xml2JsonConvert("Authentication Data", result, "<serv:header", "</serv:message>");
              logMsg = funcName + ".success()" + ": " + "\n" + "JsonData=" + JSON.stringify(JsonData);
              $log.log(logMsg);
              result = JsonData.body.serv_header.serv_response.serv_result;
              if (result != "SUCCESS") {
                logMsg = funcName + ".error()" + ": " + "\n" + "JsonData=" + JSON.stringify(JsonData) + " , result=" + result;
                $log.log(logMsg);
                defer.reject('Error from AS');
              } else {
                var sessionTicket = JsonData.body.serv_body.serv_bodyContent.use_sessionTicket;
                var createTime = JsonData.body.serv_body.serv_bodyContent.use_createTime;
                var ttl = JsonData.body.serv_body.serv_bodyContent.use_timeToLive;
                var ttlMSec = (parseInt(ttl) - 100) * 1000;
                if (sessionTicket !== null) {
                  var ticket = {}; //new object
                  ticket.site = wbxSiteName;
                  ticket.sessionTik = sessionTicket;
                  ticket.validUntil = parseInt(createTime) + ttlMSec;
                  $log.log(ticket.validUntil);
                  if (!$rootScope.sessionTickets) {
                    $rootScope.sessionTickets = {};
                  }
                  $rootScope.sessionTickets[wbxSiteName] = ticket;
                  Storage.put('sessionTickets', JSON.stringify($rootScope.sessionTickets));
                  logMsg = funcName + ".success()" + ": " + "\n" + "Generated a new ticket for site=" + wbxSiteName;
                  $log.log(logMsg);
                  defer.resolve(ticket.sessionTik);
                }
              }
            }, //getSessionTicketInfoSuccess();

            function getSessionTicketInfoError(reason) {
              funcName = "getSessionTicketInfoError()";

              logMsg = funcName + ".error()" + ": " + "\n" + "reason= " + reason;
              $log.log(logMsg);
              defer.reject(reason);
            }); //getSessionTicketInfoError
          logMsg = funcName + " Exiting";
          $log.log(logMsg);
          return defer.promise;
        }, // getNewSessionTicket()

        xml2JsonConvert: function (commentText, xmlData, startOfBodyStr, endOfBodyStr) {
          var funcName = "xml2JsonConvert()";
          var logMsg = "";

          logMsg = funcName + ": " + commentText + "\n" +
            "startOfBodyStr=" + startOfBodyStr + "\n" +
            "endOfBodyStr=" + endOfBodyStr + "\n" +
            "xmlData=" + "\n" + xmlData;
          // $log.log(logMsg);
          // alert(logMsg);

          var startOfBodyIndex = (null == startOfBodyStr) ? -1 : xmlData.indexOf(startOfBodyStr);
          var endOfBodyIndex = (null == endOfBodyStr) ? -1 : xmlData.indexOf(endOfBodyStr);

          logMsg = funcName + ": " + commentText + "\n" +
            "startOfBodyIndex=" + startOfBodyIndex + "\n" +
            "endOfBodyIndex=" + endOfBodyIndex;
          // $log.log(logMsg);
          // alert(logMsg);

          var bodySliceXml = "";
          if (
            (0 <= startOfBodyIndex) &&
            (0 <= endOfBodyIndex) &&
            (startOfBodyIndex <= endOfBodyIndex)
          ) {
            bodySliceXml = (startOfBodyIndex < endOfBodyIndex) ? xmlData.slice(startOfBodyIndex, endOfBodyIndex) : xmlData.slice(startOfBodyIndex);
          } else {
            logMsg = funcName + ": " + commentText + "; " + "ERROR!" + "\n" +
              "startOfBodyStr=" + startOfBodyStr + "\n" +
              "startOfBodyIndex=" + startOfBodyIndex + "\n" +
              "endOfBodyStr=" + endOfBodyStr + "\n" +
              "endOfBodyIndex=" + endOfBodyIndex + "\n" +
              "xmlData=" + "\n" + xmlData;
            $log.log(logMsg);
            // alert(logMsg);
          }

          constants.replaceSets.forEach(function (replaceSet) {
            bodySliceXml = bodySliceXml.replace(replaceSet.replaceThis, replaceSet.withThis);
          });

          logMsg = funcName + ": " + commentText + "\n" +
            "bodySliceXml=" + "\n" + bodySliceXml;
          // $log.log(logMsg);
          // alert(logMsg);

          var fullBodyXml = "<body>" + bodySliceXml + "</body>";

          logMsg = funcName + ": " + commentText + "\n" +
            "fullBodyXml=" + "\n" + fullBodyXml;
          // $log.log(logMsg);
          // alert(logMsg);

          var fullBodyJson = x2js.xml_str2json(fullBodyXml);

          logMsg = funcName + ": " + commentText + "\n" +
            "fullBodyJson=\n" + JSON.stringify(fullBodyJson);
          $log.log(logMsg);
          // alert(logMsg);

          return fullBodyJson;
        }, // xml2JsonConvert()
      }; // return
    } //XmlApiFact()
  ]);
})();
