import googleCalendarModule from './index';

describe('Component: googleCalendarFirstTimeSetup ', function () {
  beforeEach(function () {
    this.initModules('Hercules', googleCalendarModule);
    this.injectDependencies('$componentController', '$q', '$scope', '$state', 'CloudConnectorService');

    spyOn(this.CloudConnectorService, 'getApiKey').and.returnValue(this.$q.resolve({
      apiClientId: 'clientName',
      scopes: [''],
    }));

    this.controller = this.$componentController('googleCalendarFirstTimeSetup', {
      CloudConnectorService: this.CloudConnectorService,
      FeatureToggleService: this.FeatureToggleService,
    });
    this.controller.$onInit();
    this.$scope.$apply();
  });

  it('should initialize with expected data', function () {
    expect(this.controller.data.clientName).toEqual('clientName');
    expect(this.controller.data.scope).toEqual('');
  });
});
