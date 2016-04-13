(function () {
  'use strict';

  angular
    .module("Hercules")
    .service("RedirectTargetService", RedirectTargetService);

  /* @ngInject */
  function RedirectTargetService($http, Authinfo, UrlConfig) {
    return {
      addRedirectTarget: function (hostName) {
        var url = UrlConfig.getHerculesUrl() + "/organizations/" + Authinfo.getOrgId() + "/allowedRedirectTargets";
        var body = {
          hostname: hostName,
          ttlInSeconds: 60 * 60
        };
        return $http.post(url, body);
      }
    };
  }
}());
