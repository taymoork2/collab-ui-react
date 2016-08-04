'use strict';

describe('Controller: ListOrganizationsCtrl', function () {
  var controller, $scope, $rootScope, $state, $q, $timeout, Orgservice;

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, $controller, $state, $q, _$timeout_, _Orgservice_) {
    $scope = $rootScope.$new();
    $state = $state;
    $q = $q;
    $timeout = _$timeout_;
    Orgservice = _Orgservice_;

    var orgServiceResponses = getJSONFixture('core/json/organizations/Orgservice.json');
    var listOrgs = orgServiceResponses.listOrgs;
    spyOn(Orgservice, 'listOrgs').and.returnValue($q.when(listOrgs));

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
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
  });

  it('a proper query should call out to the Orgservice', function () {
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
    expect(Orgservice.listOrgs.calls.any()).toBeTruthy();
  });

  it('should not call out to the Orgservice if the query was not changed', function () {
    $scope.searchStr = '1234';
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
    expect(Orgservice.listOrgs.calls.any()).toBeFalsy();
  });

  it('not changing the query should not call out to the Orgservice', function () {
    $scope.filterList('cisco');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('cisco');
    expect(Orgservice.listOrgs.calls.any()).toBeTruthy();
    expect($scope.placeholder.count).toBe(2);
  });
});
