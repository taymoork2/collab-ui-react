'use strict';

describe('Controller: GroupSettingsControllerV2', function () {

  beforeEach(module('wx2AdminWebClientApp'));

  var $scope, redirectTargetPromise, httpBackend, controller, $stateParams, MediaClusterServiceV2, $q;

  beforeEach(inject(function ($rootScope, $httpBackend, $controller, _MediaClusterServiceV2_, _$q_) {

    $scope = $rootScope.$new();
    $stateParams = {
      "groupName": "Bangalore - Site 1",
      "selectedClusters": [{
        "cluster_type": "mf_mgmt",
        "id": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
        "name": "10.196.5.247",
        "hosts": [{
          "host_name": "10.196.5.247",
          "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
          "alarms": [{
            "id": "mf.linus.connectivityError",
            "first_reported": "2016-05-19T10:10:48.196Z",
            "last_reported": "2016-05-19T22:31:56.907Z",
            "severity": "critical",
            "title": "Call switching process connection failure",
            "description": "The call switching process lost connectivity with the cloud. (Type: M)"
          }],
          "services": [{
            "display_name": "Media Connector",
            "service_type": "mf_mgmt",
            "state": "running",
            "status": "needs_attention",
            "version": "2016.05.19.62"
          }],
          "offline": false,
          "state": "running",
          "status": "needs_attention"
        }],
        "provisioning": [],
        "provisioning_data": {
          "approved_packages": [{
            "service": {
              "display_name": "Media Connector",
              "service_type": "mf_mgmt"
            },
            "version": "1.0"
          }],
          "not_approved_packages": []
        },
        "services": [{
          "enabled": true,
          "display_name": "Media Connector",
          "service_type": "mf_mgmt",
          "connectors": [{
            "connector_status": {
              "operational": false,
              "services": {
                "cloud": [],
                "onprem": []
              }
            },
            "state": "running",
            "version": "2016.05.19.62",
            "host": {
              "host_name": "10.196.5.247",
              "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
            },
            "alarms": [{
              "id": "mf.linus.connectivityError",
              "first_reported": "2016-05-19T10:10:48.196Z",
              "last_reported": "2016-05-19T22:31:56.907Z",
              "severity": "critical",
              "title": "Call switching process connection failure",
              "description": "The call switching process lost connectivity with the cloud. (Type: M)"
            }],
            "status": "needs_attention"
          }],
          "alarm_count": 1,
          "running_hosts": 1,
          "state": "running",
          "needs_attention": true,
          "status": "needs_attention"
        }],
        "properties": {
          "fms.releaseChannel": "DEV",
          "mf.group.displayName": "Bangalore - Site 1"
        },
        "assigned_property_sets": ["50795e4c-87ca-44d7-bb21-f684494c1a0d"],
        "running_hosts": "0[object Object]",
        "needs_attention": true,
        "software_upgrade_available": false,
        "any_service_connectors_enabled": {
          "connector_status": {
            "operational": false,
            "services": {
              "cloud": [],
              "onprem": []
            }
          },
          "state": "running",
          "version": "2016.05.19.62",
          "host": {
            "host_name": "10.196.5.247",
            "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
          },
          "alarms": [{
            "id": "mf.linus.connectivityError",
            "first_reported": "2016-05-19T10:10:48.196Z",
            "last_reported": "2016-05-19T22:31:56.907Z",
            "severity": "critical",
            "title": "Call switching process connection failure",
            "description": "The call switching process lost connectivity with the cloud. (Type: M)"
          }],
          "status": "needs_attention"
        }
      }],
      "clusterList": [{
        "cluster_type": "mf_mgmt",
        "id": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
        "name": "10.196.5.247",
        "hosts": [{
          "host_name": "10.196.5.247",
          "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e",
          "alarms": [{
            "id": "mf.linus.connectivityError",
            "first_reported": "2016-05-19T10:10:48.196Z",
            "last_reported": "2016-05-19T22:31:56.907Z",
            "severity": "critical",
            "title": "Call switching process connection failure",
            "description": "The call switching process lost connectivity with the cloud. (Type: M)"
          }],
          "services": [{
            "display_name": "Media Connector",
            "service_type": "mf_mgmt",
            "state": "running",
            "status": "needs_attention",
            "version": "2016.05.19.62"
          }],
          "offline": false,
          "state": "running",
          "status": "needs_attention"
        }],
        "provisioning": [],
        "provisioning_data": {
          "approved_packages": [{
            "service": {
              "display_name": "Media Connector",
              "service_type": "mf_mgmt"
            },
            "version": "1.0"
          }],
          "not_approved_packages": []
        },
        "services": [{
          "enabled": true,
          "display_name": "Media Connector",
          "service_type": "mf_mgmt",
          "connectors": [{
            "connector_status": {
              "operational": false,
              "services": {
                "cloud": [],
                "onprem": []
              }
            },
            "state": "running",
            "version": "2016.05.19.62",
            "host": {
              "host_name": "10.196.5.247",
              "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
            },
            "alarms": [{
              "id": "mf.linus.connectivityError",
              "first_reported": "2016-05-19T10:10:48.196Z",
              "last_reported": "2016-05-19T22:31:56.907Z",
              "severity": "critical",
              "title": "Call switching process connection failure",
              "description": "The call switching process lost connectivity with the cloud. (Type: M)"
            }],
            "status": "needs_attention"
          }],
          "alarm_count": 1,
          "running_hosts": 1,
          "state": "running",
          "needs_attention": true,
          "status": "needs_attention"
        }],
        "properties": {
          "fms.releaseChannel": "DEV",
          "mf.group.displayName": "Bangalore - Site 1"
        },
        "assigned_property_sets": ["50795e4c-87ca-44d7-bb21-f684494c1a0d"],
        "running_hosts": "0[object Object]",
        "needs_attention": true,
        "software_upgrade_available": false,
        "any_service_connectors_enabled": {
          "connector_status": {
            "operational": false,
            "services": {
              "cloud": [],
              "onprem": []
            }
          },
          "state": "running",
          "version": "2016.05.19.62",
          "host": {
            "host_name": "10.196.5.247",
            "serial": "8519858d-fbc9-45eb-b2ff-378ed2b5ec3e"
          },
          "alarms": [{
            "id": "mf.linus.connectivityError",
            "first_reported": "2016-05-19T10:10:48.196Z",
            "last_reported": "2016-05-19T22:31:56.907Z",
            "severity": "critical",
            "title": "Call switching process connection failure",
            "description": "The call switching process lost connectivity with the cloud. (Type: M)"
          }],
          "status": "needs_attention"
        }
      }],
      "dispName": "Bangalore - Site 1"
    };
    MediaClusterServiceV2 = _MediaClusterServiceV2_;
    $q = _$q_;
    redirectTargetPromise = {
      then: sinon.stub()
    };

    httpBackend = $httpBackend;
    httpBackend.when('GET', /^\w+.*/).respond({});
    httpBackend.when('POST', /^\w+.*/).respond({});

    controller = $controller('GroupSettingsControllerV2', {
      $scope: $scope,
      $stateParams: $stateParams,
      MediaClusterServiceV2: MediaClusterServiceV2,
      $q: $q
    });
  }));
  afterEach(function () {
    httpBackend.verifyNoOutstandingRequest();

    httpBackend.verifyNoOutstandingExpectation();
  });
  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  /*  it('should call getPropertySet of MediaClusterServiceV2 when changeReleaseChanel invoked', function () {
      var getPropertySetDefered = $q.defer();
      spyOn(MediaClusterServiceV2, 'getPropertySet').and.returnValue(getPropertySetDefered.promise);
      //  spyOn(MediaClusterServiceV2, 'setPropertySet').and.stub();
      getPropertySetDefered.resolve({
        "orgId": "2c3c9f9e-73d9-4460-a668-047162ff1bac",
        "type": "mf.group",
        "id": "de14de22-fab3-4ea0-9452-0b1b2b5efffd",
        "name": "MF_DEMO",
        "properties": {
          "fms.releaseChannel": "DEV",
          "mf.group.displayName": "MF_DEMO"
        },
        "assignedClusters": ["287d4423-6008-4975-b22e-10c6f7e3ce53"]
      });

      httpBackend.flush();
      controller.changeReleaseChanel();

      expect(MediaClusterServiceV2.getPropertySet).toHaveBeenCalled();
    });*/

  /*  it('should not call setPropertySet of MediaClusterServiceV2 when changeReleaseChanel invoked but getPropertySet fails ', function () {
      var getPropertySetDefered = $q.defer();
      var setPropertySetSetDefered = $q.defer();
      spyOn(MediaClusterServiceV2, 'getPropertySet').and.returnValue(getPropertySetDefered.promise);
      spyOn(MediaClusterServiceV2, 'setPropertySet').and.returnValue(setPropertySetSetDefered.promise);
      getPropertySetDefered.reject();
      setPropertySetSetDefered.resolve();

      httpBackend.flush();
      controller.changeReleaseChanel();

      expect(MediaClusterServiceV2.setPropertySet).not.toHaveBeenCalled();
    });*/
  /*
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

     spyOn(MediaClusterServiceV2, 'getPropertySet').and.returnValue($q.when(propertySetResponse));
     spyOn(MediaClusterServiceV2, 'setPropertySet').and.returnValue($q.when());

     controller.changeReleaseChanel();
     expect(MediaClusterServiceV2.getPropertySet).toHaveBeenCalled();
   }); */

});
