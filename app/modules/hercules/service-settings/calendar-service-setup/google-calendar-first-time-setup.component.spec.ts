import googleCalendarModule from './index';

describe('Component: googleCalendarFirstTimeSetup ', function () {
  beforeEach(function () {
    this.initModules('Hercules', googleCalendarModule);
    this.injectDependencies('$componentController', '$q', '$scope', '$state', 'CloudConnectorService', 'FeatureToggleService');

    spyOn(this.FeatureToggleService, 'atlas2017NameChangeGetStatus').and.returnValue(this.$q.resolve(false));
    spyOn(this.CloudConnectorService, 'getApiKey').and.returnValue(this.$q.resolve({
      clientName: 'clientName',
      scopes: [''],
    }));

    this.initController = (): void => {
      this.controller = this.$componentController('googleCalendarFirstTimeSetup', {
        CloudConnectorService: this.CloudConnectorService,
        FeatureToggleService: this.FeatureToggleService,
      });
      this.controller.$onInit();
      this.$scope.$apply();
    };
    this.initController();
  });

  // 2017 name change
  it('nameChangeEnabled should match the return value of atlas2017NameChangeGetStatus', function () {
    expect(this.controller.nameChangeEnabled).toBeFalsy();

    this.FeatureToggleService.atlas2017NameChangeGetStatus.and.returnValue(this.$q.resolve(true));
    this.initController();
    expect(this.controller.nameChangeEnabled).toBeTruthy();
  });
});
