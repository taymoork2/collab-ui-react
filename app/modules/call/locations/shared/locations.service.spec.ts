import LocationsService from './index';

describe('Service: CallLocations', () => {
  const locationsList =  getJSONFixture('call/locations/locationsList.json');

  beforeEach(function () {
    this.initModules(LocationsService);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'LocationsService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('111');
    this.LocationsService.getLocationList();
  });


  it('should get locations', function() {
    this.LocationsService.getLocationList().then(response => {
      expect(response).toEqual(locationsList);
    });
  });

  it('should get a location', function() {
    this.LocationsService.getLocation(locationsList[0].uuid).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
  });

  it('should remove a location', function() {
    this.LocationsService.deleteLocation(locationsList[0].uuid).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
  });

  it('should create a new location', function() {
    this.LocationsService.createLocation(locationsList[0]).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
  });


  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/locations').respond(500);
    this.LocationsService.getLocationList().then(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
    });
  });

  it('should get a user location', function() {
    this.LocationsService.getUserLocation(locationsList[0].uuid).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
  });

  it('should return all locations if Empty search string ', function () {
    expect(this.LocationsService.filterCards(locationsList, '').length).toBe(3);
  });

  it('should return matching locations if search string is passed', function () {
    expect(this.LocationsService.filterCards(locationsList, 'Home').length).toBe(2);
  });

  it('should return empty if search string passed does not match the name', function () {
    expect(this.LocationsService.filterCards(locationsList, 'test').length).toBe(0);
  });

});
