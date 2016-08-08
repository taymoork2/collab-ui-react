'use strict';

describe('RedirectAddResourceController', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var controller, redirectTargetServiceMock, redirectTargetPromise, mediaClusterServiceMock, $q, XhrNotificationService, $modal, modalInstanceMock, windowMock;
  var hostname = "MFA";
  var enteredCluster = "blr-ecp-246";

  beforeEach(inject(function ($controller, _$q_, _XhrNotificationService_, _$modal_) {

    redirectTargetPromise = {
      then: sinon.stub()
    };

    redirectTargetServiceMock = {
      addRedirectTarget: sinon.stub().returns(redirectTargetPromise)
    };
    mediaClusterServiceMock = {
      getGroups: sinon.stub().returns(redirectTargetPromise),
      getClusterList: sinon.stub().returns(redirectTargetPromise)
    };

    $q = _$q_;
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    XhrNotificationService = _XhrNotificationService_;
    $modal = _$modal_;

    controller = $controller('RedirectAddResourceController', {
      RedirectTargetService: redirectTargetServiceMock,
      MediaClusterService: mediaClusterServiceMock,
      $q: $q,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      XhrNotificationService: XhrNotificationService,
      $modal: $modal

    });

  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should call the redirect service with hostname and cluster name', function () {
    controller.addRedirectTargetClicked("hostname", "enteredCluster");
    expect(redirectTargetServiceMock.addRedirectTarget.callCount).toBe(1);
  });

  it('should call the getClusterList', function () {
    controller.getClusters();
    expect(mediaClusterServiceMock.getClusterList).toHaveBeenCalled();
    expect(mediaClusterServiceMock.getClusterList.callCount).toBe(2);
  });

  it('should call the addRedirectTargetClicked with hostname and cluster name', function () {
    controller.addRedirectTargetClicked(hostname, enteredCluster);
    expect(redirectTargetServiceMock.addRedirectTarget).toHaveBeenCalled();
    expect(controller.enableRedirectToTarget).toBe(false);
    expect(redirectTargetServiceMock.addRedirectTarget.callCount).toBe(1);
  });

  it('should call the getGroups ', function () {
    controller.getGroups();
    expect(mediaClusterServiceMock.getGroups).toHaveBeenCalled();
    expect(controller.enableRedirectToTarget).toBe(false);
    expect(mediaClusterServiceMock.getGroups.callCount).toBe(2);
  });

});
