(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('SyncService', SyncService);

  /** @ngInject */
  function SyncService($http, $q, Authinfo) {
    // Interface ---------------------------------------------------------------

    // Internal data
    var syncModes = Object.freeze({
      messenger: {
        on: {
          text: 'enabled'
        },
        off: {
          text: 'disabled'
        }
      },
      dirsync: {
        on: {
          text: 'link_enabled'
        },
        off: {
          text: 'link_disabled'
        }
      }
    });

    var msgrService = {
      protocol: 'http://',
      // Ned's IPs
      host: '10.129.24.45',

      // Default
      //host: '127.0.0.1',
      port: 8080,
      api: '/messenger/admin/api/v1/orgs/' + Authinfo.getOrgId() + '/cisync/'
    };

    var serviceUrl = msgrService.protocol + msgrService.host + ':' + msgrService.port + msgrService.api;

    var service = {
      getSyncStatus: getSyncStatus,
      isDirSync: isDirSync,
      isMessengerSync: isMessengerSync,
      isSyncing: isSyncing,
      setDirSyncMode: setDirSyncMode,
      setMessengerSyncMode: setMessengerSyncMode,
      syncMode: syncModes.messenger.off,
      updateSync: updateSync
    };

    // Return the service
    return service;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function getSyncStatus() {
      var defer = $q.defer();

      $http.get(serviceUrl)
        .success(function (data, status, headers, config) {
          service.syncMode = parseSyncMode(data.ciSyncMode);
          defer.resolve(data);
        })
        .error(function (data, status, headers, config) {
          var error = 'Failed GET to ' + serviceUrl + '; status ' + status;
          window.console.error(error);
          defer.reject(error);
        });

      return defer.promise;
    }

    function isDirSync() {
      return (syncModes.dirsync.on === service.syncMode || syncModes.dirsync.off === service.syncMode);
    }

    function isMessengerSync() {
      return (syncModes.messenger.on === service.syncMode || syncModes.messenger.off === service.syncMode);
    }

    function isSyncing() {
      return (syncModes.messenger.on === service.syncMode || syncModes.dirsync.on === service.syncMode);
    }

    function parseSyncMode(syncString) {
      var syncMode = syncModes.messenger.off;

      switch (syncString) {
      case syncModes.messenger.off.text:
        syncMode = syncModes.messenger.off;
        break;
      case syncModes.messenger.on.text:
        syncMode = syncModes.messenger.on;
        break;
      case syncModes.dirsync.off.text:
        syncMode = syncModes.dirsync.off;
        break;
      case syncModes.dirsync.on.text:
        syncMode = syncModes.dirsync.on;
        break;
      default:
        window.console.error('SyncService::parseSyncMode(): Invalid sync mode \'' + syncString + '\'. Setting to Messenger Sync Mode OFF.');
      }

      return syncMode;
    }

    function setDirSyncMode(isEnabled) {
      service.syncMode = (isEnabled) ? syncModes.dirsync.on : syncModes.dirsync.off;
    }

    function setMessengerSyncMode(isEnabled) {
      service.syncMode = (isEnabled) ? syncModes.messenger.on : syncModes.messenger.off;
    }

    function updateSync(isSyncing, isAuthRedirect) {
      var defer = $q.defer();

      // Update sync mode
      if (isDirSync()) {
        setDirSyncMode(isSyncing);
      } else {
        setMessengerSyncMode(isSyncing);
      }

      var params = {
        ciSyncMode: service.syncMode.text,
        authRedirect: isAuthRedirect
      };

      $http.patch(serviceUrl, params)
        .success(function (data, status, headers, config) {
          defer.resolve(status);
        })
        .error(function (data, status, headers, config) {
          var error = 'Failed PATCH to ' + serviceUrl + ' with params: ' + JSON.stringify(params) + '; status ' + status;
          window.console.error(error);
          defer.reject(error);
        });

      return defer.promise;
    }
  }
})();
