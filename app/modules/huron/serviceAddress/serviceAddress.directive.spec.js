'use strict';

describe('Directive: hrServiceAddress', function () {
  var $httpBackend, $compile, $scope;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$httpBackend_, _$compile_, $rootScope) {
    $httpBackend = _$httpBackend_;
    $compile = _$compile_;
    $scope = $rootScope.$new();

    $scope.myAddress = {
      streetAddress: '123 My Street',
      city: 'Richardson',
      state: 'TX',
      zip: '75082'
    };

    $httpBackend.whenGET('modules/huron/pstnSetup/states.json').respond([{
      name: "Texas",
      abbreviation: "TX"
    }]);
  }));

  it('should show the address form inputs', function () {
    var element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();

    expect(element.html()).toContain('id="streetAddress"');
    expect(element.text()).not.toContain('123 MY STREET');
    expect(element.text()).not.toContain('RICHARDSON, TX  75082');
  });

  it('should show the address text', function () {
    $scope.readOnly = true;
    var element = $compile('<hr-service-address address="myAddress" read-only="readOnly"><hr-service-address/>')($scope);
    $scope.$apply();

    expect(element.html()).toContain('id="streetAddress"');
    expect(element.text()).toContain('123 MY STREET');
    expect(element.text()).toContain('RICHARDSON, TX  75082');
  });
});
