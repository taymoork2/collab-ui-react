(function () {
  'use strict';

  angular.module('Squared')
    .service('csadminservice', CsadminService);

  /* @ngInject */
  function CsadminService($http, UrlConfig, Authinfo) {
    var csadminUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/users/csadmin';

    var service = {
      csadminUrl: csadminUrl,
      setCsAdmin: setCsAdmin,
    };

    return service;

    function setCsAdmin(encryptedParam, callback) {
      var csadminData = {
        encryptedQueryString: encryptedParam,
      };
      $http.post(csadminUrl, csadminData)
        .then(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = true;
          callback(data, response.status);
        })
        .catch(function (response) {
          var data = response.data;
          data = _.isObject(data) ? data : {};
          data.success = false;
          data.status = response.status;
          callback(data, response.status);
        });
    }
  }
})();
