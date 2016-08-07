'use strict';

describe('Controller: ReassignClusterController', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var controller, cluster, MediaClusterService, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock;

  beforeEach(inject(function ($controller, _MediaClusterService_, _XhrNotificationService_, _$q_, _$translate_) {
    cluster = {
      id: 'a',
      name: 'b',
      properties: {
        'mf.group.displayName': 'trichy'
      },
      assigned_property_sets: '606599c8-8e72-491f-9212-153a0877eb84' // or whatever you prefer
    };

    /* MediaClusterService = {

       getGroups: sinon.stub(),
       removeGroupAssignment: sinon.stub(),
       updateGroupAssignment: sinon.stub()
     };*/
    MediaClusterService = _MediaClusterService_;
    XhrNotificationService = _XhrNotificationService_;
    $q = _$q_;
    $translate = _$translate_;

    modalInstanceMock = {
      close: sinon.stub()
    };
    windowMock = {
      open: sinon.stub()
    };

    controller = $controller('ReassignClusterController', {
      cluster: cluster,
      MediaClusterService: MediaClusterService,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock
    });

  }));

  it('check if ReassignClusterController is Defined', function () {
    expect(controller).toBeDefined();
  });

  it('check if getGroups is called', function () {
    spyOn(MediaClusterService, 'getGroups').and.returnValue($q.when());
    controller.getGroups();
    expect(MediaClusterService.getGroups).toHaveBeenCalled();

  });

  it('check if removeGroupAssignment is called with  clusterId', function () {

    spyOn(MediaClusterService, 'removeGroupAssignment').and.returnValue($q.when());
    spyOn(MediaClusterService, 'updateGroupAssignment').and.returnValue($q.when());
    controller.reassign();
    expect(controller.saving).toBe(true);
    expect(MediaClusterService.removeGroupAssignment).toHaveBeenCalledWith(cluster.id, cluster.assigned_property_sets[0]);

  });

});
