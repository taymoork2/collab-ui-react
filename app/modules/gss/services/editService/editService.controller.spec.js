'use strict';

describe('controller: EditServiceCtrl', function () {
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
    spyOn(GSSService, 'modifyService').and.returnValue($q.resolve());
  }

  function initController() {
    controller = $controller('EditServiceCtrl', {
      $modalInstance: {
        close: sinon.stub(),
      },
      theService: {},
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

  it('editService isValid true, call GSSService.modifyService', function () {
    controller.serviceName = 'testServiceName';

    controller.editService();
    expect(GSSService.modifyService).toHaveBeenCalled();
  });

  it('editService isValid false, don\'t call GSSService.modifyService', function () {
    controller.editService();
    expect(GSSService.modifyService.calls.count()).toEqual(0);
  });
});
