'use strict';

describe('RedirectTargetController', function () {
  beforeEach(module('Hercules'));
  var controller, redirectTargetServiceMock, modalInstanceMock, redirectTargetPromise, windowMock, translateMock, $q;

  beforeEach(inject(function ($controller, _$q_) {
    redirectTargetPromise = {
      then: sinon.stub()

    };
    $q = _$q_;

    redirectTargetServiceMock = {
      addRedirectTarget: sinon.stub().returns(redirectTargetPromise)
    };
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    translateMock = {
      instant: sinon.stub()
    };

    controller = $controller('RedirectTargetController', {
      RedirectTargetService: redirectTargetServiceMock,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      $translate: translateMock
    });
  }));

  it('should call the redirect service with hostname', function () {
    controller.addRedirectTargetClicked("hostname");
    expect(redirectTargetServiceMock.addRedirectTarget.callCount).toBe(1);
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

  fit('should translate the text for a 400 error ', function () {
    redirectTargetServiceMock.addRedirectTarget.returns($q.reject());

    controller.addRedirectTargetClicked("hostname");

    expect(translateMock.instant.callCount).toBe(1);
  });
});
