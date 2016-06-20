///<reference path="../../../../typings/tsd-testing.d.ts"/>
/// <reference path="settings.controller.ts"/>
namespace globalsettings {

  describe('SettingsCtrl', ()=> {

    let controller, $controller, Authinfo, FeatureToggleService, Orgservice, $q, $scope;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    function dependencies(_$controller_, $rootScope, _Authinfo_, _FeatureToggleService_, _Orgservice_, _$q_) {
      $controller = _$controller_;
      Authinfo = _Authinfo_;
      FeatureToggleService = _FeatureToggleService_;
      $q = _$q_;
      Orgservice = _Orgservice_;
      $scope = $rootScope.$new();
    }

    function initSpies() {
      spyOn(Orgservice, 'getOrg');
      spyOn(FeatureToggleService, 'supports');
      spyOn(Authinfo, 'isPartner')
    }

    function initController() {
      controller = $controller('SettingsCtrl', {
        $scope: $scope
      });

      $scope.$apply();
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);
    beforeEach(setFeatureToggle);

    describe('for partner admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(true));
      beforeEach(initController);

      it('should create the ctrl and add the partner setting sections', ()=> {
        expect(controller.security).toBeFalsy();
        expect(controller.domains).toBeFalsy();
        expect(controller.sipDomain).toBeFalsy();
        expect(controller.authentication).toBeFalsy();
        expect(controller.support).toBeFalsy();
        expect(controller.branding).toBeTruthy();
        expect(controller.privacy).toBeFalsy();
        expect(controller.dataPolicy).toBeFalsy();
      });
    });

    describe('for normal admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(false));

      describe('with allowCustomerLogos set to true', () => {

        beforeEach(setGetOrgSpy(true));
        beforeEach(initController);

        it('should create the ctrl and add the normal setting sections', ()=> {
          expect(controller.security).toBeTruthy();
          expect(controller.domains).toBeTruthy();
          expect(controller.sipDomain).toBeTruthy();
          expect(controller.authentication).toBeTruthy();
          expect(controller.support).toBeTruthy();
          expect(controller.branding).toBeTruthy();
          expect(controller.privacy).toBeTruthy();
          expect(controller.dataPolicy).toBeTruthy();
        });
      });

      describe('with allowCustomerLogos set to false', () => {

        beforeEach(setGetOrgSpy(false));
        beforeEach(initController);

        it('should create the ctrl and add the normal setting sections but filter out branding', ()=> {
          expect(controller.security).toBeTruthy();
          expect(controller.domains).toBeTruthy();
          expect(controller.sipDomain).toBeTruthy();
          expect(controller.authentication).toBeTruthy();
          expect(controller.support).toBeTruthy();
          expect(controller.branding).toBeFalsy();
          expect(controller.privacy).toBeTruthy();
          expect(controller.dataPolicy).toBeTruthy();
        });
      });
    });

    function setAuthinfoIsPartnerSpy(isPartner) {
      return () => {
        Authinfo.isPartner.and.returnValue(isPartner);
      };
    }
    function setGetOrgSpy(allowBranding) {
      return () => {
        Orgservice.getOrg.and.callFake(function (callback) {
          callback({orgSettings: {allowCustomerLogos: allowBranding}});
        });
      };
    }
    function setFeatureToggle() {
      FeatureToggleService.supports.and.returnValue($q.when(true));
    }
  });
}
