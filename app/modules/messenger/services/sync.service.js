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

    // Flag to notify when to fetch status from Msgr-Admin-Service
    //  - first time a user/client requests info from this service
    //  - when explicitly requested by a user/client
    var shouldFetch = true;

    // Internal data
    var syncStatus = {
      messengerOrgName: 'Unknown',
      messengerOrgId: 'Unknown',
      linkDate: 'Unknown',
      isAuthRedirect: false,
      syncMode: syncModes.messenger.off
    };

    var msgrService = {
      protocol: 'http://',
      // Ned's IPs
      //host: '10.129.24.45',
      //host: '192.168.0.6',
      host: 'localhost',

      // Default
      //host: '127.0.0.1',
      port: 8080,
      api: '/admin-service/messenger/admin/api/v1/orgs/' + Authinfo.getOrgId() + '/cisync/'
      //api: '/admin-service/messenger/admin/api/v1/orgs/2d23d582-5830-4bab-9d98-3e428d790e58/cisync/'
    };

    var serviceUrl = msgrService.protocol + msgrService.host + ':' + msgrService.port + msgrService.api;

    var service = {
      getSyncStatus: getSyncStatus,
      isDirSync: isDirSync,
      isMessengerSync: isMessengerSync,
      isSyncing: isSyncing,
      patchSync: patchSync,
      refreshSyncStatus: function () {
        shouldFetch = true;
        return getSyncStatus();
      },
      setDirSyncMode: setDirSyncMode,
      setMessengerSyncMode: setMessengerSyncMode
    };

    // Return the service
    return service;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    // Private fetch to service
    function fetchSyncStatus() {
      return $http.get(serviceUrl).then(function (response) {
        shouldFetch = false;
        return setSyncStatus(response.data);
      }, function (error) {
        return 'SyncService::fetchSyncStatus(): Failed fetching CI Sync status from service. Status ' + error.status + '; ' + error.config.method + ' \'' + error.config.url + '\'';
      });
    }

    function setSyncStatus(status) {
      syncStatus.messengerOrgId = status.orgID;
      syncStatus.messengerOrgName = status.orgName;
      syncStatus.linkDate = status.linkDate;
      syncStatus.isAuthRedirect = status.authRedirect;
      syncStatus.syncMode = parseSyncMode(status.ciSyncMode);

      return syncStatus;
    }

    function getSimplifiedStatus(status) {
      return {
        messengerOrgName: syncStatus.messengerOrgName,
        messengerOrgId: syncStatus.messengerOrgId,
        linkDate: syncStatus.linkDate,
        isAuthRedirect: syncStatus.isAuthRedirect,
        isSyncing: isSyncing()
      };
    }

    function getSyncStatus() {
      var defer = $q.defer();

      if (shouldFetch) {
        fetchSyncStatus()
          .then(function (status) {
            defer.resolve(getSimplifiedStatus(syncStatus));
          }, function (errorMsg) {
            defer.reject('Error getting CI Sync status: ' + errorMsg);
          });
      } else {
        defer.resolve(getSimplifiedStatus(syncStatus));
      }

      return defer.promise;
    }

    function isDirSync() {
      return (syncModes.dirsync.on === syncStatus.syncMode || syncModes.dirsync.off === syncStatus.syncMode);
    }

    function isMessengerSync() {
      return (syncModes.messenger.on === syncStatus.syncMode || syncModes.messenger.off === syncStatus.syncMode);
    }

    function isSyncing() {
      return (syncModes.messenger.on === syncStatus.syncMode || syncModes.dirsync.on === syncStatus.syncMode);
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
      syncStatus.syncMode = (isEnabled) ? syncModes.dirsync.on : syncModes.dirsync.off;
    }

    function setMessengerSyncMode(isEnabled) {
      syncStatus.syncMode = (isEnabled) ? syncModes.messenger.on : syncModes.messenger.off;
    }

    function patchSync(isSyncing, isAuthRedirect) {
      var defer = $q.defer();

      // Update sync mode
      if (isDirSync()) {
        setDirSyncMode(isSyncing);
      } else {
        setMessengerSyncMode(isSyncing);
      }

      var params = {
        ciSyncMode: syncStatus.syncMode.text,
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
