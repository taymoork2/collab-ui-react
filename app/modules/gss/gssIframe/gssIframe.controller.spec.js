'use strict';

describe('controller:GssIframeCtrl', function () {
  var $controller, $modal, $q, $scope, $state, controller, GSSService;
  var testData = {
    selectedServiceOption: {
      label: 'testServiceOption',
      value: 'testServiceId',
    },
    addServiceOption: {
      label: 'addServiceOption',
      value: 'addService',
    },
    services: [{
      serviceId: 'testServiceId',
    }],
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
    $scope = _$rootScope_.$new();
    $state = _$state_;
    GSSService = _GSSService_;
  }

  function destructDI() {
    $controller = $modal = $q = $scope = $state = controller = GSSService = undefined;
  }

  function initSpies() {
    spyOn(GSSService, 'getServices').and.returnValue($q.resolve(testData.services));
    spyOn(GSSService, 'getServiceId').and.callThrough();
    spyOn($modal, 'open').and.returnValue({
      result: $q.resolve(),
    });
    spyOn($scope, '$broadcast').and.callThrough();
    spyOn($state, 'go');
  }

  function initController() {
    controller = $controller('GssIframeCtrl', {
      $scope: $scope,
      GSSService: GSSService,
      $state: $state,
    });

    $scope.$apply();
  }

  it('addService, should open edit modal, refresh services list and notify edited', function () {
    controller.init();
    controller.addService();

    expect($modal.open).toHaveBeenCalled();
    expect(GSSService.getServices).toHaveBeenCalled();

    $scope.$digest();
    expect($scope.$broadcast).toHaveBeenCalledWith('serviceAdded');
  });

  it('onServiceChanged select add service, should open add service modal dialog', function () {
    controller.selected = testData.addServiceOption;

    controller.onServiceSelectionChanged();
    expect($modal.open).toHaveBeenCalled();
  });

  it('onServiceChanged select an exist service, should set the new service', function () {
    controller.selected = testData.selectedServiceOption;

    controller.onServiceSelectionChanged();
    expect(GSSService.getServiceId()).toEqual(testData.selectedServiceOption.value);
  });

  it('$watch $state.current.name, should go to dashboard when current name is gss', function () {
    controller.init();
    $state.current.name = 'gss';
    $scope.$digest();

    expect($state.go).toHaveBeenCalledWith('gss.dashboard');
  });

  it('event serviceEdited, should refresh options when got event serviceEdited', function () {
    controller.init();
    $scope.$new().$emit('serviceEdited');

    expect(GSSService.getServices).toHaveBeenCalled();
  });

  it('event serviceDeleted, should refresh options when got event serviceDeleted', function () {
    controller.init();
    $scope.$new().$emit('serviceDeleted');

    expect(GSSService.getServices).toHaveBeenCalled();
  });
});
