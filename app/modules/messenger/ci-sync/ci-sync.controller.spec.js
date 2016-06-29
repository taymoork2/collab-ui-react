(function () {
  'use strict';

  describe('Controller: CiSyncCtrl', function () {
    var ctrl;

    beforeEach(function () {
      angular.mock.module('Huron');
      angular.mock.module('Sunlight');
      angular.mock.module('Messenger');

      inject(function ($controller) {
        ctrl = $controller('CiSyncCtrl');
      });
    });

    it('should initialize as viewed from an unknown user role', function () {
      expect(ctrl.adminType).toBe(ctrl.adminTypes.unknown);
    });
  });
})();
