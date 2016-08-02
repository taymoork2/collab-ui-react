(function () {
  'use strict';

  var rnd = function (max) {
    max = max || 10000000000;
    return Math.floor(Math.random() * max).toString(16);
  };

  var createHost = function (name) {
    return {
      "host_name": name,
      "serial": rnd()
    };
  };

  var createAlarm = function (opts) {
    return {
      "id": rnd(),
      "first_reported": new Date(),
      "last_reported": new Date(),
      "title": opts.title,
      "severity": opts.severity,
      "description": opts.description
    };
  };

  var createConnectorStatus = function (connectorType, statusOk) {
    if (connectorType == "c_mgmt") {
      return null;
    }
    var cloudServiceType = "common_identity";
    var premServiceType = "";
    switch (connectorType) {
    case "c_cal":
      cloudServiceType = "cal_service";
      premServiceType = "exchange";
      break;
    case "c_ucmc":
      cloudServiceType = "uc_service";
      premServiceType = "ucm_axl";
      break;
    }
    return {
      "operational": true,
      "services": {
        "cloud": [{
          "address": "11.11.11.11",
          "type": cloudServiceType,
          "state": statusOk ? "ok" : "error",
          "stateDescription": statusOk ? "" : "Unable to connect..."
        }],
        "onprem": [{
          "address": "10.10.10.10",
          "type": premServiceType,
          "state": statusOk ? "ok" : "error",
          "stateDescription": statusOk ? "" : "Unable to connect..."
        }]
      }
    };
  };

  var createService = function (serviceName, serviceType, hosts) {
    var connectors = _.map(hosts, function (host) {
      var connector = {
        "host": createHost(host.hostName),
        "state": serviceType == 'yolo' ? 'running' : host.hostState,
        "version": '0.' + Math.floor(Math.random() * 10) + '.1.2'
      };
      if (Math.floor((Math.random() * 10) % 9) === 0) {
        connector.alarms = [createAlarm({
            title: "Unable to connect",
            severity: "error",
            description: "Can't connect to the damn thing. Need some help here!"
          }),
          createAlarm({
            title: "My head is hurting",
            severity: "critical",
            description: "It's really bad man. I can't do any more work here. This cloud is just too confusing."
          })
        ];
        connector.connector_status = createConnectorStatus(serviceType, false);
      } else {
        connector.connector_status = createConnectorStatus(serviceType, true);
      }
      return connector;
    });
    return {
      "service_type": serviceType,
      "display_name": serviceName,
      "connectors": connectors
    };
  };

  var createCluster = function (opts) {
    return {
      "id": opts.id,
      "name": opts.clusterName,
      "provisioning_data": {
        "approved_packages": _.map(opts.approved, function (pkg) {
          return pkg;
        }),
        "not_approved_packages": _.map(opts.napproved, function (pkg) {
          return pkg;
        })
      },
      "services": _.map(opts.services, function (service) {
        return createService(service.serviceName, service.serviceType, opts.hosts);
      }),
      "hosts": _.map(opts.hosts, function (host) {
        return createHost(host.hostName);
      })
    };
  };

  var calPkg = {
    "service": {
      "service_type": "c_cal",
      "display_name": "Calendar Service"
    },
    "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
    "version": "8.2-2.1",
    "release_notes": "foo"
  };

  var calPkgApp = {
    "service": {
      "service_type": "c_cal",
      "display_name": "Calendar Service"
    },
    "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
    "version": '1.' + Math.floor(Math.random() * 10) + '.0'
  };

  var services = [{
    serviceName: 'Calendar Service',
    serviceType: 'c_cal'
  }, {
    serviceName: 'UCM Service',
    serviceType: 'c_ucmc'
  }, {
    serviceName: 'Yolo Service',
    serviceType: 'c_mgmt'
  }];

  var mockData = function () {
    return [
      createCluster({
        id: 1,
        clusterName: "Richardsson Cluster 001",
        services: services,
        hosts: [{
          hostName: 'rdcn.alpha.cisco.com',
          hostState: 'running'
        }, {
          hostName: 'rdcn.beta.cisco.com',
          hostState: 'installing'
        }, {
          hostName: 'rdcn.charlie.cisco.com',
          hostState: 'not_configured'
        }, {
          hostName: 'rdcn.delta.cisco.com',
          hostState: 'running'
        }],
        napproved: [calPkg],
        approved: [calPkgApp]
      }),
      createCluster({
        id: 2,
        clusterName: "Richardsson Cluster 002",
        services: services,
        hosts: [{
          hostName: 'rdcn.uno.cisco.com',
          hostState: 'running'
        }, {
          hostName: 'rdcn.dos.cisco.com',
          hostState: 'installing'
        }],
        napproved: [calPkg],
        approved: [calPkgApp]
      }),
      createCluster({
        id: 3,
        clusterName: "Oslo Cluster",
        services: [{
          serviceName: 'Calendar Service',
          serviceType: 'c_cal'
        }],
        hosts: [{
          hostName: 'lys.001.cisco.com',
          hostState: 'running'
        }],
        napproved: [calPkg],
        approved: [calPkgApp]
      }),
      createCluster({
        id: 4,
        clusterName: "Shanghai Cluster",
        services: services,
        hosts: [{
          hostName: rnd() + '.cisco.com',
          hostState: 'running'
        }, {
          hostName: rnd() + '.cisco.com',
          hostState: 'running'
        }]
      }),
      createCluster({
        id: 5,
        clusterName: "Sydney Cluster",
        services: services,
        hosts: [{
          hostName: rnd() + '.cisco.com',
          hostState: 'disabled'
        }, {
          hostName: rnd() + '.cisco.com',
          hostState: 'disabled'
        }]
      })
    ];
  };

  angular
    .module('Mediafusion')
    .service('MediafusionConnectorMock', MediafusionConnectorMock);

  function MediafusionConnectorMock() {
    return {
      mockData: mockData
    };
  }
})();
