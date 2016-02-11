(function () {
  'use strict';

  /* global X2JS */

  angular.module('WebExXmlApi').factory('WebExXmlApiFact', [
    '$http',
    '$log',
    '$interpolate',
    '$q',
    '$timeout',
    '$rootScope',
    'Authinfo',
    'Storage',
    'WebExXmlApiConstsSvc',
    function (
      $http,
      $log,
      $interpolate,
      $q,
      $timeout,
      $rootScope,
      Authinfo,
      Storage,
      xmlApiConstants
    ) {
      var _self = this;
      var x2js = new X2JS();

      this.sendXMLApiReq = function (xmlApiUrl, xmlRequest, resolve, reject) {
        var funcName = "sendXMLApiReq()";
        var logMsg = "";

        logMsg = funcName + ": " + "xmlRequest=" + "\n" +
          xmlRequest;
        // $log.log(logMsg);

        $http({
          url: xmlApiUrl,
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
      }; //sendXMLApiReq()

      return {
        getSiteVersion: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(xmlApiConstants.siteVersionRequest)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, // getSiteVersion()

        getSiteInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(xmlApiConstants.siteInfoRequest)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, //getSiteInfo()

        getUserInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(xmlApiConstants.userInfoRequest)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, //getUserInfo()

        getMeetingTypeInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(xmlApiConstants.meetingTypeInfoRequest)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, //getMeetingTypeInfo()

        getSettingPagesInfo: function (xmlApiAccessInfo) {
          var requestTemplate = xmlApiConstants.settingPagesInfoRequest;

          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(requestTemplate)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, // getSettingPagesInfo()

        getReportPagesInfo: function (xmlApiAccessInfo) {
          var requestTemplate = xmlApiConstants.reportPagesInfoRequest;

          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(requestTemplate)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, // getReportPagesInfo()

        getEnableT30UnifiedAdminInfo: function (xmlApiAccessInfo) {
          var requestTemplate = xmlApiConstants.enableT30UnifiedAdminInfoRequest;

          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(requestTemplate)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, // getEnableT30UnifiedAdminInfo()

        updateUserSettings: function (xmlApiAccessInfo, userSettings) {
          var funcName = "updateUserSettings()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "userSettings=" + JSON.stringify(userSettings);
          $log.log(logMsg);

          var xmlRequest = $interpolate(xmlApiConstants.updateUserSettings_1)(xmlApiAccessInfo);

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #1 =\n" + xmlRequest;
          // $log.log(logMsg);

          for (var i = 0; i < userSettings.meetingTypes.length; i++) {
            var tmpMeetingTypesObj = {};
            tmpMeetingTypesObj.meetingType = userSettings.meetingTypes[i];
            xmlRequest += $interpolate(xmlApiConstants.updateUserSettings_2)(tmpMeetingTypesObj);
          }

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #2 =\n" + xmlRequest;
          // $log.log(logMsg);

          xmlRequest += $interpolate(xmlApiConstants.updateUserSettings_3)(userSettings);

          logMsg = funcName + ": " + "\n" +
            "xmlRequest #3 =\n" + xmlRequest;
          $log.log(logMsg);

          return $q(
            function (resolve, reject) {
              _self.sendXMLApiReq(
                xmlApiAccessInfo.xmlApiUrl,
                xmlRequest,
                resolve,
                reject
              );
            }
          );
        }, // updateUserSettings()

        updateUserSettings2: function (xmlApiAccessInfo) {
          var funcName = "updateUserSettings2()";
          var logMsg = "";

          logMsg = funcName + ": " + "\n" +
            "xmlApiAccessInfo=\n" + JSON.stringify(xmlApiAccessInfo);
          $log.log(logMsg);

          var updateUserSettings2XmlMsg =
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "\n" +
            "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"" + "\n" +
            "    xmlns:serv=\"http://www.webex.com/schemas/2002/06/service\">" + "\n" +
            "    <header>" + "\n" +
            "        <securityContext>" + "\n" +
            "            <siteName>{{webexSiteName}}</siteName>" + "\n" +
            "            <webExID>{{webexAdminID}}</webExID>" + "\n" +
            "            <sessionTicket>{{webexAdminSessionTicket}}</sessionTicket>" + "\n" +
            "        </securityContext>" + "\n" +
            "    </header>" + "\n" +
            "    <body>" + "\n" +
            "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.SetUser\">" + "\n" +
            "            <webExId>{{webexUserId}}</webExId>" + "\n";

          // Start of use:privilege
          updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
            "            <use:privilege>" + "\n";

          if (xmlApiAccessInfo.tollSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:teleConfCallIn>{{toll}}</use:teleConfCallIn>" + "\n";
          }

          if (xmlApiAccessInfo.tollFreeSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:teleConfTollFreeCallIn>{{tollFree}}</use:teleConfTollFreeCallIn>" + "\n";
          }

          if (xmlApiAccessInfo.teleconfViaGlobalCallInSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:teleConfCallInInternational>{{teleconfViaGlobalCallIn}}</use:teleConfCallInInternational>" + "\n";
          }

          if (xmlApiAccessInfo.teleCLIAuthEnabledSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:teleCLIAuthEnabled>{{teleCLIAuthEnabled}}</use:teleCLIAuthEnabled>" + "\n";
          }

          if (xmlApiAccessInfo.callBackTeleconfSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:teleConfCallOut>{{callBackTeleconf}}</use:teleConfCallOut>" + "\n";

            if (xmlApiAccessInfo.globalCallBackTeleconfSiteEnabled) {
              updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
                "                <use:teleConfCallOutInternational>{{globalCallBackTeleconf}}</use:teleConfCallOutInternational>" + "\n";
            }
          }

          if (xmlApiAccessInfo.otherTelephonySiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:otherTelephony>{{otherTelephony}}</use:otherTelephony>" + "\n";
          }

          if (xmlApiAccessInfo.integratedVoIPSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:voiceOverIp>{{integratedVoIP}}</use:voiceOverIp>" + "\n";
          }

          if (xmlApiAccessInfo.isEnablePMRSiteEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:isEnablePMR>{{isEnablePMR}}</use:isEnablePMR>" + "\n";
          }

          if (xmlApiAccessInfo.hiQualVideoSitenEnabled) {
            updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
              "                <use:HQvideo>{{hiQualVideo}}</use:HQvideo>" + "\n";

            if (xmlApiAccessInfo.hiDefVideoSiteEnabled) {
              updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
                "                <use:HDvideo>{{hiDefVideo}}</use:HDvideo>" + "\n";
            }
          }

          updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
            "            </use:privilege>" + "\n";
          // End of use:privilege

          updateUserSettings2XmlMsg = updateUserSettings2XmlMsg +
            "        </bodyContent>" + "\n" +
            "    </body>" + "\n" +
            "</serv:message>" + "\n";

          logMsg = funcName + ": " + "\n" +
            "updateUserSettings2XmlMsg =\n" + updateUserSettings2XmlMsg;
          $log.log(logMsg);

          var xmlRequest = $interpolate(updateUserSettings2XmlMsg)(xmlApiAccessInfo);

          return $q(
            function (resolve, reject) {
              _self.sendXMLApiReq(
                xmlApiAccessInfo.xmlApiUrl,
                xmlRequest,
                resolve,
                reject
              );
            }
          );
        }, // updateUserSettings2()

        getSessionTicketInfo: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(xmlApiConstants.sessionTicketRequest)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, //getSessionTicketInfo()

        getSessionTicket: function (wbxSiteUrl) {
          var funcName = "getSessionTicket()";
          var logMsg = "";
          var index = wbxSiteUrl.indexOf(".");
          var wbxSiteName = wbxSiteUrl.slice(0, index);
          var ticketObj = null;
          var deferred = $q.defer();
          var _this = this;
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

            _this.getNewSessionTicket(wbxSiteName, wbxSiteUrl).then(
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
          var funcName = "getNewSessionTicket()";
          var logMsg = "";

          var _this = this;
          var defer = $q.defer();
          var xmlApiUrl = "https://" + wbxSiteUrl + "/WBXService/XMLService";
          var primaryEmail = Authinfo.getPrimaryEmail();

          var xmlApiAccessInfo = {
            xmlApiUrl: xmlApiUrl,
            wbxSiteName: wbxSiteName,
            webexAdminID: primaryEmail,
            accessToken: Storage.get('accessToken')
          };

          this.getSessionTicketInfo(xmlApiAccessInfo).then(
            function getSessionTicketInfoSuccess(result) {
              funcName = "getSessionTicketInfoSuccess()";

              logMsg = funcName + ": " + "\n" + "data=" + result;
              // $log.log(logMsg);

              var JsonData = _this.xml2JsonConvert("Authentication Data", result, "<serv:header", "</serv:message>");
              logMsg = funcName + ".success()" + ": " + "\n" + "JsonData=" + JSON.stringify(JsonData);
              // $log.log(logMsg);
              result = JsonData.body.serv_header.serv_response.serv_result;
              if (result != "SUCCESS") {
                logMsg = funcName + ".error()" + ": " + "\n" + "JsonData=" + JSON.stringify(JsonData) + " , result=" + result;
                // $log.log(logMsg);

                var exceptionId = JsonData.body.serv_header.serv_response.serv_exceptionID;

                defer.reject(exceptionId);
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

              var exceptionId = "";

              defer.reject(exceptionId);
            }); //getSessionTicketInfoError
          logMsg = funcName + " Exiting";
          $log.log(logMsg);
          return defer.promise;
        }, // getNewSessionTicket()

        flushWafCache: function (xmlApiAccessInfo) {
          return $q(function (resolve, reject) {
            var xmlApiUrl = xmlApiAccessInfo.xmlApiUrl;
            var xmlRequest = $interpolate(xmlApiConstants.flushWafCacheRequest)(xmlApiAccessInfo);
            _self.sendXMLApiReq(xmlApiUrl, xmlRequest, resolve, reject);
          });
        }, //getSiteInfo()

        xml2JsonConvert: function (
          commentText,
          xmlData,
          startOfBodyStr,
          endOfBodyStr
        ) {

          var funcName = "xml2JsonConvert()";
          var logMsg = "";

          logMsg = funcName + ": " + commentText + "\n" +
            "startOfBodyStr=" + startOfBodyStr + "\n" +
            "endOfBodyStr=" + endOfBodyStr + "\n" +
            "xmlData=" + "\n" + xmlData;
          // $log.log(logMsg);

          var startOfBodyIndex = (null == startOfBodyStr) ? -1 : xmlData.indexOf(startOfBodyStr);
          var endOfBodyIndex = (null == endOfBodyStr) ? -1 : xmlData.indexOf(endOfBodyStr);

          logMsg = funcName + ": " + commentText + "\n" +
            "startOfBodyIndex=" + startOfBodyIndex + "\n" +
            "endOfBodyIndex=" + endOfBodyIndex;
          // $log.log(logMsg);

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
          }

          xmlApiConstants.replaceSets.forEach(function (replaceSet) {
            bodySliceXml = bodySliceXml.replace(replaceSet.replaceThis, replaceSet.withThis);
          });

          logMsg = funcName + ": " + commentText + "\n" +
            "bodySliceXml=" + "\n" + bodySliceXml;
          // $log.log(logMsg);

          var fullBodyXml = "<body>" + bodySliceXml + "</body>";

          logMsg = funcName + ": " + commentText + "\n" +
            "fullBodyXml=" + "\n" + fullBodyXml;
          // $log.log(logMsg);

          var fullBodyJson = x2js.xml_str2json(fullBodyXml);

          logMsg = funcName + ": " + commentText + "\n" +
            "fullBodyJson=\n" + JSON.stringify(fullBodyJson);
          // $log.log(logMsg);

          return fullBodyJson;
        }, // xml2JsonConvert()
      }; // return
    } //XmlApiFact()
  ]);
})();
