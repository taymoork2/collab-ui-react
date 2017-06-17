(function () {
  'use strict';

  angular.module('Core')
    .service('DirSyncServiceOld', DirSyncServiceOld);

  /* @ngInject */
  function DirSyncServiceOld($http, Log, Authinfo, UrlConfig) {
    var dirsyncUrl = UrlConfig.getAdminServiceUrl() + 'organization/' + Authinfo.getOrgId() + '/dirsync';

    return {
      getDirSyncDomain: function (callback) {
        $http.get(dirsyncUrl)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            Log.debug('Retrieved dirsync status');
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      },

      getDirSyncStatus: function (callback) {
        var dirsyncStatusUrl = dirsyncUrl + '/status';

        $http.get(dirsyncStatusUrl)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            Log.debug('Retrieved dirsync domain');
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      },

      postDomainName: function (domainName, callback) {
        var domainUrl = dirsyncUrl + '/domain';
        var payload = {
          domainName: domainName,
        };

        $http.post(domainUrl, payload)
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            Log.debug('Created Directory Sync Domain: ' + domainName);
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      },

      syncUsers: function (incrSyncInterval, callback) {
        var payload = {
          incrSyncInterval: incrSyncInterval,
          fullSyncEnable: true,
        };

        $http({
          method: 'PATCH',
          url: dirsyncUrl,
          data: payload,
        })
          .then(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = true;
            Log.debug('Started Directory Sync');
            callback(data, response.status);
          })
          .catch(function (response) {
            var data = response.data;
            data = _.isObject(data) ? data : {};
            data.success = false;
            data.status = response.status;
            callback(data, response.status);
          });
      },
    };
  }
})();
