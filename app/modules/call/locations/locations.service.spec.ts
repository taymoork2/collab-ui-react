import LocationsService from './index';

describe('Service: CallLocations', () => {
  const locationsList =  getJSONFixture('call/locations/locationsList.json');

  //TODO: remove comments and use actual APIs when  API is availble for httpBackend
  beforeEach(function () {
    this.initModules(LocationsService);
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'LocationsService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('111');
    this.LocationsService.getLocations();
  });

  //TODO: Remove Code after the APIs have been integrated
  // afterEach(function () {
  //   this.$httpBackend.verifyNoOutstandingExpectation();
  //   this.$httpBackend.verifyNoOutstandingRequest();
  // });

  xit('should get locations', function() {
    //this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/locations').respond(200, locationsList);
    this.LocationsService.getLocations().then(response => {
      expect(response).toEqual(locationsList);
    });
    //this.$httpBackend.flush();
  });

  it('should get a location', function() {
    //this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/locations/' + '123').respond(200, SUCCESS_DATA[0]);
    this.LocationsService.getLocationDetails(locationsList[0].uuid).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
    //this.$httpBackend.flush();
  });

  it('should remove a location', function() {
    //this.$httpBackend.expectDELETE(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/locations/' + '123').respond(204);
    this.LocationsService.deleteLocation(locationsList[0].uuid).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
    //this.$httpBackend.flush();
  });

  it('should create a new location', function() {
    //this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/locations').respond(201);
    this.LocationsService.createLocation(locationsList[0]).then(response => {
      expect(response).toEqual(locationsList[0]);
    });
    //this.$httpBackend.flush();
  });

  //TODO: Remove x - enable test when we have working APIs
  xit('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/locations').respond(500);
    this.LocationsService.getLocations().then(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
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
