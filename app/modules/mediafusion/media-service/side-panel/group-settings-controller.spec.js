'use strict';

describe('Controller: GroupSettingsController', function () {

  beforeEach(angular.mock.module('Mediafusion'));

  var MediaClusterService, $q;

  beforeEach(inject(function ($controller, $stateParams, _MediaClusterService_, _$q_) {
    $stateParams = $stateParams;
    MediaClusterService = _MediaClusterService_;
    $q = _$q_;

    $controller('GroupSettingsController', {
      $stateParams: $stateParams,
      MediaClusterService: MediaClusterService,
      $q: $q
    });
  }));

  /*
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should change the release channel only if a new value is assigned from UI', function () {
    var clusterMockPropertiesData = [{
      id: 0,
      hosts: [{
        host_name: "10.107.2.1",
        serial: "0000"
      }],
      assignment_property_sets: ["5555-6666-7777-8888"],
      properties: {
        "fms.releaseChannel": "GA",
        "mf.group.displayName": "BLR-1",
        "mf.role": "Switching"
      },
      services: [{
        service_type: "mf_mgmt",
        connectors: [{
          state: "offline",
          status: "needs_attention",
        }]
      }]
    }, {
      id: 1,
      hosts: [{
        host_name: "10.107.2.2",
        serial: "1111"
      }],
      assignment_property_sets: ["5555-6666-7777-8888"],
      properties: {
        "fms.releaseChannel": "GA",
        "mf.group.displayName": "BLR-1",
        "mf.role": "Transcoding"
      },
      services: [{
        service_type: "mf_mgmt",
        connectors: [{
          state: "offline",
          status: "needs_attention",
        }]
      }]
    }];

    var propertySetResponse = {
      orgId: "2c3c9f9e-73d9-4460-a668-047162ff1bac",
      type: "mf.group",
      id: "5555-6666-7777-8888",
      name: "BLR-1",
      properties: {
        "mf.group.displayName": "BLR-1",
        "fms.releaseChannel": "GA"
      },
      assignedClusters: ["0", "1"]
    };

    controller.clusterList = clusterMockPropertiesData;
    controller.selected = controller.clusterList[0].properties["fms.releaseChannel"];

    spyOn(MediaClusterService, 'getPropertySet').and.returnValue($q.when(propertySetResponse));
    spyOn(MediaClusterService, 'setPropertySet').and.returnValue($q.when());

    controller.changeReleaseChanel();
    expect(MediaClusterService.getPropertySet).toHaveBeenCalled();
  }); */

});
