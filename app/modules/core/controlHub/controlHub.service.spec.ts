import ControlHubModule from './index';

describe('ControlHubService', () => {
  beforeEach(function () {
    this.initModules(ControlHubModule);
    this.injectDependencies(
      '$rootScope',
      '$q',
      'FeatureToggleService',
      'ControlHubService',
    );
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
    installPromiseMatchers();
  });

  it('it should return control hub image', function () {
    expect(this.ControlHubService.getImage()).toBe('/images/control-hub-logo.svg');
  });

  it('it should return control hub tabs', function () {
    expect(this.ControlHubService.getTabs().length).toBe(16);
  });

  describe('getCollapsed()', () => {
    it('it should return control hub collapsed false by default', function () {
      expect(this.ControlHubService.getCollapsed().value).toBeFalsy();
      expect(this.ControlHubService.getCollapsed().image).toBe('/images/spark-logo.svg');
    });

    it('it should return control hub collapsed true after being set to true', function () {
      const collapsed = this.ControlHubService.getCollapsed();
      expect(this.ControlHubService.getCollapsed().value).toBeFalsy();
      collapsed.value = true;
      expect(this.ControlHubService.getCollapsed().value).toBeTruthy();
    });
  });

  describe('getControlHubEnabled()', () => {
    it('should return true if atlas-2017-name-change FT is enabled', function(){
      const promise = this.ControlHubService.getControlHubEnabled().then(result => {
        expect(result).toBeTruthy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });

    it('should return false if atlas-2017-name-change FT is disabled', function(){
      this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(false));
      const promise = this.ControlHubService.getControlHubEnabled().then(result => {
        expect(result).toBeFalsy();
      });
      this.$rootScope.$digest();
      expect(promise).toBeResolved();
    });
  });

});
