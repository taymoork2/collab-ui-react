(function () {
  'use strict';

  /*var $controller, MailValidatorService, Notification;
  var $scope;
  var ctrl;*/

  describe('Controller: EditTrialUsersController', function () {
    beforeEach(angular.mock.module('Hercules'));
    beforeEach(angular.mock.module('HDS'));

    /*beforeEach(inject(function (_$controller_, _$rootScope_, _MailValidatorService_, _Notification_) {
      $scope = _$rootScope_.$new();
      MailValidatorService = _MailValidatorService_;
      Notification = _Notification_;
      $controller = _$controller_;
    }));

    function initController() {
      ctrl = $controller('AddTrialUsersController');
      $scope.$apply();
    }*/

    describe('Initialization Tests', function () {

      /*it('controller should be defined', function () {
        initController();
        expect(ctrl).toBeDefined();
      });
      it('addUser should notify success for valid emailTrialUsers', function () {
        initController();
        var emails = [{
          text: 'abc@cisco.com'
        }];
        ctrl.emailTrialUsers = emails;
        spyOn(Notification, 'success');
        spyOn(MailValidatorService, 'isValidEmailCsv').and.returnValue(true);
        ctrl.addUser();
        //expect(Notification.success).toHaveBeenCalled();
        expect(ctrl.savingEmail).toBe(true);
      });*/
      // TODO: we will add more when back end API is clear

    });
  });


})();
