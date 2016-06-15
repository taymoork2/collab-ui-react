'use strict';

describe('Controller: ReassignClusterControllerV2', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var vm, controller, cluster, MediaClusterServiceV2, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log;

  beforeEach(inject(function ($controller, _MediaClusterServiceV2_, _XhrNotificationService_, _$q_, _$translate_, $log) {
    cluster = {
      id: 'a',
      name: 'b',
      properties: {
        'mf.group.displayName': 'trichy'
      },
      assigned_property_sets: '606599c8-8e72-491f-9212-153a0877eb84' // or whatever you prefer
    };

    /* MediaClusterServiceV2 = {

       getGroups: sinon.stub(),
       removeGroupAssignment: sinon.stub(),
       updateGroupAssignment: sinon.stub()
     };*/
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
    log = $log;
    log.reset();

    controller = $controller('ReassignClusterControllerV2', {
      cluster: cluster,
      MediaClusterServiceV2: MediaClusterServiceV2,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      log: log
    });

  }));

  it('check if ReassignClusterControllerV2 is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if getGroups is called', function () {
    spyOn(MediaClusterServiceV2, 'getGroups').and.returnValue($q.when());
    controller.getGroups();
    expect(MediaClusterServiceV2.getGroups).toHaveBeenCalled();

  });

  it('check if removeGroupAssignment is called with  clusterId', function () {

    spyOn(MediaClusterServiceV2, 'removeGroupAssignment').and.returnValue($q.when());
    spyOn(MediaClusterServiceV2, 'updateGroupAssignment').and.returnValue($q.when());
    controller.reassign();
    expect(controller.saving).toBe(true);
    expect(MediaClusterServiceV2.removeGroupAssignment).toHaveBeenCalledWith(cluster.id, cluster.assigned_property_sets[0]);

  });

});
