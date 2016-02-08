'use strict';

describe('RedirectAddResourceController', function () {
  beforeEach(module('wx2AdminWebClientApp'));
  var controller, redirectTargetServiceMock, modalInstanceMock, redirectTargetPromise, windowMock, mediaClusterServiceMock;

  beforeEach(inject(function ($controller) {
    redirectTargetPromise = {
      then: sinon.stub()
    };

    redirectTargetServiceMock = {
      addRedirectTarget: sinon.stub().returns(redirectTargetPromise)
    };
    mediaClusterServiceMock = {
      getGroups: sinon.stub().returns(redirectTargetPromise)
    };
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };

    controller = $controller('RedirectAddResourceController', {
      RedirectTargetService: redirectTargetServiceMock,
      MediaClusterService: mediaClusterServiceMock,
      $modalInstance: modalInstanceMock,
      $window: windowMock
    });
  }));

  it('should call the redirect service with hostname and cluster name', function () {
    controller.addRedirectTargetClicked("hostname", "enteredCluster");
    expect(redirectTargetServiceMock.addRedirectTarget.callCount).toBe(1);
  });

});
