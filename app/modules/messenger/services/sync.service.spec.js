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

    it('check defaults after getSyncStatus()', function () {
      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(true);
      expect(service.getSimplifiedStatus().isAuthRedirect).toEqual(false);

      expect(service.getNewDataFormat()).toEqual(false);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(true);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(true);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(true);
      expect(service.getNewDirSyncFlag()).toEqual(false);
    });

    it('should tell if org is in Messenger Sync mode ON', function () {
      service.setMessengerSyncMode(true);

      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(true);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(true);
    });

    it('should tell if org is in DirSync mode ON', function () {
      service.setDirSyncMode(true);

      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(true);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(false);
    });

    it('should tell if org is in Messenger Sync mode OFF', function () {
      service.setMessengerSyncMode(false);

      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(true);
    });

    it('should tell if org is in DirSync mode OFF', function () {
      service.setDirSyncMode(false);

      expect(service.getSimplifiedStatus().isSyncEnabled).toEqual(false);
      expect(service.getSimplifiedStatus().isMessengerSyncRawMode).toEqual(false);
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

    it('check new data format parsing : other data non-default values', function () {
      service.parseSyncMode('msgr_to_spark;pwd_sync=0:spark_ent=0:usr_dis=0:usr_min=1');
      expect(service.getNewDataFormat()).toEqual(true);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(false);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(false);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(false);
      expect(service.getNewDirSyncFlag()).toEqual(true);
    });
    it('check new data format parsing : other data default for missing data', function () {
      service.parseSyncMode('msgr_to_spark;pwd_sync=1:spark_ent=1');
      expect(service.getNewDataFormat()).toEqual(true);
      expect(service.getSimplifiedStatus().isPwdSync).toEqual(true);
      expect(service.getSimplifiedStatus().isSparkEnt).toEqual(true);
      expect(service.getSimplifiedStatus().isUsrDis).toEqual(true);
      expect(service.getNewDirSyncFlag()).toEqual(false);
    });
  });
})();
