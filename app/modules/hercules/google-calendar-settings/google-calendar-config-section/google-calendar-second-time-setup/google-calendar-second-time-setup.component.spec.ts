import googleCalendarModule from './index';

describe('Component: googleCalendarSecondTimeSetup', function () {
  beforeEach(function() {
    this.initModules(googleCalendarModule, 'Hercules');
    this.injectDependencies(
      '$scope',
      'Authinfo',
      'CloudConnectorService',
      '$q',
    );

    spyOn(this.Authinfo, 'getPrimaryEmail').and.returnValue('dummyEmail');
    spyOn(this.CloudConnectorService, 'getApiKey').and.returnValue(this.$q.resolve({
      apiClientId: 'apiClientId',
      scopes: [''],
    }));
  });
});
