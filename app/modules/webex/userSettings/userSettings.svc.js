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
      return {
        loadUserSettingsInfo: function () {
          $q.all([]);

          var userInfoXml = XmlApiSvc.loadUserInfo();
          var siteInfoXml = XmlApiSvc.loadSiteInfo();
          var meetingTypeXml = XmlApiSvc.loadMeetingTypeInfo();

          return $q.all([userInfoXml, siteInfoXml, meetingTypeXml]);
        }, // loadUserSettingsInfo()

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
          $log.log(logMsg);

          var x2js = new X2JS();
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
