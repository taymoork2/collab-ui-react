(function () {
  'use strict';

  angular.module('Core')
    .service('PartnerService', PartnerService);

  /* @ngInject */
  function PartnerService($http, $rootScope, Config, Log, Authinfo, Auth) {

    var trialsUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/trials';
    var managedOrgsUrl = Config.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId() + '/managedOrgs';

    var factory = {
      getTrialsList: getTrialsList,
      getManagedOrgsList: getManagedOrgsList
    };

    return factory;

    function getTrialsList(callback) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
      $http.get(trialsUrl)
        .success(function (data, status) {
          data.success = true;
          Log.debug('Retrieved trials list');
          callback(data, status);
        })
        .error(function (data, status) {
          data.success = false;
          data.status = status;
          callback(data, status);
          Auth.handleStatus(status);
        });
    }

    function getManagedOrgsList(callback) {
      $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
      $http.get(managedOrgsUrl)
        .success(function (data, status) {
          data.success = true;
          Log.debug('Retrieved managed orgs list');
          callback(data, status);
        })
        .error(function (data, status) {
          data.success = false;
          data.status = status;
          callback(data, status);
          Auth.handleStatus(status);
        });
    }
  }
})();
