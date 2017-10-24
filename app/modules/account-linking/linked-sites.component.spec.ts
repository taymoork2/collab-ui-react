import linkedSites from './index';

describe('Component: linkedSites', () => {

  beforeEach(function () {
    this.initModules(linkedSites);
    this.injectDependencies(
      '$componentController',
      '$q',
      'FeatureToggleService',
      '$rootScope');

    this.controller = this.$componentController('linkedSites', {
      FeatureToggleService: this.FeatureToggleService,
    });


  });
  describe('at startup', () => {

    it('make sure its available is feature toggle set', function (done) {
      spyOn(this.FeatureToggleService, 'supports').and.callFake(() => {
        return this.$q.resolve(true);
      });
      this.controller.$onInit();
      this.$rootScope.$digest();
      expect(this.controller.ready).toEqual(true);
      done();
    });

    it('make sure its unavailable if feature toggle not set', function (done) {
      spyOn(this.FeatureToggleService, 'supports').and.callFake(() => {
        return this.$q.resolve(false);
      });
      this.controller.$onInit();
      this.$rootScope.$digest();
      expect(this.controller.ready).toEqual(false);
      done();
    });

  });

});
