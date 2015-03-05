(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('XmlApiSvc', [
    '$http',
    '$log',
    '$interpolate',
    '$q',
    function (
      $http,
      $log,
      $interpolate,
      $q
    ) {
      var _self = this;
      var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";

      var xmlRequestParameters = {
        webexAdminID: "jpallapa",
        webexAdminPswd: "C!sco123",
        siteID: "4272",
        PartnerID: "4272",
        webexSessionTicket: null,
        webexUserId: "jpallapa"
      };

      var getUserInfoXMLRequest =
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
        "    <header>" +
        "        <securityContext>" +
        "            <webExID>{{webexAdminID}}</webExID>" +
        "            <password>{{webexAdminPswd}}</password>" +
        "            <siteID>{{siteID}}</siteID>" +
        "            <partnerID>{{partnerID}}</partnerID>" +
        "        </securityContext>" +
        "    </header>" +
        "    <body>" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.user.GetUser\">" +
        "            <webExId>{{webexUserId}}</webExId>" +
        "        </bodyContent>" +
        "    </body>" +
        "</serv:message>";

      var getSiteInfoXMLRequest =
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
        "    <header>" +
        "        <securityContext>" +
        "            <webExID>{{webexAdminID}}</webExID>" +
        "            <password>{{webexAdminPswd}}</password>" +
        "            <siteID>{{siteID}}</siteID>" +
        "            <partnerID>{{partnerID}}</partnerID>" +
        "        </securityContext>" +
        "    </header>" +
        "    <body>" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.site.GetSite\" />" +
        "    </body>" +
        "</serv:message>";

      var getMeetingTypeInfoXMLRequest =
        "<serv:message xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
        "    <header>" +
        "        <securityContext>" +
        "            <webExID>{{webexAdminID}}</webExID>" +
        "            <password>{{webexAdminPswd}}</password>" +
        "            <siteID>{{siteID}}</siteID>" +
        "            <partnerID>{{partnerID}}</partnerID>" +
        "        </securityContext>" +
        "    </header>" +
        "    <body>" +
        "        <bodyContent xsi:type=\"java:com.webex.service.binding.meetingtype.LstMeetingType\" />" +
        "    </body>" +
        "</serv:message>";

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
        loadSiteInfo: function () {
          return $q(function (resolve, reject) {
            var xmlRequest = $interpolate(getSiteInfoXMLRequest)(xmlRequestParameters);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //loadSiteInfo()

        loadUserInfo: function () {
          return $q(function (resolve, reject) {
            var xmlRequest = $interpolate(getUserInfoXMLRequest)(xmlRequestParameters);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //loadUserInfo()

        loadMeetingTypeInfo: function (resolve, reject) {
          return $q(function (resolve, reject) {
            var xmlRequest = $interpolate(getMeetingTypeInfoXMLRequest)(xmlRequestParameters);
            _self.getXMLApi(xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //loadMeetingTypeInfo()
      }; // return
    } //WebExUserSettingsSvc()
  ]);
})();
