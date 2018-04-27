import testModule from './index';

describe('Component: partnerReportsTabs', function () {
  const sparkTab = {
    state: `partnerreports.tab.spark`,
    title: `reportsPage.sparkReports`,
    $$hashKey: jasmine.any(String),
  };

  const ccaTab = {
    state: `partnerreports.tab.ccaReports.group({ name: 'usage' })`,
    title: `reportsPage.ccaTab`,
    $$hashKey: jasmine.any(String),
  };

  const webexTab = {
    state: `partnerreports.tab.webexreports.metrics`,
    title: `reportsPage.webexReports`,
    $$hashKey: jasmine.any(String),
  };

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
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
    this.compileComponent('partnerReportsTabs', {});
  }

  it('should only show the Spark tab when the spark toggle is true', function () {
    this.sparkReportsToggle = true;
    initController.call(this);
    expect(this.controller.tabs).toEqual([sparkTab]);
    expect(this.$state.go).not.toHaveBeenCalled();
  });

  it('should only show the CCA tab when the CCA toggle is true', function () {
    this.ccaReports = true;
    initController.call(this);
    expect(this.controller.tabs).toEqual([ccaTab]);
    expect(this.$state.go).not.toHaveBeenCalled();
  });

  it('should only show the webex tab when the webex toggle is true', function () {
    this.webexReportsToggle = true;
    initController.call(this);
    expect(this.controller.tabs).toEqual([webexTab]);
    expect(this.$state.go).not.toHaveBeenCalled();
  });

  it('should redirect to unauthorized if no feature toggles are true', function () {
    initController.call(this);
    expect(this.controller.tabs).toEqual([]);
    expect(this.$state.go).toHaveBeenCalledWith('unauthorized');
  });
});
