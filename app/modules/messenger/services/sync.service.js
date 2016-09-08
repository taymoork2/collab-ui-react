(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('SyncService', SyncService);

  /* @ngInject */
  function SyncService($http, $q, $translate, Config, Authinfo, Log, UrlConfig) {
    // Interface ---------------------------------------------------------------

    // Internal data
    var translatePrefix = 'messengerCiSync.';

    var syncModes = Object.freeze({
      messenger: {
        on: {
          text: 'enabled'
        },
        on_nospark: {
          text: 'enabled_nospark'
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

    var syncStringFromServer = "";
    var isEnabledNoSpark = false; // special handling to make sure we have no spark in any condition

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
      syncMode: syncModes.messenger.off,
      // new data format embedded in ciSyncMode string -- "msgr_to_spark;pwd_sync=1:spark_ent=1:usr_dis=1:usr_del=1:usr_min=0"
      // TODO: clean up when backend fully in new format
      isNewDataFormat: false,
      isPwdSync: true,
      isSparkEnt: true,  // false -- no spark
      isUsrDis: true,
      isUsrMin: false   // true -- DirSync, read only as we don't change DirSync in messenger card
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
      parseSyncMode: parseSyncMode,
      getNewDataFormat: getNewDataFormat,
      getNewDirSyncFlag: getNewDirSyncFlag,
      getSimplifiedStatus: getSimplifiedStatus,
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
      syncStatus.syncMode = parseSyncMode(status.ciSyncMode); // this will parse new format data.

      return syncStatus;
    }

    // this is the object used for controller
    function getSimplifiedStatus() {
      return {
        messengerOrgName: syncStatus.messengerOrgName,
        messengerOrgId: syncStatus.messengerOrgId,
        linkDate: syncStatus.linkDate,
        isAuthRedirect: syncStatus.isAuthRedirect,
        isSyncEnabled: isSyncEnabledRaw(),
        isMessengerSyncRawMode: isMessengerSyncRaw(),
        isNewDataFormat: syncStatus.isNewDataFormat,
        isPwdSync: syncStatus.isPwdSync,
        isSparkEnt: syncStatus.isSparkEnt,
        isUsrDis: syncStatus.isUsrDis
      };
    }

    // Since fetchSyncStatus() can be time-expensive,
    // cache result. Generally, only fetch on initialization,
    // and during an explicit Refresh request by the user
    function getSyncStatus() {
      var defer = $q.defer();

      if (shouldFetch) {
        fetchSyncStatus()
          .then(function () {
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
      if (syncStatus.isNewDataFormat) {
        return syncStatus.isUsrMin;
      }
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
      if (syncStatus.isNewDataFormat) {
        return !syncStatus.isUsrMin;
      }
      return (syncModes.messenger.on === syncStatus.syncMode || syncModes.messenger.off === syncStatus.syncMode || syncModes.messenger.on_nospark === syncStatus.syncMode);
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
      return (syncModes.messenger.on === syncStatus.syncMode || syncModes.dirsync.on === syncStatus.syncMode || syncModes.messenger.on_nospark === syncStatus.syncMode);
    }

    function getNewDataFormat() {
      return syncStatus.isNewDataFormat;
    }

    function getNewDirSyncFlag() {
      return syncStatus.isUsrMin;
    }

    function setSyncStatusNewDataDefaults() {
      syncStatus.isPwdSync = true;
      syncStatus.isSparkEnt = true;
      syncStatus.isUsrDis = true;
      syncStatus.isUsrMin = false;
    }

    function parseSyncMode(syncString) {
      var syncMode = syncModes.messenger.off;

      // set to old data format by default, use new data format only when we detect it.
      syncStringFromServer = syncString.trim();
      syncStatus.isNewDataFormat = false;
      setSyncStatusNewDataDefaults();

      switch (syncString) {
        case syncModes.messenger.off.text:
          syncMode = syncModes.messenger.off;
          break;
        case syncModes.messenger.on.text:
          syncMode = syncModes.messenger.on;
          break;
        case syncModes.messenger.on_nospark.text:
          isEnabledNoSpark = true;
          syncStatus.isSparkEnt = false;
          syncMode = syncModes.messenger.on_nospark;
          break;
        case syncModes.dirsync.off.text:
          syncMode = syncModes.dirsync.off;
          break;
        case syncModes.dirsync.on.text:
          syncMode = syncModes.dirsync.on;
          break;
        default:
          // new data format handled here -- "msgr_to_spark;pwd_sync=1:spark_ent=1:usr_dis=1:usr_del=1:usr_min=0"
          var arraySyncString = syncString.trim().split(";");
          if (arraySyncString.length > 0) {
            // parse other data first before PK parse because of dependency
            if (arraySyncString.length > 1) {
              var arrayOtherData = arraySyncString[1].trim().split(":");
              var i;
              for (i = 0; i < arrayOtherData.length; i++) {
                // we only check non-default values
                switch (arrayOtherData[i]) {
                  case "pwd_sync=0":
                    syncStatus.isPwdSync = false;
                    break;
                  case "spark_ent=0":
                    syncStatus.isSparkEnt = false;
                    break;
                  case "usr_dis=0":
                    syncStatus.isUsrDis = false;
                    break;
                  case "usr_min=1":
                    syncStatus.isUsrMin = true;
                    break;
                }
              }
            }
            // parse primary key
            var primaryKey = arraySyncString[0];
            switch (primaryKey) {
              case "msgr_to_spark":
                syncStatus.isNewDataFormat = true;
                syncMode = syncModes.messenger.on;
                if (syncStatus.isUsrMin) {
                  syncMode = syncModes.dirsync.on;
                }
                break;
              case "spark_to_msgr":
              case "disabled":
                syncStatus.isNewDataFormat = true;
                syncMode = syncModes.messenger.off;
                if (syncStatus.isUsrMin) {
                  syncMode = syncModes.dirsync.off;
                }
                break;
              default:
                // error
                Log.error('SyncService::parseSyncMode(): Invalid sync mode \'' + syncString + '\'. Setting to Messenger Sync Mode OFF.');
            }
          } else {
            // error
            Log.error('SyncService::parseSyncMode(): Invalid sync mode \'' + syncString + '\'. Setting to Messenger Sync Mode OFF.');
          }
      }

      return syncMode;
    }

    function setDirSyncMode(isEnabled) {
      syncStatus.syncMode = (isEnabled) ? syncModes.dirsync.on : syncModes.dirsync.off;
    }

    function setMessengerSyncMode(isEnabled) {
      syncStatus.syncMode = (isEnabled) ? syncModes.messenger.on : syncModes.messenger.off;
    }

    function updateNewDataSyncString(syncString, re, key, value) {
      var keyValue = key + "=";
      if (value) {
        keyValue += "1";
      } else {
        keyValue += "0";
      }
      if (syncString.includes(key + "=", 0)) {
        return syncString.replace(re, keyValue);
      } else {
        return syncString.concat(":" + keyValue);
      }
    }
    function updateSyncStatus(syncInfo) {
      // other data, the below is 2 old flags with toggles
      syncStatus.isPwdSync = syncInfo.isPwdSync;
      syncStatus.isSparkEnt = syncInfo.isSparkEnt;
      syncStatus.isUsrDis = syncInfo.isUsrDis;
      // Update sync mode
      if (isDirSyncRaw()) {
        setDirSyncMode(syncInfo.isSyncEnabled);
      } else {
        setMessengerSyncMode(syncInfo.isSyncEnabled);
      }
      syncStatus.isAuthRedirect = syncInfo.isAuthRedirect;
    }

    function patchSync(syncInfo) {
      var defer = $q.defer();

      // Deep copy to prevent only reference copy
      var previousSettings = _.clone(syncStatus);

      // update those changeable in UI
      updateSyncStatus(syncInfo);

      var params = {
        ciSyncMode: syncStatus.syncMode.text,
        authRedirect: syncStatus.isAuthRedirect
      };
      // new data format
      if (syncStatus.isNewDataFormat) {
        var primaryKey = "msgr_to_spark";
        if (!syncInfo.isSyncEnabled) {
          primaryKey = "disabled";
        }
        var newSyncString = primaryKey;
        var indexSemicolon = syncStringFromServer.indexOf(";");
        if (indexSemicolon >= 0) {
          newSyncString = primaryKey + syncStringFromServer.substr(indexSemicolon, syncStringFromServer.length - 1);
        }
        // update other data
        newSyncString = updateNewDataSyncString(newSyncString, /pwd_sync=[0-9]/, "pwd_sync", syncStatus.isPwdSync);
        newSyncString = updateNewDataSyncString(newSyncString, /spark_ent=[0-9]/, "spark_ent", syncStatus.isSparkEnt);
        newSyncString = updateNewDataSyncString(newSyncString, /usr_dis=[0-9]/, "usr_dis", syncStatus.isUsrDis);
        newSyncString = updateNewDataSyncString(newSyncString, /usr_min=[0-9]/, "usr_min", syncStatus.isUsrMin);

        params = {
          ciSyncMode: newSyncString,
          authRedirect: syncStatus.isAuthRedirect
        };
      } else {
        // convert old format data to new data format when update clicked
        if (isDirSyncRaw()) {
          if (syncInfo.isSyncEnabled) {
            newSyncString = "msgr_to_spark;pwd_sync=0:usr_dis=0:spark_ent=1:usr_min=1";
          } else {
            newSyncString = "disabled;usr_min=1";
          }
          params = {
            ciSyncMode: newSyncString,
            authRedirect: syncStatus.isAuthRedirect
          };
        } else {
          // ***note*** we don't set isNewDataFormat after conversion, we get this when next fetch & parse
          if (isEnabledNoSpark) {
            // enabled_nospark -> msgr_to_spark;spark_ent=0:pwd_sync=1:usr_dis=1:usr_min=0
            if (syncInfo.isSyncEnabled) {
              newSyncString = "msgr_to_spark;spark_ent=0:pwd_sync=1:usr_dis=1:usr_min=0";
            } else {
              newSyncString = "disabled;spark_ent=0:pwd_sync=1:usr_dis=1:usr_min=0";
            }
            params = {
              ciSyncMode: newSyncString,
              authRedirect: syncStatus.isAuthRedirect
            };
          } else if (syncInfo.isSyncEnabled) {
            // convert to new data format when enabling the msgr sync with the default values
            newSyncString = "msgr_to_spark;pwd_sync=1:spark_ent=1:usr_dis=1:usr_min=0";
            params = {
              ciSyncMode: newSyncString,
              authRedirect: syncStatus.isAuthRedirect
            };
          }
        }
      }

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
