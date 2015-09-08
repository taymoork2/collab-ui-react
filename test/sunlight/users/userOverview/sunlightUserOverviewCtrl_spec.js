'use strict';

describe('sunlightUserOverviewCtrl', function () {
  var controller, $scope, $state, $stateParams;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$state_) {
    $scope = $rootScope.$new();
    $state = _$state_;

    //$state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');

    controller = $controller('SunlightUserOverviewCtrl', {
      $scope: $scope,
      $state: $state,
    });

    $scope.$apply();

  }));

  describe('SunlightUserOverviewCtrl', function () {

    it('should call the $state service with the user.list state when closeOverview is called', function () {
      $scope.closePreview();
      expect($state.go).toHaveBeenCalledWith('users.list');
    });

  });

});
