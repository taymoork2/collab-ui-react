'use strict';

describe('controller:GssIframeCtrl', function () {
  var $controller, $modal, $q, $scope, $state, controller, GSSService;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$modal_, _$q_, _$rootScope_, _$state_, _GSSService_) {
    $controller = _$controller_;
    $modal = _$modal_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    GSSService = _GSSService_;
  }

  function initSpies() {
    spyOn(GSSService, 'getServices').and.returnValue($q.when());
    spyOn($modal, 'open').and.returnValue({
      result: $q.when()
    });
    spyOn($scope, '$broadcast').and.callThrough();
  }

  function initController() {
    controller = $controller('GssIframeCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      $state: $state
    });

    $scope.$apply();
  }

  it('addService, should open edit modal, refresh services list and notify edited', function () {
    controller.addService();

    expect($modal.open).toHaveBeenCalled();
    expect(GSSService.getServices).toHaveBeenCalled();

    $scope.$digest();
    expect($scope.$broadcast).toHaveBeenCalledWith('serviceAdded');
  });

  it('event serviceEdited, should refresh options when got event serviceEdited', function () {
    $scope.$new().$emit('serviceEdited');

    expect(GSSService.getServices).toHaveBeenCalled();
  });

  it('event serviceDeleted, should refresh options when got event serviceDeleted', function () {
    $scope.$new().$emit('serviceDeleted');

    expect(GSSService.getServices).toHaveBeenCalled();
  });
});
