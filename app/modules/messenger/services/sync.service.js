(function () {
  'use strict';

  angular
    .module('Messenger')
    .factory('SyncService', SyncService);

  /** @ngInject */
  function SyncService() {
    // Interface ---------------------------------------------------------------

    var syncService = {
      getSyncStatus: null,
      isDirSync: isDirSync,
      isMessengerSync: isMessengerSync,
      syncMode: 'disabled'
    };

    // Return the service
    return syncService;

    ////////////////////////////////////////////////////////////////////////////

    // Implementation ----------------------------------------------------------

    function isMessengerSync() {
      return ('enabled' === syncService.syncMode) ? true : false;
    }

    function isDirSync() {
      return ('link_enabled' === syncService.syncMode) ? true : false;
    }

  }
})();
