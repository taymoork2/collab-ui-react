'use strict';

describe('MediafusionConverterService', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_MediafusionConverterService_) {
    Service = _MediafusionConverterService_;
  }));

  it('should filter and list only media fusion clusters', function () {
    var data = [{
      "id": "d5b78711-b132-11e4-8a66-005056000340",
      "cluster_type": "mf_mgmt",
      "name": "gwydlvm340",
      "services": [{
        "service_type": "mf_mgmt",
        "enabled": true,
        "display_name": "Management Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname-1.cisco.com",
            "serial": "12345"
          },
          "state": "running"
        }]
      }]
    }, {
      "id": "d5b78711-b132-11e4-8a66-005056000341",
      "cluster_type": "c_mgmt",
      "name": "gwydlvm341",
      "services": [{
        "service_type": "c_mgmt",
        "enabled": true,
        "display_name": "Management Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname-2.cisco.com",
            "serial": "12346"
          },
          "state": "running"
        }]
      }, {
        "service_type": "c_cal",
        "enabled": true,
        "display_name": "Calendar Connector",
        "connectors": [{
          "host": {
            "host_name": "hostname-2.cisco.com",
            "serial": "12346"
          },
          "state": "running"
        }]
      }]
    }];

    var converted = Service.convertClusters(data);
    expect(converted.length).toBe(1);
    expect(converted[0].cluster_type).toBe('mf_mgmt');
  });

});
