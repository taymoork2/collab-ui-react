'use strict';

describe('Controller: ListOrganizationsCtrl', function () {
  var controller, $scope, $rootScope, $state, $translate, $timeout, Log, Config, Orgservice;

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, $state, _$timeout_, _Orgservice_) {
    $scope = $rootScope.$new();
    $state = $state;
    $timeout = _$timeout_;
    Orgservice = _Orgservice_;

    spyOn($state, 'go');
    spyOn(Orgservice, 'listOrgs').and.returnValue(false);

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
    $scope.timeoutVal = 1;
    $scope.filterList('1234');
    $timeout.flush($scope.timeoutVal);
    expect($scope.searchStr).toBe('1234');
  });
});
