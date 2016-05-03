(function () {
  'use strict';

  angular.module('Core')
    .service('DirSyncService', DirSyncService);

  /* @ngInject */
  function DirSyncService($rootScope, $http, Storage, Config, Log, Auth, Authinfo, UrlConfig) {

    var dirsyncUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/dirsync';

    return {
      getDirSyncDomain: function (callback) {
        $http.get(dirsyncUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Retrieved dirsync status');
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },

      getDirSyncStatus: function (callback) {
        var dirsyncStatusUrl = dirsyncUrl + '/status';

        $http.get(dirsyncStatusUrl)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Retrieved dirsync domain');
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },

      postDomainName: function (domainName, callback) {
        var domainUrl = dirsyncUrl + '/domain';
        var payload = {
          domainName: domainName
        };

        $http.post(domainUrl, payload)
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Created Directory Sync Domain: ' + domainName);
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },

      syncUsers: function (incrSyncInterval, callback) {
        var payload = {
          incrSyncInterval: incrSyncInterval,
          fullSyncEnable: true
        };

        $http({
            method: 'PATCH',
            url: dirsyncUrl,
            data: payload
          })
          .success(function (data, status) {
            data = data || {};
            data.success = true;
            Log.debug('Started Directory Sync');
            callback(data, status);
          })
          .error(function (data, status) {
            data = data || {};
            data.success = false;
            data.status = status;
            callback(data, status);
          });
      },
    };
  }
})();
