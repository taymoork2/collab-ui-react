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
      expect(service.isMessengerSync()).toBe(false);
      expect(service.isDirSync()).toBe(false);
    });

    it('should tell if org is in Messenger Sync mode', function () {
      service.setMessengerSyncMode(true);
      expect(service.isMessengerSync()).toBe(true);
      expect(service.isDirSync()).toBe(false);
    });

    it('should tell if org is in DirSync mode', function () {
      service.setDirSyncMode(true);
      expect(service.isMessengerSync()).toBe(false);
      expect(service.isDirSync()).toBe(true);
    });
  });
})();
