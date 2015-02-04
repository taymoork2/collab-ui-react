'use strict';

angular.module('Core')
  .service('DirSyncService', ['$rootScope', '$http', 'Storage', 'Config', 'Log', 'Auth', 'Authinfo',
    function ($rootScope, $http, Storage, Config, Log, Auth, Authinfo) {

      var dirsyncUrl = Config.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/dirsync';

      return {
        getDirSyncDomain: function (callback) {

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(dirsyncUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved dirsync status');
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },

        getDirSyncStatus: function (callback) {
          var dirsyncStatusUrl = dirsyncUrl + '/status';

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.get(dirsyncStatusUrl)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Retrieved dirsync domain');
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
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

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http.post(domainUrl, payload)
            .success(function (data, status) {
              data.success = true;
              Log.debug('Created Directory Sync Domain: ' + domainName);
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
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

          $http.defaults.headers.common.Authorization = 'Bearer ' + $rootScope.token;
          $http({
              method: 'PATCH',
              url: dirsyncUrl,
              data: payload
            })
            .success(function (data, status) {
              data.success = true;
              Log.debug('Started Directory Sync');
              callback(data, status);
            })
            .error(function (data, status) {
              Auth.handleStatus(status);
              data.success = false;
              data.status = status;
              callback(data, status);
            });
        },
      };
    }
  ]);
