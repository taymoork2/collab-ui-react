(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('SyncService', SyncService);

  /** @ngInject */
  function SyncService($http, $q, $translate, Authinfo, Log) {
    // Interface ---------------------------------------------------------------

    // Internal data
    var translatePrefix = 'messengerCiSync.';

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

      // TODO: remove when production is up
      //host: '10.129.24.45',
      //host: '192.168.0.6',
      //host: 'localhost',
      //host: 'gspbt1adm001.webex.com',

      // Default
      host: '127.0.0.1',
      port: 8080,

      // TODO: cleanup when production is up
      api: '/admin-service/messenger/admin/api/v1/orgs/' + Authinfo.getOrgId() + '/cisync/'
        //api: '/admin-service/messenger/admin/api/v1/orgs/2d23d582-5830-4bab-9d98-3e428d790e58/cisync'
        //api: '/admin-service/messenger/admin/api/v1/orgs/e805fc73-ad2b-4cef-9ea1-70f070db96a2/cisync/'
        //api: '/admin-service/messenger/admin/api/v1/orgs/47a4ef6b-f6d0-4c5d-8ffd-9d6a8c94738c/cisync/'
        //api: '/admin-service/messenger/admin/api/v1/orgs/7c63761c-4d85-4daf-b241-aa63c192ec64/cisync/'
        //api: '/admin-service/messenger/admin/api/v1/orgs/2d446615-164b-4d81-b1a2-7bddb64279bb/cisync/'
    };

    var serviceUrl = msgrService.protocol + msgrService.host + ':' + msgrService.port + msgrService.api;

    var service = {
      getSyncStatus: getSyncStatus,
      isDirSync: isDirSync,
      isMessengerSync: isMessengerSync,
      isSyncEnabled: isSyncEnabled,
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
      var defer = $q.defer();

      $http.get(serviceUrl)
        .then(function (response) {
          shouldFetch = false;
          defer.resolve(setSyncStatus(response.data));
        }, function (response) {
          var status = parseHttpStatus(response.status);

          var baseError = 'GET: ' + status;
          var fullError = baseError;

          // TODO: remove excessive checking once Msgr Admin Service returns consistent errors
          if (response.data && response.data.error && response.data.error.message) {
            fullError += '; Message: ' + response.data.error.message;
          }

          Log.error('SyncService::fetchSyncStatus(): ' + fullError);

          defer.reject({
            status: status,
            message: fullError
          });
        });

      return defer.promise;
    }

    function parseHttpStatus(status) {
      var result = '';

      // Normalize edge cases for parsing
      if (status < 100) {
        status = 0;
      }

      switch (status) {
      case 0:
        result = $translate.instant(translatePrefix + 'http0');
        break;
      case 401:
        result = $translate.instant(translatePrefix + 'http401');
        break;
      case 404:
        result = $translate.instant(translatePrefix + 'http404');
        break;
      case 500:
        result = $translate.instant(translatePrefix + 'http500');
        break;
      default:
        result = $translate.instant(translatePrefix + 'httpUnknown');
        break;
      }

      return result;
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
        isSyncEnabled: isSyncEnabled()
      };
    }

    function getSyncStatus() {
      var defer = $q.defer();

      if (shouldFetch) {
        fetchSyncStatus()
          .then(function (status) {
            defer.resolve(getSimplifiedStatus(syncStatus));
          }, function (errorObj) {
            defer.reject(errorObj);
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

    function isSyncEnabled() {
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
        Log.error('SyncService::parseSyncMode(): Invalid sync mode \'' + syncString + '\'. Setting to Messenger Sync Mode OFF.');
      }

      return syncMode;
    }

    function setDirSyncMode(isEnabled) {
      syncStatus.syncMode = (isEnabled) ? syncModes.dirsync.on : syncModes.dirsync.off;
    }

    function setMessengerSyncMode(isEnabled) {
      syncStatus.syncMode = (isEnabled) ? syncModes.messenger.on : syncModes.messenger.off;
    }

    function patchSync(isSyncEnabled, isAuthRedirect) {
      var defer = $q.defer();

      // Deep copy to prevent only reference copy
      var previousSettings = JSON.parse(JSON.stringify(syncStatus));

      // Update sync mode
      if (isDirSync()) {
        setDirSyncMode(isSyncEnabled);
      } else {
        setMessengerSyncMode(isSyncEnabled);
      }

      syncStatus.isAuthRedirect = isAuthRedirect;

      var params = {
        ciSyncMode: syncStatus.syncMode.text,
        authRedirect: syncStatus.isAuthRedirect
      };

      $http.patch(serviceUrl, params).then(function (response) {
        defer.resolve('PATCH Status ' + response.status);
      }, function (response) {
        var status = parseHttpStatus(response.status);

        var baseError = 'PATCH: ' + status;
        var fullError = baseError;

        // TODO: remove excessive checking once Msgr Admin Service returns consistent errors
        if (response.data && response.data.error && response.data.error.message) {
          fullError += '; Message: ' + response.data.error.message;
        }

        Log.error('SyncService::patchSync(): ' + fullError);

        // Reset to previous settings
        syncStatus = JSON.parse(JSON.stringify(previousSettings));

        defer.reject({
          status: status,
          message: fullError
        });
      });

      return defer.promise;
    }
  }
})();
