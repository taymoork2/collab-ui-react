import googleCalendarModule from './index';

describe('Component: googleCalendarSecondTimeSetup', function () {
  beforeEach(function() {
    this.initModules(googleCalendarModule, 'Hercules');
    this.injectDependencies(
      '$scope',
      'Authinfo',
      'CloudConnectorService',
      'FeatureToggleService',
      '$q',
    );

    spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue('dummyEmail');
    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.CloudConnectorService, 'getApiKey').and.returnValue(this.$q.resolve({
      apiClientId: 'apiClientId',
      scopes: [''],
    }));
  });

  // 2017 name change
  it('new name usage should depend on atlas2017NameChangeGetStatus', function () {
    this.compileComponent('googleCalendarSecondTimeSetup', { });
    expect(this.view.text()).toContain('hercules.gcalSecondSetupModal.line1');
    expect(this.view.text()).not.toContain('hercules.gcalSecondSetupModal.line1New');

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.compileComponent('googleCalendarSecondTimeSetup', { });
    expect(this.view.text()).toContain('hercules.gcalSecondSetupModal.line1New');
  });
});
