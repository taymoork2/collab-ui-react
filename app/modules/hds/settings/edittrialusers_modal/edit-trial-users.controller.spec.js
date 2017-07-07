(function () {
  'use strict';

  var $controller, $q, HDSService;
  var $scope;
  var ctrl;

  describe('Controller: EditTrialUsersController', function () {
    beforeEach(angular.mock.module('Hercules'));
    beforeEach(angular.mock.module('HDS'));

    beforeEach(inject(function (_$controller_, _$q_, _$rootScope_, _HDSService_) {
      $controller = _$controller_;
      $q = _$q_;
      $scope = _$rootScope_.$new();
      HDSService = _HDSService_;
      spyOn(HDSService, 'getHdsTrialUserGroupID').and.returnValue($q.resolve({}));
    }));

    function initController() {
      ctrl = $controller('AddTrialUsersController');
      $scope.$apply();
    }

    describe('Initialization Tests', function () {
      it('addUser should see savingEmail as true for valid emailTrialUsers', function () {
        initController();
        var emails = [{
          text: 'abc@cisco.com',
        }];
        ctrl.savingEmail = false;
        ctrl.emailTrialUsers = emails;
        ctrl.addUser();
        expect(ctrl.savingEmail).toBe(true);
      });

      it('addUser should see savingEmail as false for invalid emailTrialUsers', function () {
        var emails = [{
          text: 'abc',
        }];
        ctrl.savingEmail = false;
        ctrl.emailTrialUsers = emails;
        ctrl.addUser();
        expect(ctrl.savingEmail).toBe(false);
      });

      it('removeUser should see savingEmail as true for valid emailTrialUsers', function () {
        initController();
        var emails = [{
          text: 'abc@cisco.com',
        }];
        ctrl.savingEmail = false;
        ctrl.emailTrialUsers = emails;
        ctrl.removeUser();
        expect(ctrl.savingEmail).toBe(true);
      });
    });
  });
})();
