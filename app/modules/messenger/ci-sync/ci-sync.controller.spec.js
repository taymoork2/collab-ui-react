(function () {
  'use strict';

  describe('Controller: CiSyncCtrl', function () {
    var ctrl;

    beforeEach(function () {
      module('Huron');
      module('Sunlight');
      module('Messenger');

      inject(function ($controller) {
        ctrl = $controller('CiSyncCtrl');
      });
    });

    it('should initialize as viewed from an unknown user role', function () {
      expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
    });
  });
})();
