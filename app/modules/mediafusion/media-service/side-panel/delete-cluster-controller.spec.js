'use strict';

describe('Controller: DeleteClusterController', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var vm, controller, groupDetail, groupName, MediaClusterService, XhrNotificationService, $q, $translate, modalInstanceMock, windowMock, log;

  beforeEach(inject(function ($controller, _XhrNotificationService_, _$q_, _$translate_, $log) {
    groupName = 'trichy';

    groupDetail = {
      "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
      "type": "mf.group",
      "id": "8091b5f5-c8a7-4b49-95a0-a8af225b374d",
      "name": "trichy"
    };

    MediaClusterService = {
      deleteGroup: sinon.stub(),
      getGroups: [{
        "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
        "type": "mf.group",
        "id": "8091b5f5-c8a7-4b49-95a0-a8af225b374d",
        "name": "trichy"
      }]
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
    log = $log;
    log.reset();

    controller = $controller('DeleteClusterController', {
      groupName: groupName,
      groupDetail: groupDetail,
      MediaClusterService: MediaClusterService,
      XhrNotificationService: XhrNotificationService,
      $q: $q,
      $translate: $translate,
      $modalInstance: modalInstanceMock,
      $window: windowMock,
      log: log
    });
    sinon.spy(controller, 'deleteCluster');
    sinon.spy(controller, 'delete');
  }));

  it('check if DeleteClusterController is Defined', function () {
    expect(controller).toBeDefined();
  });

  /**it('check if Delete cluster is called with group id', function () {
    spyOn(MediaClusterService, 'deleteGroup').and.returnValue($q.when());
    controller.deleteCluster();
    expect(MediaClusterService.deleteGroup).toHaveBeenCalledWith("8091b5f5-c8a7-4b49-95a0-a8af225b374d");
    expect(controller.saving).toBe(false);

  });*/

  it('check if Delete is called', function () {
    spyOn(MediaClusterService, 'getGroups').and.returnValue($q.when());
    controller.delete();
    expect(MediaClusterService.getGroups).toHaveBeenCalled();
    expect(controller.saving).toBe(true);
  });

});
