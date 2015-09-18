(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('SyncService', SyncService);

  /** @ngInject */
  function SyncService() {
    // Interface ---------------------------------------------------------------

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

    var service = {
      getSyncStatus: null,
      isDirSync: isDirSync,
      isMessengerSync: isMessengerSync,
      setDirSyncMode: setDirSyncMode,
      setMessengerSyncMode: setMessengerSyncMode,
      syncMode: syncModes.messenger.off
    };

    // Return the service
    return service;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function isDirSync() {
      return (syncModes.dirsync.on === service.syncMode);
    }

    function isMessengerSync() {
      return (syncModes.messenger.on === service.syncMode);
    }

    function setDirSyncMode(isEnabled) {
      service.syncMode = (isEnabled) ? syncModes.dirsync.on : syncModes.dirsync.off;
    }

    function setMessengerSyncMode(isEnabled) {
      service.syncMode = (isEnabled) ? syncModes.messenger.on : syncModes.messenger.off;
    }
  }
})();
