(function () {
  'use strict';

  angular.module('Core')
    .service('GroupService', GroupService);

  /* @ngInject */
  function GroupService($http, $rootScope, $location, Storage, UrlConfig, Log, Authinfo, Auth) {

    var groupssUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/groups';

    return {

      getGroupList: function (callback) {

        $http.get(groupssUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Retrieved group list');
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            callback(data, status);
          });
      }

    };
  }
})();
