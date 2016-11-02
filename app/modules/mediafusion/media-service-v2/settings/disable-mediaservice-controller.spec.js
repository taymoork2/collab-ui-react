'use strict';

describe('Controller: DisableMediaServiceController', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(angular.mock.module('Hercules'));

  var controller, MediaClusterServiceV2, $q, MediaServiceActivationV2, Notification, httpMock;

  // var serviceId = "squared-fusion-media";
  var modalInstance = {
    dismiss: sinon.stub(),
    close: sinon.stub()
  };
  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($state, $controller, _$q_, $translate, _MediaServiceActivationV2_, _Notification_, _MediaClusterServiceV2_, _$httpBackend_) {
    $q = _$q_;
    MediaServiceActivationV2 = _MediaServiceActivationV2_;
    Notification = _Notification_;
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    sinon.stub($state, 'go');
    httpMock = _$httpBackend_;
    httpMock.when('GET', /^\w+.*/).respond({});
    controller = $controller('DisableMediaServiceController', {
      $state: $state,
      $q: $q,
      $modalInstance: modalInstance,
      $translate: $translate,

      MediaServiceActivationV2: MediaServiceActivationV2,
      Notification: Notification,
      MediaClusterServiceV2: MediaClusterServiceV2
    });
  }));

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });
  it('should call the dismiss for cancel', function () {
    spyOn(modalInstance, 'dismiss');
    controller.cancel();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });
  it('should change the value of step to 2 for continue', function () {
    spyOn(controller, 'step');
    controller.continue();
    expect(controller.step).toBe('2');
  });
  it('should call the MediaClusterServiceV2 deleteClusterWithConnector for deactivate', function () {
    var respnse = {
      'status': 204
    };
    spyOn(MediaClusterServiceV2, 'deleteClusterWithConnector').and.returnValue($q.when(respnse));
    spyOn(MediaServiceActivationV2, 'setServiceEnabled');
    spyOn(MediaServiceActivationV2, 'setisMediaServiceEnabled');
    spyOn(MediaServiceActivationV2, 'setServiceAcknowledged');
    spyOn(MediaServiceActivationV2, 'disableOrpheusForMediaFusion');
    spyOn(Notification, 'success');
    spyOn(modalInstance, 'close');
    controller.clusterIds = ['cluster1', 'cluster2'];
    controller.deactivate();
    httpMock.verifyNoOutstandingExpectation();
    expect(MediaClusterServiceV2.deleteClusterWithConnector).toHaveBeenCalled();
    expect(MediaClusterServiceV2.deleteClusterWithConnector.calls.count()).toEqual(2);
    expect(MediaServiceActivationV2.setServiceEnabled).toHaveBeenCalled();
    expect(MediaServiceActivationV2.setisMediaServiceEnabled).toHaveBeenCalled();
    expect(MediaServiceActivationV2.setServiceAcknowledged).toHaveBeenCalled();
    expect(MediaServiceActivationV2.disableOrpheusForMediaFusion).toHaveBeenCalled();
    expect(Notification.success).toHaveBeenCalled();
    expect(modalInstance.close).toHaveBeenCalled();
  });
  it('should notify error when deactivate call fails', function () {
    spyOn(MediaClusterServiceV2, 'deleteClusterWithConnector').and.returnValue($q.when({
      'status': 500
    }));
    spyOn(Notification, 'error');
    spyOn(modalInstance, 'close');
    controller.clusterIds = ['cluster1', 'cluster2'];
    controller.deactivate();
    httpMock.verifyNoOutstandingExpectation();
    expect(MediaClusterServiceV2.deleteClusterWithConnector).toHaveBeenCalled();
    expect(Notification.error).toHaveBeenCalled();
    expect(modalInstance.close).toHaveBeenCalled();
  });
});
