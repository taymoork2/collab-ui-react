'use strict';

/* global _ */

var createHost = function (name) {
  return {
    "host_name": name,
    "serial": new Date().getTime().toString(16)
  };
};

var createService = function (serviceName, serviceType, hosts) {
  var connectors = _.map(hosts, function (host) {
    var connector = {
      "host": createHost(host.hostName),
      "state": serviceType == 'yolo' ? 'running' : host.hostState,
      "version": "1.0.0.1-Alpha1"
    };
    if (Math.floor((Math.random() * 10) % 9) == 0) {
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
    }
    return connector;
  });
  return {
    "service_type": serviceType,
    "display_name": serviceName,
    "connectors": connectors
  };
}

var createCluster = function (opts) {
  return {
    "id": new Date().getTime().toString(16),
    "name": opts.clusterName,
    "provisioning_data": {
      "approved_packages": _.map(opts.approved, function (pkg) {
        return pkg
      }),
      "not_approved_packages": _.map(opts.napproved, function (pkg) {
        return pkg
      })
    },
    "services": _.map(opts.services, function (service) {
      return createService(service.serviceName, service.serviceType, opts.hosts)
    }),
    "hosts": _.map(opts.hosts, function (host) {
      return createHost(host.hostName)
    })
  }
}

var createAlarm = function (opts) {
  return {
    "id": new Date().getTime().toString(16),
    "first_reported": new Date(),
    "last_reported": new Date(),
    "title": opts.title,
    "severity": opts.severity,
    "description": opts.description
  }
}

var calPkg = {
  "service": {
    "service_type": "c_cal",
    "display_name": "Calendar Service"
  },
  "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
  "version": "8.2-2.1"
};

var services = [{
  serviceName: 'Calendar Service',
  serviceType: 'c_cal'
}, {
  serviceName: 'UCM Service',
  serviceType: 'c_ucmc'
}, {
  serviceName: 'Yolo Service',
  serviceType: 'yolo'
}];

var mockData = function () {
  return [
    createCluster({
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
      napproved: [calPkg]
    }),
    createCluster({
      clusterName: "Richardsson Cluster 002",
      services: services,
      hosts: [{
        hostName: 'rdcn.uno.cisco.com',
        hostState: 'running'
      }, {
        hostName: 'rdcn.dos.cisco.com',
        hostState: 'installing'
      }],
      napproved: [calPkg]
    }),
    createCluster({
      clusterName: "Oslo Cluster",
      services: [{
        serviceName: 'Calendar Service',
        serviceType: 'c_cal'
      }],
      hosts: [{
        hostName: 'lys.001.cisco.com',
        hostState: 'running'
      }],
      napproved: [calPkg]
    }),
    createCluster({
      clusterName: "Shanghai Cluster",
      services: services,
      hosts: [{
        hostName: new Date().getTime().toString(16) + '.cisco.com',
        hostState: 'running'
      }, {
        hostName: new Date().getTime().toString(16) + '.cisco.com',
        hostState: 'running'
      }]
    }),
    createCluster({
      clusterName: "Sydney Cluster",
      services: services,
      hosts: [{
        hostName: new Date().getTime().toString(16) + '.cisco.com',
        hostState: 'disabled'
      }, {
        hostName: new Date().getTime().toString(16) + '.cisco.com',
        hostState: 'disabled'
      }]
    })
  ];
};

//console.info(JSON.stringify(mockData(), null, '  '));

angular
  .module('Hercules')
  .service('ConnectorMock', [

    function ConnectorMock() {
      return {
        mockData: mockData
      };
    }
  ]);
