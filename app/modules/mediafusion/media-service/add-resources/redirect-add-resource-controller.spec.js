'use strict';

describe('RedirectAddResourceController', function () {
  beforeEach(module('wx2AdminWebClientApp'));
  var vm, controller, cluster, RedirectTargetService, redirectTargetServiceMock, redirectTargetPromise, mediaClusterServiceMock, MediaClusterService, $q, XhrNotificationService, log, $modal, modalInstanceMock, windowMock;
  var hostname = "MFA";
  var enteredCluster = "blr-ecp-246";

  beforeEach(inject(function ($controller, _RedirectTargetService_, _$q_, _XhrNotificationService_, $log, _$modal_) {

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
    log = $log;
    log.reset();
    $modal = _$modal_;

    controller = $controller('RedirectAddResourceController', {
      RedirectTargetService: redirectTargetServiceMock,
      MediaClusterService: mediaClusterServiceMock,
      $q: $q,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      XhrNotificationService: XhrNotificationService,
      log: log,
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
