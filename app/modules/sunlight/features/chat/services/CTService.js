(function () {
  'use strict';

  /* global Uint8Array:false */

  angular
    .module('Sunlight')
    .service('CTService', CTService);

  /* @ngInject */
  function CTService($http, Authinfo, BrandService, UrlConfig) {
    var service = {
      getLogo: getLogo,
      generateCodeSnippet: generateCodeSnippet
    };
    return service;

    function getLogo() {
      return BrandService.getLogoUrl(Authinfo.getOrgId()).then(function (logoUrl) {
        return $http.get(logoUrl, {
          responseType: "arraybuffer"
        });
      });
    }

    function generateCodeSnippet(templateId) {
      var appName = UrlConfig.getSunlightBubbleUrl();
      var orgId = Authinfo.getOrgId();
      return "<script>(function(document, script) {" +
        "var bubbleScript = document.createElement(script);" +
        "e = document.getElementsByTagName(script)[0];" +
        "bubbleScript.async = true;" +
        "bubbleScript.CiscoAppId =  'cisco-chat-bubble-app';" +
        "bubbleScript.DC = 'rciad.ciscoccservice.com';" +
        "bubbleScript.orgId = '" + orgId + "';" +
        "bubbleScript.templateId = '" + templateId + "';" +
        "bubbleScript.src = '" + appName + "/bubble.js';" +
        "bubbleScript.type = \"text/javascript\";" +
        "bubbleScript.setAttribute(\"charset\", \"utf-8\");" +
        "e.parentNode.insertBefore(bubbleScript, e);" +
        "})(document, \"script\");         </script>";
    }
  }
})();
