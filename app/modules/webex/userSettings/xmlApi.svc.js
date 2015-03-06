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
      var x2js = new X2JS();
      var xmlServerURL = "http://172.24.93.53/xml9.0.0/XMLService";

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

        xml2JsonConvert: function (commentText, xmlDataText, startOfBodyStr, endOfBodyStr) {
          var funcName = "xml2JsonConvert()";
          var logMsg = "";

          logMsg = funcName + ": " + commentText + "\n" + "startOfBodyStr=" + startOfBodyStr + "\n" + "endOfBodyStr=" + endOfBodyStr;
          $log.log(logMsg);
          // alert(logMsg);

          var startOfBodyIndex = xmlDataText.indexOf(startOfBodyStr);
          var endOfBodyIndex = (null == endOfBodyStr) ? 0 : xmlDataText.indexOf(endOfBodyStr);

          logMsg = funcName + ": " + commentText + "\n" + "startOfBodyIndex=" + startOfBodyIndex + "\n" + "endOfBodyIndex=" + endOfBodyIndex;
          $log.log(logMsg);
          // alert(logMsg);

          var bodySlice = (startOfBodyIndex < endOfBodyIndex) ? xmlDataText.slice(startOfBodyIndex, endOfBodyIndex) : xmlDataText.slice(startOfBodyIndex);
          constants.replaceSets.forEach(function (replaceSet) {
            bodySlice = bodySlice.replace(replaceSet.replaceThis, replaceSet.withThis);
          });

          bodySlice = "<body>" + bodySlice + "</body>";

          logMsg = funcName + ": " + commentText + "\n" + "bodySlice=\n" + bodySlice;
          $log.log(logMsg);
          // alert(logMsg);

          var bodyJson = x2js.xml_str2json(bodySlice);

          logMsg = funcName + ": " + commentText + "\n" + "bodyJson=\n" + JSON.stringify(bodyJson);
          $log.log(logMsg);
          // alert(logMsg);

          return bodyJson;
        }, // xml2JsonConvert()
      }; // return
    } //WebExUserSettingsSvc()
  ]);
})();
