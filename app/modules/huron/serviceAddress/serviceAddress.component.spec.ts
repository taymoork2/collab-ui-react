'use strict';

describe('Directive: hrServiceAddress', function () {
  let $q, $httpBackend, $compile, $scope, PstnSetupStatesService, HuronCountryService;
  let SEARCH_BUTTON = '.search-custom';
  let HIDE = 'ng-hide';
  let element;

  let location = {
    type: 'State',
    areas: [{
      name: 'Texas',
      abbreviation: 'TX',
    }],
  };

  let countries = [{
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

  beforeEach(inject(function (_$q_, _$httpBackend_, _$compile_, $rootScope, _PstnSetupStatesService_, _HuronCountryService_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    PstnSetupStatesService = _PstnSetupStatesService_;
    HuronCountryService = _HuronCountryService_;

    $scope.myAddress = {
      streetAddress: '123 My Street',
      city: 'Richardson',
      state: 'TX',
      zip: '75082',
    };

    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});
    spyOn(PstnSetupStatesService, 'getLocation').and.returnValue($q.resolve(location));
    spyOn(HuronCountryService, 'getCountryList').and.returnValue($q.resolve(countries));
  }));

  it('should show the address form inputs', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();

    expect(element.html()).toContain('id="streetAddress"');
    expect(element.text()).not.toContain('123 MY STREET');
    expect(element.text()).not.toContain('RICHARDSON, TX  75082');
  });

  it('should show the address text', function () {
    $scope.readOnly = true;
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();

    expect(element.html()).toContain('id="streetAddress"');
    expect(element.text()).toContain('123 MY STREET');
    expect(element.text()).toContain('RICHARDSON, TX  75082');
  });
  it('should have search button hidden if hide-search is true', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly" ::hide-search="true"><hr-service-address/>')($scope);
    $scope.$apply();
    expect(element.find(SEARCH_BUTTON).hasClass(HIDE)).toBe(true);
  });

  it('should have search button enabled if hide-search is undefined', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();
    expect(element.find(SEARCH_BUTTON).hasClass(HIDE)).toBe(false);
  });

  it('should have search button enabled if hide-search is false', function () {
    element = $compile('<hr-service-address address="myAddress" read-only="readOnly" ::hide-search="false"><hr-service-address/>')($scope);
    $scope.$apply();
    expect(element.find(SEARCH_BUTTON).hasClass(HIDE)).toBe(false);
  });

});
