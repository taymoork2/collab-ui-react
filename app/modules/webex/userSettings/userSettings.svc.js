(function () {
  'use strict';

  angular.module('WebExUserSettings').factory('WebExUserSettingsSvc', [
    '$q',
    '$log',
    'XmlApiSvc',
    function (
      $q,
      $log,
      XmlApiSvc
    ) {
      var _self = this;
      var x2js = new X2JS();

      var constants = {
        replaceSets: [
          [/<ns1:/g, "<ns1_"],
          [/<\/ns1:/g, "</ns1_"],
          [/<serv:/g, "<serv_"],
          [/<\/serv:/g, "</serv_"],
          [/<use:/g, "<use_"],
          [/<\/use:/g, "</use_"],
          [/<com:/g, "<com_"],
          [/<\/com:/g, "</com_"],
          [/<mtgtype:/g, "<mtgtype_"],
          [/<\/mtgtype:/g, "</mtgtype_"]
        ]
      };

      return {
        getUserInfo: function (xmlApiAccessInfo) {
          $q.all();

          var xmlData = XmlApiSvc.getUserInfo(xmlApiAccessInfo);

          return $q.all(xmlData);
        }, // getUserInfo()

        getSiteInfo: function (xmlApiAccessInfo) {
          $q.all();

          var xmlData = XmlApiSvc.getSiteInfo(xmlApiAccessInfo);

          return $q.all(xmlData);
        }, // getSiteInfo()

        getMeetingTypeInfo: function (xmlApiAccessInfo) {
          $q.all();

          var xmlData = XmlApiSvc.getMeetingTypeInfo(xmlApiAccessInfo);

          return $q.all(xmlData);
        }, // getMeetingTypeInfo()

        getUserSettingsInfo: function (xmlApiAccessInfo) {
          $q.all([]);

          var userInfoXml = XmlApiSvc.getUserInfo(xmlApiAccessInfo);
          var siteInfoXml = XmlApiSvc.getSiteInfo(xmlApiAccessInfo);
          var meetingTypeXml = XmlApiSvc.getMeetingTypeInfo(xmlApiAccessInfo);;

          return $q.all([userInfoXml, siteInfoXml, meetingTypeXml]);
        }, // getUserSettingsInfo()

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
            var replaceThis = replaceSet[0];
            var withThis = replaceSet[1];

            bodySlice = bodySlice.replace(replaceThis, withThis);
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
    } //WebExUserSettingsSvc
  ]);
})();
