'use strict';

describe('controller: AddServiceCtrl', function () {
  var $controller, $q, $scope, controller, GSSService;

  beforeEach(angular.mock.module('GSS'));
  afterEach(destructDI);
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$q_, _$rootScope_, _GSSService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    GSSService = _GSSService_;
  }

  function destructDI() {
    $controller = $q = $scope = controller = GSSService = undefined;
  }

  function initSpies() {
    spyOn(GSSService, 'addService').and.returnValue($q.resolve());
  }

  function initController() {
    controller = $controller('AddServiceCtrl', {
      $modalInstance: {
        close: sinon.stub(),
      },
      $scope: $scope,
      GSSService: GSSService,
    });

    $scope.$apply();
  }

  it('isValid true, with service name', function () {
    controller.serviceName = 'testServiceName';

    expect(controller.isValid()).toBe(true);
  });

  it('isValid false, without service name', function () {
    expect(controller.isValid()).toBe(false);
  });

  it('addService isValid true, call GSSService.addService', function () {
    controller.serviceName = 'testServiceName';

    controller.addService();
    expect(GSSService.addService).toHaveBeenCalled();
  });

  it('addService isValid false, don\'t call GSSService.addService', function () {
    controller.addService();
    expect(GSSService.addService.calls.count()).toEqual(0);
  });
});
