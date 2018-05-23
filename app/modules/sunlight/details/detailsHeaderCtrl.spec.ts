import headerModule from './details.module';

describe('Care details ctrl', () => {
  beforeEach(function () {
    this.initModules(headerModule);
    this.injectDependencies(
      '$q',
      '$scope',
      'FeatureToggleService',
    );

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(false));
  });

  function compileComponent() {
    this.compileComponent('detailsHeaderComponent', {});
  }

  describe('on init', function () {
    beforeEach(compileComponent);

    it('should define header tabs', function () {
      expect(this.controller).toExist();

      expect(this.controller.tabs.length).toEqual(2);
      expect(this.controller.back).toBeFalsy();
      expect(this.controller.tabs[0].title).toEqual('sunlightDetails.featuresTitle');
      expect(this.controller.tabs[1].title).toEqual('sunlightDetails.settingsTitle');
    });
  });
});
