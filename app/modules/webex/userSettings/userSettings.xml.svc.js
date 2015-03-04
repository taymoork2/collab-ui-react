(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('WebExUserSettingsXmlSvc', ['$http', '$interpolate', '$q',
    function ($http, $interpolate, $q) {
      this.getXMLApi = function (xmlServerURL, xmlRequest, resolve, reject) {
        $http({
            url: xmlServerURL,
            method: "POST",
            data: xmlRequest,
            headers: {
              'Content-Type': 'application/x-www-rform-urlencoded'
            }
          })
          .success(function (data) {
            resolve(data);
          })
          .error(function (data) {
            reject(data);
          });
      }; //getXMLApi()

      /*----------------------------------------------------------------------*/

      var _self = this;
      this.xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";

      return {
        loadSiteInfo: function () {
          return $q(function (resolve, reject) {
            var requestParameters = {
              webexAdminID: "jpallapa",
              webexAdminPswd: "C!sco123",
              siteID: "4272",
              PartnerID: "4272"
            };
            var xmlRequest = $interpolate(getSiteInfoXMLRequest)(requestParameters);
            _self.getXMLApi(_self.xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //loadSiteInfo()

        loadUserInfo: function () {
          return $q(function (resolve, reject) {
            var requestParameters = {
              webexAdminID: "jpallapa",
              webexAdminPswd: "C!sco123",
              siteID: "4272",
              PartnerID: "4272",
              webexUserId: "jpallapa"
            };
            var xmlRequest = $interpolate(getUserInfoXMLRequest)(requestParameters);
            _self.getXMLApi(_self.xmlServerURL, xmlRequest, resolve, reject);
          });
        }, //loadUserInfo()

        loadMeetingTypeInfo: function (resolve, reject) {
            return $q(function (resolve, reject) {
              var requestParameters = {
                webexAdminID: "jpallapa",
                webexAdminPswd: "C!sco123",
                siteID: "4272",
                PartnerID: "4272"
              };
              var xmlRequest = $interpolate(getMeetingTypeInfoXMLRequest)(requestParameters);
              _self.getXMLApi(_self.xmlServerURL, xmlRequest, resolve, reject);
            });
          } //loadMeetingTypeInfo()
      }; // return
    } //WebExUserSettingsSvc()
  ]);
})();
