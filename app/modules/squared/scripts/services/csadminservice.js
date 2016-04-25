(function() {
  'use strict';

  angular.module('Squared')
    .service('csadminservice', CsadminService);

  /* @ngInject */
  function CsadminService($rootScope, $http, Storage, UrlConfig, Log, Auth, Authinfo) {
    var csadminUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/csadmin';

    var service = {
      csadminUrl: csadminUrl,
      setCsAdmin: setCsAdmin
    };

    return service;

    function setCsAdmin(encryptedParam, callback) {
      var csadminData = {
        'encryptedQueryString': encryptedParam
      };
      $http.post(csadminUrl, csadminData)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
        });
    }
  }
})();