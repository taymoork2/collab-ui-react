'use strict';

describe('ServiceStatusSummaryService', function () {

  // load the service's module
  beforeEach(angular.mock.module('Hercules'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ServiceStatusSummaryService_) {
    Service = _ServiceStatusSummaryService_;
  }));

  it("cluster state is 'running' when all hosts has service state 'running'", function () {
    var clusterMockData = createAClusterMockWithGivenStates("running", "running");
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("running");
  });

  it("cluster state is 'alarm' if one or several hosts has service alarm", function () {
    var clusterMockData = {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "running"
        }, {
          alarms: [{
            alarm: "isRaised"
          }],
          state: "downloading"
        }, {
          state: "disabled"
        }]
      }]
    };
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("alarm");
  });

  it('disabled higher pri than notconfigured', function () {
    var clusterMockData = createAClusterMockWithGivenStates("not_configured", "disabled");
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("disabled");
    clusterMockData = createAClusterMockWithGivenStates("disabled", "not_configured");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("disabled");
  });

  it('other aggregated status is based on a certain priority list', function () {
    var clusterMockData = createAClusterMockWithGivenStates("not_configured", "disabled");
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("disabled");
    clusterMockData = createAClusterMockWithGivenStates("installing", "not_configured");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("not_configured");
    clusterMockData = createAClusterMockWithGivenStates("stopped", "installing");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("installing");
    clusterMockData = createAClusterMockWithGivenStates("offline", "stopped");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("stopped");
    clusterMockData = createAClusterMockWithGivenStates("not_installed", "offline");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("offline");
    clusterMockData = createAClusterMockWithGivenStates("not_installed", "running");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated).toEqual("not_installed");

  });

  it('service not installed', function () {
    var clusterMockData = createCompleteClustersMockData("cluster1", ["c_mgmt", "c_cal"], ["host1.cisco.com"]);
    var notInstalled = Service.serviceNotInstalled("c_cal", clusterMockData);
    expect(notInstalled).toBe(false);
    notInstalled = Service.serviceNotInstalled("c_ucmc", clusterMockData);
    expect(notInstalled).toBe(true);
  });

  it('software upgrade available if provisioning data has not_approved_packages for given service', function () {
    var clusterMockData = {
      id: 0,
      provisioning_data: {
        not_approved_packages: [{
          release_note: "no release note for this test data",
          service: {
            display_name: "calendar connector",
            service_type: "c_cal"
          },
          tlp_url: "whatever_url",
          version: "1.2.3.4"
        }]
      },
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "running"
        }, {
          alarms: [{
            alarm: "isRaised"
          }],
          state: "downloading"
        }, {
          state: "disabled"
        }]
      }, {
        service_type: "c_ucmc",
        connectors: [{
          state: "running"
        }, {
          alarms: [{
            alarm: "isRaised"
          }],
          state: "downloading"
        }, {
          state: "disabled"
        }]
      }]
    };

    var software = Service.softwareUpgradeAvailable("c_cal", clusterMockData);
    expect(software).toBe(true);
    software = Service.softwareUpgradeAvailable("c_ucmc", clusterMockData);
    expect(software).toBe(false);
  });

  it('no software packages available if no not_approved_packages', function () {
    var clusterMockData = {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "running"
        }, {
          alarms: [{
            alarm: "isRaised"
          }],
          state: "downloading"
        }, {
          state: "disabled"
        }]
      }]
    };

    var software = Service.softwareUpgradeAvailable("c_cal", clusterMockData);
    expect(software).toBe(false);
    software = Service.softwareUpgradeAvailable("c_ucmc", clusterMockData);
    expect(software).toBe(false);
  });

  //********************************************************************
  // Testing this specs own internal cluster data creator functions
  //********************************************************************
  it("cluster mock data is generated correctly", function () {
    var expected = {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "a"
        }, {
          state: "b"
        }, {
          state: "c"
        }]
      }]
    };

    var generated = createAClusterMockWithGivenStates("a", "b", "c");
    expect(JSON.stringify(expected) === JSON.stringify(generated)).toBe(true);
  });

  it('complete cluster api mock data is created correctly', function () {
    var expected = [{
      "id": "9876-cluster1",
      "cluster_type": "c_mgmt",
      "name": "cluster1",
      "services": [{
        "service_type": "c_mgmt",
        "enabled": true,
        "display_name": "Management Connector",
        "connectors": [{
          "host": {
            "host_name": "host1.cisco.com",
            "serial": "9999-host1.cisco.com"
          },
          "state": "running"
        }]
      }, {
        "service_type": "c_cal",
        "enabled": true,
        "display_name": "Calendar Connector",
        "connectors": [{
          "host": {
            "host_name": "host1.cisco.com",
            "serial": "9999-host1.cisco.com"
          },
          "state": "running"
        }]
      }]
    }, {
      "id": "9876-cluster2",
      "cluster_type": "c_mgmt",
      "name": "cluster2",
      "services": [{
        "service_type": "c_mgmt",
        "enabled": true,
        "display_name": "Management Connector",
        "connectors": [{
          "host": {
            "host_name": "host2.cisco.com",
            "serial": "9999-host2.cisco.com"
          },
          "state": "running"
        }, {
          "host": {
            "host_name": "host3.cisco.com",
            "serial": "9999-host3.cisco.com"
          },
          "state": "running"
        }]
      }, {
        "service_type": "c_cal",
        "enabled": true,
        "display_name": "Calendar Connector",
        "connectors": [{
          "host": {
            "host_name": "host2.cisco.com",
            "serial": "9999-host2.cisco.com"
          },
          "state": "running"
        }, {
          "host": {
            "host_name": "host3.cisco.com",
            "serial": "9999-host3.cisco.com"
          },
          "state": "running"
        }]
      }]
    }];

    var cluster1 = createCompleteClustersMockData("cluster1", ["c_mgmt", "c_cal"], ["host1.cisco.com"]);
    var cluster2 = createCompleteClustersMockData("cluster2", ["c_mgmt", "c_cal"], ["host2.cisco.com", "host3.cisco.com"]);

    var clusters = [cluster1, cluster2];

    //console.info(JSON.stringify(clusters, null, '  '));
    //console.info(JSON.stringify(expected, null, '  '));

    expect(expected).toEqual(clusters);
  });

  var createAClusterMockWithGivenStates = function () {
    var connectorsArray = [];
    _.each(arguments, function (state) {
      connectorsArray.push({
        state: state
      });
    });

    return {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: connectorsArray
      }]
    };
  };

  var createCompleteClustersMockData = function (clusterName, serviceTypes, hostNames) {

    var connectors = [];
    _.each(hostNames, function (host) {
      connectors.push({
        host: {
          host_name: host,
          serial: "9999-" + host
        },
        state: "running"
      });
    });

    var displayName = function (serviceType) {
      if (serviceType == "c_mgmt") {
        return "Management Connector";
      } else if (serviceType == "c_cal") {
        return "Calendar Connector";
      } else {
        return "Unknown connector name";
      }
    };

    var services = [];
    _.each(serviceTypes, function (serviceType) {
      services.push({
        service_type: serviceType,
        enabled: true,
        display_name: displayName(serviceType),
        connectors: connectors
      });
    });

    return {
      id: "9876-" + clusterName,
      cluster_type: "c_mgmt",
      name: clusterName,
      services: services
    };
  };

});
