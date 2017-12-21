import LocationsService from './index';

describe('Service: LocationsService', () => {
  const locationsList =  getJSONFixture('call/locations/locationsList.json');

  beforeEach(function () {
    this.initModules(LocationsService);
    this.injectDependencies(
      '$q',
      '$scope',
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'LocationsService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1111-BBBB-AAAA-DDDD');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });


  it('should get locations', function() {
    this.$httpBackend.expectGET(/locations/).respond(200, { locations: locationsList });
    this.LocationsService.getLocationList().then(response => {
      expect(response.length).toEqual(locationsList.length);
    });
    this.$httpBackend.flush();
  });

  it('should get a location', function() {
    this.$httpBackend.expectGET(/locations/).respond(200, locationsList[0]);
    this.LocationsService.getLocation(locationsList[0].uuid).then(response => {
      expect(response.uuid).toEqual(locationsList[0].uuid);
    });
    this.$httpBackend.flush();
  });

  it('should remove a location', function() {
    this.$httpBackend.expectDELETE(/locations/).respond(204);
    this.LocationsService.deleteLocation(locationsList[0].uuid);
    this.$httpBackend.flush();
  });

  it('should create a new location', function() {
    const headers = { Location: 'locations/new_uuid' };
    this.$httpBackend.expectPOST(/locations/).respond(201, '', headers);
    this.LocationsService.createLocation(locationsList[0]).then(response => {
      expect(response).toEqual(headers.Location);
    });
    this.$httpBackend.flush();
  });


  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(/locations/).respond(500);
    this.LocationsService.getLocationList().then(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
    });
    this.$httpBackend.flush();
  });

  it('should get a user location', function() {
    this.$httpBackend.expectGET(/users/).respond(200, { location: locationsList[0] });
    this.LocationsService.getUserLocation(locationsList[0].uuid).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
    this.$httpBackend.flush();
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
