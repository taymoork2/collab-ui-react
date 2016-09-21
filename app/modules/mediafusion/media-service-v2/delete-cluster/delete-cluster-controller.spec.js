'use strict';

describe('Controller: DeleteClusterSettingControllerV2', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var $q, httpBackend, controller, cluster, $modalInstance, $filter, MediaClusterServiceV2, $state, $translate, XhrNotificationService, Notification;

  beforeEach(inject(function ($httpBackend, _MediaClusterServiceV2_, $controller, _$filter_, _$state_, _$translate_, _XhrNotificationService_, _Notification_, _$q_) {
    cluster = {
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST1",
      "connectors": [{
        "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
        "connectorType": "mf_mgmt",
        "upgradeState": "upgraded",
        "hostname": "10.196.5.251"
      }, {
        "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
        "connectorType": "mf_mgmt",
        "hostname": "10.196.5.246"
      }],
      "releaseChannel": "DEV"
    };
    $modalInstance = {
      close: sinon.stub()
    };
    $filter = _$filter_;
    /*
        MediaClusterServiceV2 = {
          get: sinon.stub().returns(redirectTargetPromise),
          getAll: sinon.stub().returns(redirectTargetPromise),
        };
    */
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    $state = _$state_;
    $translate = _$translate_;
    XhrNotificationService = _XhrNotificationService_;
    Notification = _Notification_;
    $q = _$q_;
    httpBackend = $httpBackend;
    httpBackend.when('GET', /^\w+.*/).respond({});
    httpBackend.when('POST', /^\w+.*/).respond({});

    spyOn(MediaClusterServiceV2, 'get').and.returnValue({
      then: _.noop
    });
    spyOn(MediaClusterServiceV2, 'getAll').and.returnValue({
      then: _.noop
    });
    controller = $controller('DeleteClusterSettingControllerV2', {
      cluster: cluster,
      $modalInstance: $modalInstance,
      $filter: $filter,
      MediaClusterServiceV2: MediaClusterServiceV2,
      $state: $state,
      $translate: $translate,
      XhrNotificationService: XhrNotificationService,
      Notification: Notification,
      $q: $q
    });
  }));

  it('check if controller is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if the moveV2Host of MediaClusterServiceV2 is invoked', function () {
    controller.cluster = cluster;
    controller.hosts = [{
      "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
      "hostname": "10.196.5.251",
      "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
    }, {
      "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
      "hostname": "10.196.5.246",
      "hostSerial": "a41a0783-e695-461e-8f15-355f02f91075"
    }];

    controller.selectPlaceholder = "Select a cluster";
    controller.fillModel = {};
    controller.selectModel = {
      "10.196.5.251": "MFA_TEST2",
      "10.196.5.246": "MFA_TEST2"
    };
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];

    spyOn(MediaClusterServiceV2, 'moveV2Host').and.callThrough();
    controller.continue();
    expect(controller.isMove).toBe(true);
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
    expect(MediaClusterServiceV2.moveV2Host).toHaveBeenCalled();
    expect(MediaClusterServiceV2.moveV2Host.calls.count()).toEqual(2);
  });
  it('check if the createClusterV2 of MediaClusterServiceV2 is invoked', function () {
    controller.cluster = cluster;
    controller.hosts = [{
      "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
      "hostname": "10.196.5.251",
      "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
    }, {
      "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
      "hostname": "10.196.5.246",
      "hostSerial": "a41a0783-e695-461e-8f15-355f02f91075"
    }];

    controller.selectPlaceholder = "Select a cluster";
    controller.fillModel = {};
    controller.selectModel = {
      "10.196.5.251": "MFA_TEST3",
      "10.196.5.246": "MFA_TEST4"
    };
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];

    spyOn(MediaClusterServiceV2, 'createClusterV2').and.callThrough();
    spyOn(MediaClusterServiceV2, 'moveV2Host').and.callThrough();
    controller.continue();
    expect(controller.isMove).toBe(true);
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
    expect(MediaClusterServiceV2.createClusterV2).toHaveBeenCalled();
    expect(MediaClusterServiceV2.createClusterV2.calls.count()).toEqual(2);
  });

  it('check if the defused of MediaClusterServiceV2 is invoked', function () {
    controller.cluster = cluster;
    controller.hosts = [{
      "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
      "hostname": "10.196.5.251",
      "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
    }, {
      "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
      "hostname": "10.196.5.246",
      "hostSerial": "a41a0783-e695-461e-8f15-355f02f91075"
    }];

    controller.selectPlaceholder = "Select a cluster";
    controller.fillModel = {};
    controller.selectModel = {
      "10.196.5.251": "MFA_TEST2",
      "10.196.5.246": "MFA_TEST2"
    };
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];

    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.callThrough();
    controller.deleteCluster();
    expect(controller.isMove).toBe(true);
    expect(MediaClusterServiceV2.defuseV2Connector).toHaveBeenCalled();
    expect(MediaClusterServiceV2.defuseV2Connector.calls.count()).toEqual(2);
  });

  it('check if the moveV2Host of MediaClusterServiceV2 is not invoked if the target cluster is not selected', function () {
    controller.cluster = cluster;
    controller.hosts = [{
      "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
      "hostname": "10.196.5.251",
      "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
    }, {
      "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
      "hostname": "10.196.5.246",
      "hostSerial": "a41a0783-e695-461e-8f15-355f02f91075"
    }];

    controller.selectPlaceholder = "Select a cluster";
    controller.fillModel = {};
    controller.selectModel = {
      "10.196.5.251": "MFA_TEST2",
      "10.196.5.246": "Select a cluster"
    };
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];

    spyOn(MediaClusterServiceV2, 'moveV2Host').and.callThrough();
    controller.continue();
    expect(controller.isMove).toBe(true);
    expect(MediaClusterServiceV2.moveV2Host).not.toHaveBeenCalled();
    expect(MediaClusterServiceV2.moveV2Host.calls.count()).toEqual(0);
  });

  it('check if the deleteV2Cluster of MediaClusterServiceV2 is invoked for empty cluster', function () {
    controller.cluster = cluster;
    controller.hosts = [];
    controller.selectPlaceholder = "Select a cluster";
    controller.fillModel = {};
    controller.selectModel = {};
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];
    controller.successCount = 0;
    controller.errorCount = 0;
    controller.noOfHost = 0;

    spyOn(MediaClusterServiceV2, 'deleteV2Cluster').and.callThrough();
    controller.continue();
    expect(controller.isMove).toBe(true);
    expect(MediaClusterServiceV2.deleteV2Cluster).toHaveBeenCalled();
    expect(MediaClusterServiceV2.deleteV2Cluster.calls.count()).toEqual(1);
  });

  it('check if the defuseV2Connector of MediaClusterServiceV2 is invoked', function () {
    controller.cluster = cluster;
    controller.hosts = [{
      "id": "mf_mgmt@ac43493e-3f11-4eaa-aec0-f16f2a69969a",
      "hostname": "10.196.5.251",
      "hostSerial": "ac43493e-3f11-4eaa-aec0-f16f2a69969a"
    }, {
      "id": "mf_mgmt@a41a0783-e695-461e-8f15-355f02f91075",
      "hostname": "10.196.5.246",
      "hostSerial": "a41a0783-e695-461e-8f15-355f02f91075"
    }];

    controller.selectPlaceholder = "Select a cluster";
    controller.fillModel = {};
    controller.selectModel = {
      "10.196.5.251": "MFA_TEST2",
      "10.196.5.246": "MFA_TEST2"
    };
    controller.clusters = [{
      "id": "a050fcc7-9ade-4790-a06d-cca596910421",
      "name": "MFA_TEST2"
    }];

    spyOn(MediaClusterServiceV2, 'defuseV2Connector').and.callThrough();
    controller.deleteCluster();
    expect(controller.isMove).toBe(true);
    expect(MediaClusterServiceV2.defuseV2Connector).toHaveBeenCalled();
    expect(MediaClusterServiceV2.defuseV2Connector.calls.count()).toEqual(2);
  });

});
