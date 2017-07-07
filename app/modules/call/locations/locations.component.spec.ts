import callLocations from './index';

describe('Component: CallLocationsComponent', () => {
  const STATE_RELOAD: string = 'STATE_RELOAD';

  beforeEach(function() {
    this.initModules(callLocations);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      'CardUtils',
      '$state',
      '$q',
    );
    spyOn(this.LocationsService, 'getLocations').and.returnValue(this.$q.reject());
    spyOn(this.$state, 'go');
    this.compileComponent('callLocations', {});
  });

  it('should have pageState equal STATE_RELOAD', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(STATE_RELOAD);
  });

  it('should reload the page', function() {
    this.controller.reload();
    expect(this.$state.go).toHaveBeenCalled();
  });
});

describe('Component: CallLocationsComponent', () => {
  const STATE_NEW_LOCATION: string = 'STATE_NEW_LOCATION';

  beforeEach(function() {
    this.initModules(callLocations);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      'CardUtils',
      '$state',
      '$q',
    );
    spyOn(this.LocationsService, 'getLocations');
    this.LocationsService.getLocations.and.returnValue(this.$q.resolve([]));
    this.compileComponent('callLocations', {});
  });

  it('should have pageState equal STATE_NEW_LOCATION', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(STATE_NEW_LOCATION);
  });
});

describe('Component: CallLocationsComponent', () => {
  const STATE_SHOW_LOCATIONS: string = 'STATE_SHOW_LOCATIONS';
  const SUCCESS_DATA = [{
    uuid: '123',
    name: 'Home Office',
    routingPrefix: '8100',
    userCount: 10,
    placeCount: 3,
  }];

  beforeEach(function() {
    this.initModules(callLocations);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      'CardUtils',
      '$state',
      '$q',
    );
    spyOn(this.LocationsService, 'getLocations');
    spyOn(this.LocationsService, 'filterCards');
    this.LocationsService.getLocations.and.returnValue(this.$q.resolve(SUCCESS_DATA));
    this.compileComponent('callLocations', {});
  });

  it('should have pageState equal STATE_SHOW_LOCATIONS', function() {
    this.controller.$onInit();
    expect(this.controller.pageState).toBe(STATE_SHOW_LOCATIONS);
  });

});
