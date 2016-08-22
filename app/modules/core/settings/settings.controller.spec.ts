/// <reference path="settings.controller.ts"/>
namespace globalsettings {

  describe('SettingsCtrl', ()=> {

    let controller, $controller, Authinfo, FeatureToggleService, Orgservice, $q, $scope;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));
    beforeEach(angular.mock.module('Sunlight'));

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
      spyOn(FeatureToggleService, 'atlasBrandingWordingChangeGetStatus');
      spyOn(FeatureToggleService, 'atlasDataRetentionSettingsGetStatus');
      spyOn(FeatureToggleService, 'atlasPinSettingsGetStatus');
      spyOn(Authinfo, 'isPartner');
      spyOn(Authinfo, 'isCustomerAdmin');
      spyOn(Authinfo, 'isDirectCustomer');
    }

    function initController() {
      controller = $controller('SettingsCtrl', {
        $scope: $scope,
        hasFeatureToggle: true
      });

      $scope.$apply();
    }

    beforeEach(inject(dependencies));
    beforeEach(initSpies);
    beforeEach(setFeatureToggles);
    beforeEach(setBranding);

    describe('for partner admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(true));
      beforeEach(initController);

      it('should create the ctrl and add the partner setting sections', ()=> {
        expect(controller.security).toBeFalsy();
        expect(controller.domains).toBeFalsy();
        expect(controller.sipDomain).toBeFalsy();
        expect(controller.authentication).toBeFalsy();
        expect(controller.support).toBeTruthy();
        expect(controller.branding).toBeTruthy();
        expect(controller.privacy).toBeFalsy();
        expect(controller.retention).toBeFalsy();
      });
    });

    describe('for direct customer', () => {

      beforeEach(setAuthinfoIsDirectCustomerSpy(true));
      beforeEach(initController);

      it('should create the ctrl and add the direct customer setting sections', () => {
        expect(controller.security).toBeTruthy();
        expect(controller.domains).toBeTruthy();
        expect(controller.sipDomain).toBeTruthy();
        expect(controller.authentication).toBeTruthy();
        expect(controller.support).toBeTruthy();
        expect(controller.branding).toBeTruthy();
        expect(controller.privacy).toBeTruthy();
        expect(controller.retention).toBeTruthy();
      });
    });

    describe('for normal admin', () => {

      beforeEach(setAuthinfoIsPartnerSpy(false));
      beforeEach(setAuthinfoIsCustomerAdminSpy(true));

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
          expect(controller.retention).toBeTruthy();
        });
      });

      describe('with allowCustomerLogos set to false', () => {

        beforeEach(setGetOrgSpy(false));
        beforeEach(initController);

        it('should create the ctrl and add the normal setting sections', ()=> {
          expect(controller.security).toBeTruthy();
          expect(controller.domains).toBeTruthy();
          expect(controller.sipDomain).toBeTruthy();
          expect(controller.authentication).toBeTruthy();
          expect(controller.support).toBeTruthy();
          expect(controller.branding).toBeFalsy();
          expect(controller.privacy).toBeTruthy();
          expect(controller.retention).toBeTruthy();
        });
      });
    });

    function setAuthinfoIsPartnerSpy(isPartner) {
      return () => {
        Authinfo.isPartner.and.returnValue(isPartner);
      };
    }

    function setAuthinfoIsCustomerAdminSpy(isCustomerAdmin) {
      return () => {
        Authinfo.isCustomerAdmin.and.returnValue(isCustomerAdmin);
      };
    }

    function setAuthinfoIsDirectCustomerSpy(isDirectCustomer) {
      return () => {
        Authinfo.isDirectCustomer.and.returnValue(isDirectCustomer);
      };
    }

    function setGetOrgSpy(allowBranding) {
      return () => {
        Orgservice.getOrg.and.returnValue($q.when({data: {orgSettings: {allowCustomerLogos: allowBranding}}}));
      };
    }

    function setFeatureToggles() {
      togglePinSettings();
      toggleDataRetentionSettings();
    }

    function setBranding() {
      FeatureToggleService.atlasBrandingWordingChangeGetStatus.and.returnValue($q.when(true));
    }

    function togglePinSettings() {
      FeatureToggleService.atlasPinSettingsGetStatus.and.returnValue($q.when(true));
    }

    function toggleDataRetentionSettings() {
      FeatureToggleService.atlasDataRetentionSettingsGetStatus.and.returnValue($q.when(true));
    }
  });
}
