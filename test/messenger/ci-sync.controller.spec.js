(function () {
  'use strict';

  describe('Controller: CiSyncCtrl', function () {
    var ctrl;

    beforeEach(function () {
      module('Huron');
      module('Messenger');

      inject(function ($controller) {
        ctrl = $controller('CiSyncCtrl');
      });
    });

    it('should have correct title', function () {
      expect(ctrl.title).toBe('Messenger CI Sync');
    });

    it('should initialize as viewed from an Org Admin', function () {
      expect(ctrl.adminType).toBe(ctrl.adminTypes.org);
    });

    it('should by default not show debug UI', function () {
      expect(ctrl.dev).toBe(false);
    });
  });
})();
