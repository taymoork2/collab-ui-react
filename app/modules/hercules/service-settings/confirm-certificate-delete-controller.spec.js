'use strict';

describe('Controller: ConfirmCertificateDeleteController', function () {
  var $controller, Notification, CertService, controller, modalInstanceMock, $scope, $q;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  function dependencies($rootScope, _$controller_, _Notification_, _CertService_, _$q_) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    Notification = _Notification_;
    CertService = _CertService_;
    $q = _$q_;
  }

  beforeEach(function () {
    modalInstanceMock = {
      close: {},
    };
    spyOn(modalInstanceMock, 'close');
    spyOn(Notification, 'errorWithTrackingId');

  });

  function initController() {
    controller = $controller('ConfirmCertificateDeleteController', {
      cert: {},
      $modalInstance: modalInstanceMock,
    });
  }

  it('should show a notification when certificate cannot be deleted', function () {
    spyOn(CertService, 'deleteCert').and.returnValue($q.reject());
    initController();
    controller.remove();
    $scope.$apply();
    expect(Notification.errorWithTrackingId.calls.count()).toBe(1);
  });

  it('should call modalInstanse.close if successful', function () {
    spyOn(CertService, 'deleteCert').and.returnValue($q.resolve());
    initController();
    controller.remove();
    $scope.$apply();
    expect(Notification.errorWithTrackingId.calls.count()).toBe(0);
    expect(modalInstanceMock.close.calls.count()).toBe(1);

  });
});
