(function () {
  'use strict';

  describe('Service: SyncService', function () {
    var service;

    beforeEach(function () {
      module('Messenger');

      inject(function (_SyncService_) {
        service = _SyncService_;
      });
    });

    it('should default to sync mode disabled', function () {
      expect(service.isSyncEnabled()).toBe(false);
    });

    it('should default to Messenger sync mode', function () {
      expect(service.isMessengerSync()).toBe(true);
      expect(service.isDirSync()).toBe(false);
    });

    it('should tell if org is in Messenger Sync mode ON', function () {
      service.setMessengerSyncMode(true);
      expect(service.isSyncEnabled()).toBe(true);
      expect(service.isMessengerSync()).toBe(true);
      expect(service.isDirSync()).toBe(false);
    });

    it('should tell if org is in DirSync mode ON', function () {
      service.setDirSyncMode(true);
      expect(service.isSyncEnabled()).toBe(true);
      expect(service.isMessengerSync()).toBe(false);
      expect(service.isDirSync()).toBe(true);
    });

    it('should tell if org is in Messenger Sync mode OFF', function () {
      service.setMessengerSyncMode(false);
      expect(service.isSyncEnabled()).toBe(false);
      expect(service.isMessengerSync()).toBe(true);
      expect(service.isDirSync()).toBe(false);
    });

    it('should tell if org is in DirSync mode OFF', function () {
      service.setDirSyncMode(false);
      expect(service.isSyncEnabled()).toBe(false);
      expect(service.isMessengerSync()).toBe(false);
      expect(service.isDirSync()).toBe(true);
    });
  });
})();
