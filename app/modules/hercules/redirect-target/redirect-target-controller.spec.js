'use strict';

describe('RedirectTargetController', function () {
  var controller, $controller, translateMock, $scope, $q, RedirectTargetService, modalInstanceMock, windowMock;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies($rootScope, _$controller_, _$q_, _RedirectTargetService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    RedirectTargetService = _RedirectTargetService_;
  }

  function initSpies() {
    spyOn(RedirectTargetService, 'addRedirectTarget');
  }

  function initController() {
    translateMock = {
      instant: sinon.stub()
    };

    modalInstanceMock = {
      close: sinon.stub()
    };

    windowMock = {
      open: sinon.stub()
    };

    controller = $controller('RedirectTargetController', {
      $scope: $scope,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      $translate: translateMock
    });
  }

  it('should call the redirect service with hostname', function () {
    RedirectTargetService.addRedirectTarget.and.returnValue($q.when());

    controller.addRedirectTargetClicked("hostname");
    $scope.$apply();

    expect(RedirectTargetService.addRedirectTarget).toHaveBeenCalled();
  });

  it('should close the popup after having done the redirect', function () {
    controller.redirectToTargetAndCloseWindowClicked("hostname");
    expect(modalInstanceMock.close.callCount).toBe(1);
  });

  it('should open a new window with hostname address', function () {
    controller.redirectToTargetAndCloseWindowClicked("hostname");
    expect(windowMock.open.callCount).toBe(1);
    expect(windowMock.open.getCall(0).args[0]).toBe("https://hostname/fusionregistration");
  });

  it('should encode the url properly before calling window open ', function () {
    controller.redirectToTargetAndCloseWindowClicked("hostname/something");
    expect(windowMock.open.callCount).toBe(1);
    expect(windowMock.open.getCall(0).args[0]).toBe("https://hostname%2Fsomething/fusionregistration");
  });

  it('should translate the text when redirect target service returns a 400 error ', function () {
    RedirectTargetService.addRedirectTarget.and.returnValue($q.reject({
      status: 400
    }));

    controller.addRedirectTargetClicked("hostname");
    $scope.$apply();

    expect(translateMock.instant).toHaveBeenCalledWith('hercules.redirect-target-dialog.register-error-400');
  });

  it('should translate the text when redirect target service returns a 500 error ', function () {
    RedirectTargetService.addRedirectTarget.and.returnValue($q.reject({
      status: 500
    }));

    controller.addRedirectTargetClicked("hostname");
    $scope.$apply();

    expect(translateMock.instant).toHaveBeenCalledWith('hercules.redirect-target-dialog.register-error-500');
  });
});
