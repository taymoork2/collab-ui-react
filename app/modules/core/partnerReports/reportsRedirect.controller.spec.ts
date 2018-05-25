import testModule from './index';

describe('Controller: ReportsRedirectCtrl', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      '$state',
      'FeatureToggleService',
    );

    this.ccaReports = false;
    this.sparkReportsToggle = false;
    this.webexReportsToggle = false;

    spyOn(this.$state, 'go');
    spyOn(this.FeatureToggleService, 'supports').and.callFake((toggle: string) => {
      switch (toggle) {
        case this.FeatureToggleService.features.ccaReports:
          return this.$q.resolve(this.ccaReports);
        case this.FeatureToggleService.features.atlasPartnerSparkReports:
          return this.$q.resolve(this.sparkReportsToggle);
        default:
          return this.$q.resolve(this.webexReportsToggle);
      }
    });
  });

  function initController() {
    const controller = this.$controller('ReportsRedirectCtrl', {});
    controller.$onInit();
    this.$scope.$apply();
  }

  it('should redirect to the spark page when all toggles are true', function () {
    this.ccaReports = true;
    this.sparkReportsToggle = true;
    this.webexReportsToggle = true;
    initController.call(this);
    expect(this.$state.go).toHaveBeenCalledWith('partnerreports.tab.spark');
  });

  it('should redirect to the CCA page when CCA toggle is true and Spark toggle is not', function () {
    this.ccaReports = true;
    this.webexReportsToggle = true;
    initController.call(this);
    expect(this.$state.go).toHaveBeenCalledWith('partnerreports.tab.ccaReports.group');
  });

  it('should redirect to the Webex page when only the webex toggle is true', function () {
    this.webexReportsToggle = true;
    initController.call(this);
    expect(this.$state.go).toHaveBeenCalledWith('partnerreports.tab.webexreports.metrics');
  });

  it('should redirect to the unauthorized when none of the toggles are true', function () {
    initController.call(this);
    expect(this.$state.go).toHaveBeenCalledWith('unauthorized');
  });
});
