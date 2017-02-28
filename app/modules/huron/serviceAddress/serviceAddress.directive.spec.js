'use strict';

describe('Directive: hrServiceAddress', function () {
  var $q, $httpBackend, $compile, $scope, PstnSetupStatesService;
  var SEARCH_BUTTON = '.search-custom';
  var HIDE = 'ng-hide';
  var element;

  var location = {
    type: 'State',
    areas: [{
      name: 'Texas',
      abbreviation: 'TX',
    }],
  };

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
  });

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$q_, _$httpBackend_, _$compile_, $rootScope, _PstnSetupStatesService_) {
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    PstnSetupStatesService = _PstnSetupStatesService_;

    $scope.myAddress = {
      streetAddress: '123 My Street',
      city: 'Richardson',
      state: 'TX',
      zip: '75082',
    };

    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});
    spyOn(PstnSetupStatesService, 'getLocation').and.returnValue($q.resolve(location));
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
