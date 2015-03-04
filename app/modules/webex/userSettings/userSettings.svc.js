(function () {
  'use strict';
  angular.module('WebExUserSettings').factory('WebExUserSettingsSvc', ['$q', 'WebExUserSettingsXmlSvc', function ($q, WebExUserSettingsXmlSvc) {
    return {
      loadUserSettingsInfo: function () {
        $q.all([]);

        var p1 = WebExUserSettingsXmlSvc.loadUserInfo();
        var p2 = WebExUserSettingsXmlSvc.loadSiteInfo();
        var p3 = WebExUserSettingsXmlSvc.loadMeetingTypeInfo();

        return $q.all([p1, p2, p3]);
      }, // loadUserSettingsInfo()

      xml2JsonConvert: function (commentText, xmlDataText, startOfBodyStr, endOfBodyStr) {
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
      }, // xml2JsonConvert()
    }; // return
  }]); //WebExUserSettingsSvc
})();
