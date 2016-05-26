///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="settings.ctrl.ts"/>
namespace globalsettings {

  describe('SettingsCtrl', ()=> {

    let controller, $controller, Authinfo;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    function dependencies(_$controller_, _Authinfo_) {
      $controller = _$controller_;
      Authinfo = _Authinfo_;
    }

    function initSpies() {
      spyOn(Authinfo, 'isPartner');
    }

    function initController() {
      controller = $controller('SettingsCtrl');
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);

    describe('for partner admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(true));
      beforeEach(initController);

      it('should create the ctrl and add the partner setting sections', ()=> {
        expect(controller.security).toBeFalsy();
        expect(controller.privacy).toBeFalsy();
        expect(controller.domains).toBeFalsy();
        expect(controller.sipDomain).toBeFalsy();
        expect(controller.authentication).toBeFalsy();
        expect(controller.branding).toBeFalsy();
        expect(controller.support).toBeTruthy();
        expect(controller.dataPolicy).toBeFalsy();
      });
    });

    describe('for normal admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(false));
      beforeEach(initController);

      it('should create the ctrl and add the normal setting sections', ()=> {
        expect(controller.security).toBeTruthy();
        expect(controller.privacy).toBeTruthy();
        expect(controller.domains).toBeTruthy();
        expect(controller.sipDomain).toBeTruthy();
        expect(controller.authentication).toBeTruthy();
        expect(controller.branding).toBeFalsy();
        expect(controller.support).toBeTruthy();
        expect(controller.dataPolicy).toBeTruthy();
      });
    });

    function setAuthinfoIsPartnerSpy(isPartner) {
      return function () {
        Authinfo.isPartner.and.returnValue(isPartner);
      };
    }
  });
}
