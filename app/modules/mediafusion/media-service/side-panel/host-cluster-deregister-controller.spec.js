'use strict';

describe('Controller: HostClusterDeregisterController', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var controller, cluster, orgName, MediaClusterService, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock;

  beforeEach(inject(function ($controller, _XhrNotificationService_, _$q_, _$translate_) {
    cluster = {
      id: 'a',
      name: 'b',
      properties: {
        'mf.group.displayName': 'trichy'
      },
      assigned_property_sets: "606599c8-8e72-491f-9212-153a0877eb84"
    };

    orgName = '123';

    MediaClusterService = {
      deleteCluster: sinon.stub()
    };

    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };

    controller = $controller('HostClusterDeregisterController', {
      cluster: cluster,
      orgName: orgName,
      MediaClusterService: MediaClusterService,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock
    });
  }));

  it('check if HostClusterDeregisterController is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if DeRegister is called', function () {
    spyOn(MediaClusterService, 'deleteCluster').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterService.deleteCluster).toHaveBeenCalled();
    expect(controller.saving).toBe(true);

  });

  it('check if delete group is called with  assigned_property_sets', function () {

    spyOn(MediaClusterService, 'deleteCluster').and.returnValue($q.when());
    controller.deregister();
    expect(MediaClusterService.deleteCluster).toHaveBeenCalledWith(cluster.id);

  });

});
