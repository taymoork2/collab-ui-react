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

      var constants = {
        xmlServerURL: "http://172.24.93.53/xml9.0.0/XMLService",
      }; // constants

      this.getXMLApi = function (xmlRequest, resolve, reject) {
        $http({
          url: constants.xmlServerURL,
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
          var xmlApiRequest =
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

          return $q(function (resolve, reject) {
            var xmlRequest = $interpolate(xmlApiRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlRequest, resolve, reject);
          });
        }, //getSiteInfo()

        getUserInfo: function (xmlApiAccessInfo) {
          var xmlApiRequest =
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

          return $q(function (resolve, reject) {
            var xmlRequest = $interpolate(xmlApiRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlRequest, resolve, reject);
          });
        }, //getUserInfo()

        getMeetingTypeInfo: function (xmlApiAccessInfo) {
          var xmlApiRequest =
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

          return $q(function (resolve, reject) {
            var xmlRequest = $interpolate(xmlApiRequest)(xmlApiAccessInfo);
            _self.getXMLApi(xmlRequest, resolve, reject);
          });
        }, //getMeetingTypeInfo()
      }; // return
    } //WebExUserSettingsSvc()
  ]);
})();
