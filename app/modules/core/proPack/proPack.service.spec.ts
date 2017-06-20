import ProPackModule from './index';

describe('ProPackService', () => {

  beforeEach(function () {
    this.initModules(ProPackModule);
    this.injectDependencies(
      '$q',
      '$rootScope',
      'FeatureToggleService',
      'ProPackService',
    );
    spyOn(this.FeatureToggleService, 'atlasITProPackGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasITProPackPurchasedGetStatus').and.returnValue(this.$q.resolve(true));
    installPromiseMatchers();
  });
  describe('hasProPackEnabled()', () => {
    it('should return true if atlas-it-pro-pack FT is enabled  and false if it\'s not', function(){
      let promise = this.ProPackService.hasProPackEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      promise = this.ProPackService.hasProPackEnabled().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });
  describe('getProPackPurchased()', () => {
    it('should return true if atlas-it-pro-pack-purchased FT is enabled  and false if it\'s not', function(){
      let promise = this.ProPackService.getProPackPurchased().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      promise = this.ProPackService.getProPackPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });
  describe('hasProPackPurchased()', () => {
    it('should return true if both atlas-it-pro-pack-purchased and atlas-it-pro-pack FTs are enabled', function(){
      const promise = this.ProPackService.hasProPackPurchased().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if either atlas-it-pro-pack-purchased or atlas-it-pro-pack FTs are disabled', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(true));
      let promise = this.ProPackService.hasProPackPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();

      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(true));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      promise = this.ProPackService.hasProPackPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });

  describe('hasProPackPurchasedOrNotEnabled()', () => {
    it('should return true if both atlas-it-pro-pack-purchased is enabled and atlas-it-pro-pack FTs is enabled', function(){
      const promise = this.ProPackService.hasProPackPurchasedOrNotEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return true if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is disabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      const promise = this.ProPackService.hasProPackPurchasedOrNotEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is enabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(true));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      const promise = this.ProPackService.hasProPackPurchasedOrNotEnabled().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });

  describe('hasProPackEnabledAndNotPurchased()', () => {
    it('should return false if atlas-it-pro-pack-purchased is enabled and atlas-it-pro-pack FTs is enabled', function(){
      const promise = this.ProPackService.hasProPackEnabledAndNotPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is disabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      const promise = this.ProPackService.hasProPackEnabledAndNotPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return true if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is enabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(true));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      const promise = this.ProPackService.hasProPackEnabledAndNotPurchased().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });
});
