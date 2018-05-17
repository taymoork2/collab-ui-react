import tosModule from './index';

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
      'Authinfo',
      'FeatureToggleService',
    );

    this.meData = {
      mockData: true,
    };

    this.MeServiceSpy = spyOn(this.MeService, 'getMe').and.callFake(() => this.$q.resolve(this.meData));

    spyOn(this.$modal, 'open').and.returnValue(mockTosModal);
    spyOn(this.TOSService, 'dismissModal').and.callThrough();

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
      this.TOSService.openTOSModal();
      expect(this.$modal.open).toHaveBeenCalled();
    });
    it('should not open a modal if there is already a modal instance on the page', function () {
      this.TOSService.tosModal = { foo: 'bar' };
      this.TOSService.openTOSModal();
      expect(this.$modal.open).not.toHaveBeenCalled();
    });
  });

  describe('acceptTOS()', () => {

    it('should dismiss open modal once user updated', function () {
      spyOn(this.UserPreferencesService, 'setUserPreferences').and.returnValue(this.$q.resolve());

      const ap = this.TOSService.hasAcceptedTOS();
      expect(ap).toBeResolvedWith(false);

      this.TOSService.openTOSModal();
      this.TOSService.acceptTOS().then( function() {
        expect(mockTosModal.dismiss).toHaveBeenCalled();
      });
      this.$rootScope.$digest();
    });

    it('should reject acceptTOS promise if user update failed', function () {
      const ap = this.TOSService.hasAcceptedTOS();
      expect(ap).toBeResolvedWith(false);

      spyOn(this.UserPreferencesService, 'setUserPreferences').and.returnValue(this.$q.reject());

      this.TOSService.openTOSModal();
      mockTosModal.dismiss.calls.reset(); // openTOSModal calls dismiss, so reset spy
      this.TOSService.acceptTOS().catch(_.noop);
      this.$rootScope.$digest();
      expect(mockTosModal.dismiss).not.toHaveBeenCalled();
    });

  });
});
