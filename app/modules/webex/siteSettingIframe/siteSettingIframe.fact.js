(function () {
  'use strict';

  angular.module('WebExSiteSettingIframe').factory('WebExSiteSettingIframeFact', [
    '$q',
    '$log',
    '$stateParams',
    '$translate',
    '$filter',
    '$window',
    'Authinfo',
    'WebExUtilsFact',
    'WebExXmlApiFact',
    'WebExXmlApiInfoSvc',
    'WebExSiteSettingIframeSvc',
    'Notification',
    function (
      $q,
      $log,
      $stateParams,
      $translate,
      $filter,
      $window,
      Authinfo,
      WebExUtilsFact,
      WebExXmlApiFact,
      webExXmlApiInfoObj,
      webExSiteSettingIframeObj,
      Notification
    ) {
      return {
        getSiteSettingIframeObj: function () {
          return webExSiteSettingIframeObj;
        }, // getSiteSettingIframeObj()

        initSiteSettingIframeObj: function () {
          webExSiteSettingIframeObj.siteUrl = $stateParams.siteUrl;
          webExSiteSettingIframeObj.settingPageIframeUrl = $stateParams.settingPageIframeUrl;

          webExSiteSettingIframeObj.viewReady = true;

          return webExSiteSettingIframeObj;
        }, // initSiteSettingIframeObj()

        /*
        receiveMessage: function (event) {
          $log.log("Message from iFrame: " + event.data + ", from: " + event.origin);
          var e = document.getElementById("thirdPartyCookies");
          e.innerHTML = event.data;
        }, // receiveMessage()

        addEventListener: function () {
          $window.addEventListener('message', this.receiveMessage);
        }, // addEventListener()
        */

        loadIframe: function () {
          var _this = this;

          getSessionTicket().then(
            function getSessionTicketSuccess(sessionTicket) {
              var funcName = "getSessionTicketSuccess()";
              var logMsg = "";

              webExSiteSettingIframeObj.viewReady = true;

              var adminEmailParam = Authinfo.getPrimaryEmail();
              var localeParam = ("es_LA" == $translate.use()) ? "es_MX" : $translate.use();
              var iframeUrl = "https://" + $stateParams.siteUrl + $stateParams.settingPageIframeUrl;

              postSubmit(
                iframeUrl,
                sessionTicket,
                localeParam
              );
            }, // getSessionTicketSuccess()

            function getSessionTicketError(errId) {
              var funcName = "getSessionTicketError()";
              var logMsg = "";

              logMsg = funcName + ": " +
                "errId=" + errId;
              $log.log(logMsg);
            } // getSessionTicketError()
          ); // getSessionTicket().then()

          function getSessionTicket() {
            return WebExXmlApiFact.getSessionTicket($stateParams.siteUrl);
          } // getSessionTicket()

          function postSubmit(postUrl, accessToken, locale) {
            var wbxform = document.createElement("FORM");

            document.body.appendChild(wbxform);

            wbxform.method = "POST";
            wbxform.action = postUrl;
            wbxform.target = "siteSettingIframe";

            var adminEmailEle = document.createElement("INPUT");
            adminEmailEle.setAttribute("name", "adminEmail");
            adminEmailEle.setAttribute("type", "hidden");
            adminEmailEle.value = Authinfo.getPrimaryEmail();
            wbxform.appendChild(adminEmailEle);

            var userEmailEle = document.createElement("INPUT");
            userEmailEle.setAttribute("name", "userEmail");
            userEmailEle.setAttribute("type", "hidden");
            userEmailEle.value = Authinfo.getPrimaryEmail();
            wbxform.appendChild(userEmailEle);

            var localeEle = document.createElement("INPUT");
            localeEle.setAttribute("name", "locale");
            localeEle.setAttribute("type", "hidden");
            localeEle.value = locale;
            wbxform.appendChild(localeEle);

            wbxform.submit();
          } // postSubmit()
        }, // loadIframe()
      }; // return
    } // function()
  ]);
})();
