'use strict';

describe('controller: DeleteServiceCtrl', function () {
  var $controller, $q, $scope, controller, GSSService;

  beforeEach(angular.mock.module('GSS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$controller_, _$q_, _$rootScope_, _GSSService_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = _$rootScope_.$new();
    GSSService = _GSSService_;
  }

  function initSpies() {
    spyOn(GSSService, 'deleteService').and.returnValue($q.when());
  }

  function initController() {
    controller = $controller('DeleteServiceCtrl', {
      $modalInstance: {
        close: sinon.stub()
      },
      theService: {},
      $scope: $scope,
      GSSService: GSSService
    });

    $scope.$apply();
  }

  it('isValid true, with right confirm text', function () {
    controller.confirmText = 'DELETE';

    expect(controller.isValid()).toBe(true);
  });

  it('isValid false, without confirm text', function () {
    expect(controller.isValid()).toBe(false);
  });

  it('deleteService isValid true, call GSSService.deleteService', function () {
    controller.confirmText = 'DELETE';

    controller.deleteService();
    expect(GSSService.deleteService).toHaveBeenCalled();
  });

  it('deleteService isValid false, don\'t call GSSService.deleteService', function () {
    controller.deleteService();
    expect(GSSService.deleteService.calls.count()).toEqual(0);
  });
});
