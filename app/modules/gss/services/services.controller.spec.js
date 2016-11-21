'use strict';

describe('controller: GSSServicesCtrl', function () {
  var $controller, $modal, $q, $rootScope, $scope, controller, GSSService;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$modal_, _$q_, _$rootScope_, _GSSService_) {
    $controller = _$controller_;
    $modal = _$modal_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    GSSService = _GSSService_;
  }

  function initSpies() {
    spyOn(GSSService, 'getServices').and.returnValue($q.when());
    spyOn($modal, 'open').and.returnValue({
      result: $q.when()
    });
    spyOn($scope, '$emit').and.callThrough();
  }

  function initController() {
    controller = $controller('GSSServicesCtrl', {
      $modal: $modal,
      $scope: $scope,
      GSSService: GSSService
    });

    $scope.$apply();
  }

  it('editService, should open edit modal, refresh services list and notify edited', function () {
    controller.editService();

    expect($modal.open).toHaveBeenCalled();
    expect(GSSService.getServices).toHaveBeenCalled();

    $scope.$digest();
    expect($scope.$emit).toHaveBeenCalledWith('serviceEdited');
  });

  it('editService, should open delete modal, refresh services list and notify deleted', function () {
    controller.deleteService();

    expect($modal.open).toHaveBeenCalled();
    expect(GSSService.getServices).toHaveBeenCalled();

    $scope.$digest();
    expect($scope.$emit).toHaveBeenCalledWith('serviceDeleted');
  });

  it('event serviceAdded, should refresh service when got event serviceAdded', function () {
    $rootScope.$broadcast('serviceAdded');

    expect(GSSService.getServices).toHaveBeenCalled();
  });
});
