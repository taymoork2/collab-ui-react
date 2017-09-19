import { EmailSettingController } from './emailSetting.controller';
import testModule from './index';

describe('Controller: EmailSettingController', () => {

  let $scope, $controller, controller, $q;
  let Orgservice, Notification;

  beforeEach(angular.mock.module(testModule));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _Orgservice_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;
  }

  function initSpies() {
    spyOn(Orgservice, 'getAdminOrgAsPromise');
    spyOn(Notification, 'success');
    spyOn(Notification, 'error');
    spyOn(Notification, 'errorResponse');
  }

  function initController() {
    controller = $controller(EmailSettingController, {
      $scope: $scope,
    });
    $scope.$apply();
  }

  describe('contructor()', () => {

    describe('when getAdminOrg return failure', () => {
      beforeEach(inject(dependencies));
      beforeEach(initSpyFailure);
      beforeEach(initController);

      it('should not set sso status', () => {
        expect(controller.ssoStatusLoaded).toBeFalsy();
        expect(controller.isEmailSuppressed).toBeFalsy();
        expect(controller.isEmailSuppressDisabled).toBeFalsy();
      });

      function initSpyFailure() {
        Orgservice.getAdminOrgAsPromise.and.returnValue($q.reject({}));
      }
    });

    describe('when getAdminOrg isOnBoardingEmailSuppressed true and sso status true', () => {
      beforeEach(inject(dependencies));
      beforeEach(initSpySSOEnabled);
      beforeEach(initController);

      it('should set isEmailSuppressed true and isEmailSuppressDisabled false', () => {
        expect(controller.ssoStatusLoaded).toBeTruthy();
        expect(controller.isEmailSuppressed).toBeTruthy();
        expect(controller.isEmailSuppressDisabled).toBeFalsy();
      });

      function initSpySSOEnabled() {
        Orgservice.getAdminOrgAsPromise.and.returnValue($q.resolve({ data: { success: true, ssoEnabled: true, isOnBoardingEmailSuppressed: true } }));
      }
    });

    describe('when getAdminOrg isOnBoardingEmailSuppressed true and sso status false', () => {
      beforeEach(inject(dependencies));
      beforeEach(initSpySSODisabled);
      beforeEach(initController);

      it('should set isEmailSuppressed true and isEmailSuppressDisabled true', () => {
        expect(controller.ssoStatusLoaded).toBeTruthy();
        expect(controller.isEmailSuppressed).toBeTruthy();
        expect(controller.isEmailSuppressDisabled).toBeTruthy();
      });

      function initSpySSODisabled() {
        Orgservice.getAdminOrgAsPromise.and.returnValue($q.resolve({ data: { success: true, ssoEnabled: false, isOnBoardingEmailSuppressed: true } }));
      }
    });
  });
});
