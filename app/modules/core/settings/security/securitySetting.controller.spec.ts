/// <reference path="securitySetting.controller.ts"/>
namespace globalsettings {

  describe('Controller: SecuritySettingController', ()=> {

    let controller:SecuritySettingController;
    let $scope, $controller, $q;
    let AccountOrgService, Authinfo;


    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    beforeEach(inject(dependencies));
    beforeEach(initSpies);


    function dependencies($rootScope, _$controller_, _$q_, _AccountOrgService_, _Authinfo_) {
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $q = _$q_;
      AccountOrgService = _AccountOrgService_;
      Authinfo = _Authinfo_;
    }

    function initSpies() {
      spyOn(AccountOrgService, 'getAppSecurity');
      spyOn(AccountOrgService, 'setAppSecurity');
    }

    function initController() {
      controller = $controller('SecuritySettingController', {
        $scope: $scope
      });
      $scope.$apply();
    }

    describe('contructor()', ()=> {

      describe('when getAppSecurity fail', ()=> {
        beforeEach(initGetAppSecReject());
        beforeEach(initController);

        it('should not set dataloaded and no value for requireProtectedDevices', () => {
          expect(controller.requireProtectedDevices).toBeFalsy();
          expect(controller.requireProtectedDevicesIsLoaded).toBeFalsy();
        });
      });

      describe('when getAppSecurity return bad object', ()=> {
        beforeEach(initGetAppSecWithResult({whatsthis: false}));
        beforeEach(initController);

        it('should not set dataloaded and no value for requireProtectedDevices', () => {
          expect(controller.requireProtectedDevices).toBeFalsy();
          expect(controller.requireProtectedDevicesIsLoaded).toBeFalsy();
        });
      });

      describe('when getAppSecurity return a bad data object', ()=> {
        beforeEach(initGetAppSecWithResult({data: {whatsthis: false}}));
        beforeEach(initController);

        it('should not set dataloaded and no value for requireProtectedDevices', () => {
          expect(controller.requireProtectedDevices).toBeFalsy();
          expect(controller.requireProtectedDevicesIsLoaded).toBeFalsy();
        });
      });

      describe('when getAppSecurity return enforceClientSecurity set to true', ()=> {
        beforeEach(initGetAppSecWithResult({data: {enforceClientSecurity: true}}));
        beforeEach(initController);

        it('should set dataloaded and true for requireProtectedDevices', () => {
          expect(controller.requireProtectedDevices).toBeTruthy();
          expect(controller.requireProtectedDevicesIsLoaded).toBeTruthy();
        });
      });

      describe('when getAppSecurity return enforceClientSecurity set to false', ()=> {
        beforeEach(initGetAppSecWithResult({data: {enforceClientSecurity: false}}));
        beforeEach(initController);

        it('should set dataloaded and true for requireProtectedDevices', () => {
          expect(controller.requireProtectedDevices).toBeFalsy();
          expect(controller.requireProtectedDevicesIsLoaded).toBeTruthy();
        });
      });

    });

    describe('requireProtectedDevicesUpdate', ()=> {
      beforeEach(initGetAppSecWithResult({data: {enforceClientSecurity: false}}));
      beforeEach(initSetAppSec);
      beforeEach(initController);

      it('should call AccountOrgService to save the value true', () => {
        controller.requireProtectedDevices = true;

        controller.requireProtectedDevicesUpdate();

        expect(AccountOrgService.setAppSecurity)
          .toHaveBeenCalledWith(Authinfo.getOrgId(), true);
      });

      it('should call AccountOrgService to save the value false', () => {
        controller.requireProtectedDevices = false;

        controller.requireProtectedDevicesUpdate();

        expect(AccountOrgService.setAppSecurity)
          .toHaveBeenCalledWith(Authinfo.getOrgId(), false);
      });

      function initSetAppSec() {
        AccountOrgService.setAppSecurity.and.returnValue($q.when({}));
      }
    });

    function initGetAppSecWithResult(result:any) {
      return () => {
        AccountOrgService.getAppSecurity.and.returnValue($q.when(result));
      }
    }

    function initGetAppSecReject() {
      return () => {
        AccountOrgService.getAppSecurity.and.returnValue($q.reject({}));
      }
    }
  });
}
