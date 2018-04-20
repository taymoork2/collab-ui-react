describe('Component: Hybrid Context Container',  () => {

  beforeEach(function () {
    this.initModules('Context');
    this.injectDependencies(
      '$q',
      '$scope',
      '$translate',
      'Authinfo',
      'FeatureToggleService',
    );
    spyOn(this.$translate, 'instant').and.callThrough();
    this.$scope.backState = '';
  });

  describe('with feature flag off', function () {
    beforeEach(function() {
      spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
    });

    it('should set backState correctly when unspecified', function () {
      this.compileComponent('context-container', { backState: '' });
      expect(this.controller.backState).toEqual('services-overview');
    });

    it('should set backState correctly when specified', function () {
      this.compileComponent('context-container', { backState: 'some-back-state' });
      expect(this.controller.backState).toEqual('services-overview');
    });
  });

  describe('for a Customer Admin,', () => {
    beforeEach(function () {
      spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
    });

    it('should setup tabs properly when feature flag is off.', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      this.compileComponent('context-container', { backState: '' });
      expect(this.controller.tabs.length).toEqual(3);
    });

    it('should setup tabs properly when feature flag is on', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      this.compileComponent('context-container', { backState: '' });
      expect(this.controller.tabs.length).toEqual(4);
    });
  });

  describe('for a Partner Admin,', () => {
    beforeEach(function () {
      spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(true);
    });

    it('should setup tabs properly when feature flag is off.', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
      this.compileComponent('context-container', { backState: '' });
      expect(this.controller.tabs.length).toEqual(1);
    });

    it('should setup tabs properly when feature flag is on.', function () {
      spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
      this.compileComponent('context-container', { backState: '' });
      expect(this.controller.tabs.length).toEqual(2);
    });
  });
});
