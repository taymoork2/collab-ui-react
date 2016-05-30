///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="settings.controller.ts"/>
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
        expect(controller.domains).toBeFalsy();
      });
    });

    describe('for normal admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(false));
      beforeEach(initController);

      it('should create the ctrl and add the normal setting sections', ()=> {
        expect(controller.domains).toBeTruthy();
      });
    });

    function setAuthinfoIsPartnerSpy(isPartner) {
      return function () {
        Authinfo.isPartner.and.returnValue(isPartner);
      };
    }
  });
}
