'use strict';
describe('Controller: ReassignClusterControllerV2', function () {
  beforeEach(angular.mock.module('Mediafusion'));
  var vm, redirectTargetPromise, connector, controller, cluster, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock;
  beforeEach(inject(function ($controller, _MediaClusterServiceV2_, _XhrNotificationService_, _$q_, _$translate_) {
    connector = {
      hostname: 'hostname',
      id: 'id'
    };
    cluster = {
      id: 'a',
      name: 'b',
      properties: {
        'mf.group.displayName': 'trichy'
      },
      assigned_property_sets: '606599c8-8e72-491f-9212-153a0877eb84' // or whatever you prefer
    };
    redirectTargetPromise = {
      then: sinon.stub()
    };
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;
    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };
    controller = $controller('ReassignClusterControllerV2', {
      cluster: cluster,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      connector: connector
    });
  }));
  it('check if ReassignClusterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });
  it('check if moveV2Host is called with  clusterId', function () {
    controller.clusterDetail = {
      id: 'id'
    };
    spyOn(MediaClusterServiceV2, 'moveV2Host').and.returnValue(redirectTargetPromise);
    controller.reassign();
    expect(controller.saving).toBe(true);
    expect(MediaClusterServiceV2.moveV2Host).toHaveBeenCalled();
  });
});
