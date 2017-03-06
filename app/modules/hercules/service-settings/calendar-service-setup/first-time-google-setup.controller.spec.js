'use strict';

describe('Controller: FirstTimeGoogleSetupController', function () {

  var $controller, $scope, $q, CloudConnectorServiceMock, Notification, controller, modalInstanceMock;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  modalInstanceMock = {
    close: sinon.stub(),
  };

  CloudConnectorServiceMock = {
    updateConfig: function () {
      return $q.reject();
    },
  };

  function dependencies(_$controller_, $rootScope, _$q_, _Notification_) {
    $controller = _$controller_;
    $scope = $rootScope.$new();
    $q = _$q_;
    Notification = _Notification_;
  }

  function initSpies() {
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(modalInstanceMock, 'close');
  }

  function initController() {
    controller = $controller('FirstTimeGoogleSetupController', {
      $modalInstance: modalInstanceMock,
      Notification: Notification,
      CloudConnectorService: CloudConnectorServiceMock,
    });
  }

  it('should show an error Notification if the save to CloudConnectorService is rejected', function () {
    controller.uploadKey();
    $scope.$apply();
    expect(Notification.errorWithTrackingId.calls.count()).toBe(1);
  });

  it('should take the user to the users page if he clicks the users link', function () {
    controller.navigateToUsers();
    $scope.$apply();
    expect(modalInstanceMock.close).toHaveBeenCalledWith('users.list');
  });

});
