'use strict';

describe('Controller: ListOrganizationsCtrl', function () {
  var controller, $scope, $rootScope, $state, $timeout, Orgservice;
  var OrgserviceResponses;

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, $state, _$timeout_, _Orgservice_) {
    $scope = $rootScope.$new();
    $state = $state;
    $timeout = _$timeout_;
    Orgservice = _Orgservice_;
    OrgserviceResponses = getJSONFixture('core/json/organizations/Orgservice.json');

    $scope.timeoutVal = 1;

    spyOn($state, 'go');

    controller = $controller('ListOrganizationsCtrl', {
      $scope: $scope,
      $state: $state,
      $timeout: $timeout,
      Orgservice: _Orgservice_
    });
    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('shouldnt search if the query.length < 4 characters', function () {
    $scope.filterList('1');
    expect($scope.searchStr).toBe('');
  });

  it('shouldnt search if the query.length >= 4 characters', function () {
    spyOn(Orgservice, 'listOrgs').and.returnValue(false);
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
  });

  it('a proper query should call out to the Orgservice', function () {
    spyOn(Orgservice, 'listOrgs').and.returnValue(false);
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
    expect(Orgservice.listOrgs.calls.any()).toBeTruthy();
  });

  it('should not call out to the Orgservice if the query was not changed', function () {
    spyOn(Orgservice, 'listOrgs').and.returnValue(false);
    $scope.searchStr = '1234';
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
    expect(Orgservice.listOrgs.calls.any()).toBeFalsy();
  });

  it('not changing the query should not call out to the Orgservice', function () {
    spyOn(Orgservice, 'listOrgs').and.callFake(function (filter, callback) {
      callback(OrgserviceResponses.listOrgs, 200);
    });

    $scope.filterList('cisco');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('cisco');
    expect(Orgservice.listOrgs.calls.any()).toBeTruthy();
    expect($scope.placeholder.count).toBe(2);
  });
});
