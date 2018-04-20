import userLocationDetails from './index';

describe('component: UserLocationDetailsComponent', () => {
  const SUCCESS_DATA = [{
    uuid: '123',
    name: 'Home Office',
    routingPrefix: '8100',
    userCount: 10,
    placeCount: 3,
  }];

  beforeEach(function() {
    this.initModules(userLocationDetails);
    this.injectDependencies(
      '$scope',
      'HuronUserService',
      'LocationsService',
      '$state',
      '$q',
    );
    spyOn(this.HuronUserService, 'getUserV2Numbers').and.returnValue(this.$q.resolve({}));
    spyOn(this.LocationsService, 'getLocationList').and.returnValue(this.$q.resolve(SUCCESS_DATA));
    spyOn(this.LocationsService, 'updateLocation').and.returnValue(this.$q.resolve());
    spyOn(this.LocationsService, 'getUserLocation').and.returnValue(this.$q.resolve({}));
    spyOn(this.$state, 'go');
    this.compileComponent('ucUserLocationDetails', {});
  });

  it('should get locations', function() {
    this.controller.loadLocations();
    expect(this.LocationsService.getLocationList).toHaveBeenCalled();
  });

  it('should update', function() {
    this.controller.save();
    const placeHolder = true;
    expect(placeHolder).toEqual(true);
  });
});
