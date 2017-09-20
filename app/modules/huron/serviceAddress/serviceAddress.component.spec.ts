'use strict';

describe('Directive: hrServiceAddress', function () {
  let $q, $httpBackend, $compile, $scope, PstnAreaService, HuronCountryService;
  const SEARCH_BUTTON = '.search-custom';
  const HIDE = 'ng-hide';
  let element;

  const location = {
    zipName: 'Zip Code',
    typeName: 'State',
    areas: [{
      name: 'Texas',
      abbreviation: 'TX',
    }],
  };

  const countries = [{
    id: 'US',
    name: 'United States',
  }];

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$q_, _$httpBackend_, _$compile_, $rootScope, _PstnAreaService_, _HuronCountryService_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    PstnAreaService = _PstnAreaService_;
    HuronCountryService = _HuronCountryService_;

    $scope.myAddress = {
      streetAddress: '123 My Street',
      city: 'Richardson',
      state: 'TX',
      zip: '75082',
    };

    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});
    spyOn(PstnAreaService, 'getCountryAreas').and.returnValue($q.resolve(location));
    spyOn(HuronCountryService, 'getCountryList').and.returnValue($q.resolve(countries));

    this.expectedId = 'id="streetAddress"';
    this.expectedAddressLine1 = '123 MY STREET';
    this.expectedAddressLine2 = 'RICHARDSON, TX 75082';
  }));

  it('should show the address form inputs', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();

    expect(element.html()).toContain(this.expectedId);
    expect(element.text()).not.toContain(this.expectedAddressLine1);
    expect(element.text()).not.toContain(this.expectedAddressLine2);
  });

  it('should show the address text', function () {
    $scope.readOnly = true;
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();

    expect(element.html()).toContain(this.expectedId);
    expect(element.text()).toContain(this.expectedAddressLine1);
    expect(element.text()).toContain(this.expectedAddressLine2);
  });
  it('should have search button hidden if hide-search is true', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly" hide-search="true"><hr-service-address/>')($scope);
    $scope.$apply();
    expect(element.find(SEARCH_BUTTON).hasClass(HIDE)).toBe(true);
  });

  it('should have search button enabled if hide-search is undefined', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();
    expect(element.find(SEARCH_BUTTON).hasClass(HIDE)).toBe(false);
  });

  it('should have search button enabled if hide-search is false', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly" hide-search="false"><hr-service-address/>')($scope);
    $scope.$apply();
    expect(element.find(SEARCH_BUTTON).hasClass(HIDE)).toBe(false);
  });

});
