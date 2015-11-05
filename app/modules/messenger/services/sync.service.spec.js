(function () {
  'use strict';

  describe('Service: SyncService', function () {
    var service;

    beforeEach(function () {
      module('Messenger');

      inject(function (_SyncService_) {
        service = _SyncService_;
        service.getSyncStatus();
      });
    });

    it('should default to sync mode disabled', function () {
      service.isSyncEnabled()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });
    });

    it('should default to Messenger sync mode', function () {
      service.isMessengerSync()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isDirSync()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });
    });

    it('should tell if org is in Messenger Sync mode ON', function () {
      service.setMessengerSyncMode(true);

      service.isSyncEnabled()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isMessengerSync()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isDirSync()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });
    });

    it('should tell if org is in DirSync mode ON', function () {
      service.setDirSyncMode(true);

      service.isSyncEnabled()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isMessengerSync()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isDirSync()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });
    });

    it('should tell if org is in Messenger Sync mode OFF', function () {
      service.setMessengerSyncMode(false);

      service.isSyncEnabled()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isMessengerSync()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isDirSync()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });
    });

    it('should tell if org is in DirSync mode OFF', function () {
      service.setDirSyncMode(false);

      service.isSyncEnabled()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isMessengerSync()
        .then(function (result) {
          expect(result).toBe(false);
        }, function (errorMsg) {
          fail(errorMsg);
        });

      service.isDirSync()
        .then(function (result) {
          expect(result).toBe(true);
        }, function (errorMsg) {
          fail(errorMsg);
        });
    });
  });
})();
