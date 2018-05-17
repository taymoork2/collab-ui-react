import tosModule from './index';
import { IToolkitModalSettings } from 'modules/core/modal';

describe('TOSService', () => {
  const mockTosModal = {
    dismiss: jasmine.createSpy('dismiss').and.returnValue(true),
  };

  beforeEach(function () {
    this.initModules(tosModule);
    this.injectDependencies(
      '$q',
      'TOSService',
      'MeService',
      '$rootScope',
      '$modal',
      'UserPreferencesService',
      'Auth',
      'Authinfo',
      'ModalService',
    );

    this.meData = {
      mockData: true,
    };

    this.MeServiceSpy = spyOn(this.MeService, 'getMe').and.callFake(() => this.$q.resolve(this.meData));
    spyOn(this.$modal, 'open').and.returnValue(mockTosModal);

    installPromiseMatchers();
  });

  describe('hasAcceptedTOS()', () => {
    it('should return true if user has the ToS preference set', function () {
      this.UserPreferencesService.hasPreference = jasmine.createSpy('hasPreference').and.returnValue(true);
      const promise = this.TOSService.hasAcceptedTOS()
        .then((acceptedToS) => {
          expect(acceptedToS).toBeTruthy();
        });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if user does not have the ToS preference set', function () {
      this.UserPreferencesService.hasPreference = jasmine.createSpy('hasPreference').and.returnValue(false);
      const promise = this.TOSService.hasAcceptedTOS()
        .then((acceptedToS) => {
          expect(acceptedToS).toBeFalsy();
        });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return true if user does not have the ToS preference set, but is a partner admin', function () {
      spyOn(this.Authinfo, 'isPartnerAdmin').and.returnValue(true);
      this.UserPreferencesService.hasPreference = jasmine.createSpy('hasPreference').and.returnValue(false);
      const promise = this.TOSService.hasAcceptedTOS()
        .then((acceptedToS) => {
          expect(acceptedToS).toBeTruthy();
        });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

  });

  describe('openTOSModal()', function () {
    it('should open a new modal dialog', function () {
      spyOn(this.ModalService, 'open').and.returnValue({ result: this.$q.resolve() });
      const options = <IToolkitModalSettings>{
        type: 'dialog',
        title: 'termsOfService.title',
        message: 'termsOfService.message',
        dismiss: 'common.decline',
        close: 'common.accept',
      };

      this.TOSService.openTOSModal();
      expect(this.ModalService.open).toHaveBeenCalledWith(options);
    });
  });

  describe('acceptTOS()', () => {
    it('should call UserPreferencesService.setUserPreferences', function () {
      spyOn(this.UserPreferencesService, 'setUserPreferences').and.returnValue(this.$q.resolve());

      this.TOSService.acceptTOS();
      expect(this.UserPreferencesService.setUserPreferences).toHaveBeenCalled();
    });
  });

  describe('openTOSModal()', () => {
    it('should call acceptTOS() when accepting TOS', function () {
      spyOn(this.ModalService, 'open').and.callFake(() => {
        return { result: this.$q.resolve() };
      });
      spyOn(this.TOSService, 'acceptTOS').and.returnValue(this.$q.resolve());

      this.TOSService.openTOSModal();
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$rootScope.$digest();
      expect(this.TOSService.acceptTOS).toHaveBeenCalled();
    });
  });
});
