import ITProPackModule from './index';

describe('ITProPackService', () => {

  beforeEach(function () {
    this.initModules(ITProPackModule);
    this.injectDependencies(
      '$q',
      '$rootScope',
      'FeatureToggleService',
      'ITProPackService',
    );
    spyOn(this.FeatureToggleService, 'atlasITProPackGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.FeatureToggleService, 'atlasITProPackPurchasedGetStatus').and.returnValue(this.$q.resolve(true));
    installPromiseMatchers();
  });
  describe('hasITProPackEnabled()', () => {
    it('should return true if atlas-it-pro-pack FT is enabled  and false if it\'s not', function(){
      let promise = this.ITProPackService.hasITProPackEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      promise = this.ITProPackService.hasITProPackEnabled().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });
  describe('getITProPackPurchased()', () => {
    it('should return true if atlas-it-pro-pack-purchased FT is enabled  and false if it\'s not', function(){
      let promise = this.ITProPackService.getITProPackPurchased().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      promise = this.ITProPackService.getITProPackPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });
  describe('hasITProPackPurchased()', () => {
    it('should return true if both atlas-it-pro-pack-purchased and atlas-it-pro-pack FTs are enabled', function(){
      let promise = this.ITProPackService.hasITProPackPurchased().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if either atlas-it-pro-pack-purchased or atlas-it-pro-pack FTs are disabled', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(true));
      let promise = this.ITProPackService.hasITProPackPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();

      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(true));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      promise = this.ITProPackService.hasITProPackPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });

  describe('hasITProPackPurchasedOrNotEnabled()', () => {
    it('should return true if both atlas-it-pro-pack-purchased is enabled and atlas-it-pro-pack FTs is enabled', function(){
      let promise = this.ITProPackService.hasITProPackPurchasedOrNotEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return true if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is disabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      let promise = this.ITProPackService.hasITProPackPurchasedOrNotEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is enabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(true));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      let promise = this.ITProPackService.hasITProPackPurchasedOrNotEnabled().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });

  describe('hasITProPackEnabledAndNotPurchased()', () => {
    it('should return false if atlas-it-pro-pack-purchased is enabled and atlas-it-pro-pack FTs is enabled', function(){
      let promise = this.ITProPackService.hasITProPackEnabledAndNotPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is disabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(false));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      let promise = this.ITProPackService.hasITProPackEnabledAndNotPurchased().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return true if atlas-it-pro-pack-purchased is disabled and atlas-it-pro-pack FT is enabled ', function(){
      this.FeatureToggleService.atlasITProPackGetStatus.and.returnValue(this.$q.resolve(true));
      this.FeatureToggleService.atlasITProPackPurchasedGetStatus.and.returnValue(this.$q.resolve(false));
      let promise = this.ITProPackService.hasITProPackEnabledAndNotPurchased().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });
});
