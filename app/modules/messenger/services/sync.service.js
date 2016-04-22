(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('SyncService', SyncService);

  /** @ngInject */
  function SyncService($http, $q, $translate, Config, Authinfo, Log, UrlConfig) {
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

    var serviceUrl = UrlConfig.getMessengerServiceUrl() + '/orgs/' + Authinfo.getOrgId() + '/cisync/';

    var service = {
      getSyncStatus: getSyncStatus,
      isDirSync: isDirSync,
      isDirSyncEnabled: isDirSyncEnabled,
      isMessengerSync: isMessengerSync,
      isMessengerSyncEnabled: isMessengerSyncEnabled,
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
    // Can be time-expensive, so try to limit calls
    function fetchSyncStatus() {
      var defer = $q.defer();

      $http.get(serviceUrl)
        .then(function (response) {
          shouldFetch = false;
          defer.resolve(setSyncStatus(response.data));
        }, function (response) {
          var error = parseHttpErrorResponse('GET', response);
          Log.error('SyncService::fetchSyncStatus(): ' + error);

          defer.reject({
            status: response.status,
            message: error
          });
        });

      return defer.promise;
    }

    function parseHttpErrorResponse(method, response) {
      var status = parseHttpStatus(response.status);
      var error = method + ': ' + status;

      // Filter odd status' like -1, 0, etc.
      // If service returned an error, just use that
      if (response.status >= 100) {
        // Get message, based on differing formats for Tomcat/Spring and/or Msgr Admin Service
        if (response.data.message) {
          error = response.data.error;
        } else if (response.data.error.message) {
          error = response.data.error.message;
        }
      }

      return error;
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
        isSyncEnabled: isSyncEnabledRaw(),
        isMessengerSyncRawMode: isMessengerSyncRaw()
      };
    }

    // Since fetchSyncStatus() can be time-expensive,
    // cache result. Generally, only fetch on initialization,
    // and during an explicit Refresh request by the user
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

    function isDirSyncRaw() {
      return (syncModes.dirsync.on === syncStatus.syncMode || syncModes.dirsync.off === syncStatus.syncMode);
    }

    function isDirSync() {
      var defer = $q.defer();

      getSyncStatus()
        .then(function () {
          defer.resolve(isDirSyncRaw());
        }, function (errorObj) {
          defer.reject(errorObj.message);
        });

      return defer.promise;
    }

    function isDirSyncEnabled() {
      var defer = $q.defer();

      getSyncStatus()
        .then(function () {
          defer.resolve(isDirSync() && isSyncEnabled());
        }, function (errorObj) {
          defer.reject(errorObj.message);
        });

      return defer.promise;
    }

    function isMessengerSync() {
      var defer = $q.defer();

      getSyncStatus()
        .then(function () {
          defer.resolve(isMessengerSyncRaw());
        }, function (errorObj) {
          defer.reject(errorObj.message);
        });

      return defer.promise;
    }

    function isMessengerSyncRaw() {
      return (syncModes.messenger.on === syncStatus.syncMode || syncModes.messenger.off === syncStatus.syncMode);
    }

    function isMessengerSyncEnabled() {

      var defer = $q.defer();

      // This function is called by core/wizard about inviting users w/o checking entitlement
      // Will check webex-messenger here to prevent unnecessary call to msgr admin service.
      if (!Authinfo.isEntitled(Config.entitlements.messenger)) {
        Log.info('isMessengerSyncEnabled: The Org is not Messenger migrated one, return false.');
        defer.resolve(false);
      } else {
        Log.info('isMessengerSyncEnabled: The Org is Messenger migrated one, call Messenger admin service to check');

        getSyncStatus()
          .then(function () {
            defer.resolve(isMessengerSyncRaw() && isSyncEnabledRaw());
          }, function (errorObj) {
            defer.reject(errorObj.message);
          });
      }

      return defer.promise;
    }

    function isSyncEnabled() {
      var defer = $q.defer();

      getSyncStatus()
        .then(function () {
          defer.resolve(isSyncEnabledRaw());
        }, function (errorObj) {
          defer.reject(errorObj.message);
        });

      return defer.promise;
    }

    function isSyncEnabledRaw() {
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
      var previousSettings = _.clone(syncStatus);

      // Update sync mode
      if (isDirSyncRaw()) {
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
        var error = parseHttpErrorResponse('PATCH', response);
        Log.error('SyncService::patchSync(): ' + error);

        // Reset to previous settings
        syncStatus = previousSettings;

        defer.reject({
          status: response.status,
          message: error
        });
      });

      return defer.promise;
    }
  }
})();
