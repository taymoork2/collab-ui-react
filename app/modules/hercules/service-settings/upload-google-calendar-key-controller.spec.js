'use strict';

describe('Controller: UploadGoogleCalendarKeyController', function () {

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  var controller, $controller, $q, $scope, Notification, CloudConnectorServiceMock, modalInstanceMock;


  beforeEach(inject(function (_$controller_, _$q_, $rootScope, _Notification_) {
    $controller = _$controller_;
    $q = _$q_;
    $scope = $rootScope.$new();
    Notification = _Notification_;

    initMocks();
    initSpies();
    initController();
  }));

  function initMocks() {
    CloudConnectorServiceMock = {
      updateConfig: function () {
        return $q.resolve();
      },
    };
    modalInstanceMock = {
      close: sinon.stub(),
    };
  }

  function initSpies() {
    spyOn(Notification, 'success');
  }

  function initController() {
    controller = $controller('UploadGoogleCalendarKeyController', {
      CloudConnectorService: CloudConnectorServiceMock,
      $modalInstance: modalInstanceMock,
      aclAccount: 'admin@example.org',
      googleServiceAccount: 'test@example.org',
      Notification: Notification,
    });
    $scope.$apply();
  }

  it('should show a green notification when a certificate is successfully uploaded', function () {
    controller.uploadCertificate();
    $scope.$apply();
    expect(Notification.success.calls.count()).toBe(1);
  });


});
