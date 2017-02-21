'use strict';

describe('controller: GSSServicesCtrl', function () {
  var $controller, $modal, $q, $rootScope, $scope, $state, controller, GSSService;
  var testData = {
    deleteCommand: 'DELETE',
    serviceForDelete: {
      serviceId: 'testServiceId',
    },
  };

  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  afterAll(function () {
    testData = undefined;
  });
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$modal_, _$q_, _$rootScope_, _$state_, _GSSService_) {
    $controller = _$controller_;
    $modal = _$modal_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_.$new();
    $state = _$state_;
    GSSService = _GSSService_;
  }

  function destructDI() {
    $controller = $modal = $q = $rootScope = $scope = $state = controller = GSSService = undefined;
  }

  function initSpies() {
    spyOn(GSSService, 'getServices').and.returnValue($q.resolve());
    spyOn($modal, 'open').and.returnValue({
      result: $q.resolve(),
    });
    spyOn($state, 'go');
    spyOn($scope, '$emit').and.callThrough();
  }

  function initController() {
    controller = $controller('GSSServicesCtrl', {
      $modal: $modal,
      $scope: $scope,
      $state: $state,
      GSSService: GSSService,
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

  it('deleteService, should go to delete page', function () {
    controller.deleteService(testData.serviceForDelete);

    expect($state.go).toHaveBeenCalledWith('gss.services.delete', {
      service: testData.serviceForDelete,
    });
  });

  it('event serviceAdded, should refresh service when got event serviceAdded', function () {
    $rootScope.$broadcast('serviceAdded');

    expect(GSSService.getServices).toHaveBeenCalled();
  });
});
