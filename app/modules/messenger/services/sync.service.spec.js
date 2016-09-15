(function () {
  'use strict';

  describe('Service: SyncService', function () {
    var service;

    beforeEach(function () {
      angular.mock.module('Messenger');

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

    it('check old data format parsing : sync enabled', function () {
      service.parseSyncMode('enabled');
      expect(service.getNewDataFormat()).toEqual(false);
    });

    it('check old data format parsing : sync disabled', function () {
      service.parseSyncMode('disabled');
      expect(service.getNewDataFormat()).toEqual(false);
    });

    it('check new data format parsing : sync enabled', function () {
      service.parseSyncMode('msgr_to_spark;pwd_sync=1:spark_ent=1:usr_dis=1:usr_del=1:usr_min=0');
      expect(service.getNewDataFormat()).toEqual(true);
    });

    it('check new data format parsing : sync disabled', function () {
      service.parseSyncMode('spark_to_msgr;pwd_sync=1:spark_ent=1:usr_dis=1:usr_del=1:usr_min=0');
      expect(service.getNewDataFormat()).toEqual(true);
    });

    it('check new data format parsing : sync disabled 2', function () {
      service.parseSyncMode('disabled;pwd_sync=1:spark_ent=1:usr_dis=1:usr_del=1:usr_min=0');
      expect(service.getNewDataFormat()).toEqual(true);
    });
  });
})();
