'use strict';

describe('Service: ConnectorService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ConnectorService_) {
    Service = _ConnectorService_;
  }));

  // connector conversion

  it('should inject connector status if it does not exist', function () {
    var mockData = [{}];
    var converted = Service._convertConnectors(mockData);
    expect(converted[0].status.state).toBe('unknown');
  });

  it('should inject status if alerts exist', function () {
    var mockData = [{
      status: {
        state: 'running',
        alarms: [{}]
      }
    }];
    var converted = Service._convertConnectors(mockData);
    expect(converted[0].status.state).toBe('error');
  });

  it('should inject classes based on state', function () {
    var converted = null;
    converted = Service._convertConnectors([{ status: { state: 'running' } }]);
    expect(converted[0].status_class).toBe('success');

    converted = Service._convertConnectors([{ status: { state: 'disabled' } }]);
    expect(converted[0].status_class).toBe('default');

    converted = Service._convertConnectors([{ status: { state: 'not_configured' } }]);
    expect(converted[0].status_class).toBe('default');

    converted = Service._convertConnectors([{ status: { state: 'foo' } }]);
    expect(converted[0].status_class).toBe('danger');

    converted = Service._convertConnectors([{ status: { state:  'running', alarms: [{}] } }]);
    expect(converted[0].status_class).toBe('danger');
  });

  // cluster conversion

  it('should aggregate cluster status from hosts in cluster where connectors are running or disabled', function () {
    var mockData = [{
      "services": [{
        "connectors": [
          {"state": "running"},
          {"state": "disabled"}
        ]
      }]
    }];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].needs_attention).toBe(undefined);
    expect(converted[0].initially_open).toBe(undefined);
  });

  it('should aggregate cluster status from hosts in cluster where one connector is not running', function () {
    var mockData = [{
      "services": [{
        "connectors": [
          {"state": "running"},
          {"state": "installing"}
        ]
      }]
    }];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].needs_attention).toBe(true);
    expect(converted[0].initially_open).toBe(true);
  });

  it('should aggregate cluster status from hosts in cluster where one connector has alarms', function () {
    var mockData = [{
      "services": [{
        "connectors": [
          {"state": "running", alarms: [{}]},
          {"state": "running"}
        ]
      }]
    }];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].needs_attention).toBe(true);
    expect(converted[0].initially_open).toBe(true);
  });

  it('should aggregate service status from hosts in cluster where one connector has alarms', function () {
    var mockData = [{
      "services": [{
        "connectors": [
          {"state": "running", alarms: [{}]},
          {"state": "running"}
        ]
      }]
    }];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].services[0].needs_attention).toBe(true);
  });

  it('should aggregate state from disabled services', function () {
    var mockData = [{
      "services": [{
        "connectors": [
          {"state": "disabled"}
        ]
      }]
    }];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].services[0].is_disabled).toBe(true);
    expect(!!converted[0].services[0].needs_attention).toBe(false);
  });

  it('should aggregate number of hosts running the service', function () {
    var mockData = [{
      "services": [{
        "connectors": [
          {"state": "disabled"},
          {"state": "running"},
          {"state": "running"},
          {"state": "disabled"},
          {"state": "disabled"}
        ]
      }]
    }];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].services[0].running_hosts).toBe(2);
    expect(!!converted[0].services[0].is_disabled).toBe(false);
    expect(!!converted[0].services[0].needs_attention).toBe(false);
  });


  it('should show sw update details per service', function() {
    var mockData = [{
      "provisioning_data": {
        "not_approved_packages": [
          {
            "service": {
              "service_type": "c_cal",
              "display_name": "Calendar Service"
            },
            "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
            "version": "8.2-2.1"
          }
        ]
      },
      "services": [
        {
          "service_type": "c_cal",
          "display_name": "Calendar Service",
        }
      ]
    }];

    var converted = Service._convertClusters(mockData);
    expect(converted[0].services[0].not_approved_package).not.toBe(null);
    expect(converted[0].services[0].not_approved_package.service.service_type).toBe('c_cal');
  });

  it('should sort clusters based on error status', function () {
    var mockData = [
      { id: 'uno_disabled', "services": [{ "connectors": [ {"state": "disabled"} ] }] },
      { id: 'dos_error',    "services": [{ "connectors": [ {"state": "running", alarms: [{}]}, {"state": "running"} ] }] },
      { id: 'tres_ok',      "services": [{ "connectors": [ {"state": "running"} ] }] }
    ];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].id).toBe('dos_error');
  });

  it('should services based on error status', function () {
    var mockData = [{"services": [
      { id: "dsbld", "connectors": [ {"state": "disabled"} ] },
      { id: "rnnng", "connectors": [ {"state": "running"} ] },
      { id: "errrr", "connectors": [ {"state": "error"} ] }
    ]}];
    var converted = Service._convertClusters(mockData);
    expect(converted[0].services[0].id).toBe('errrr');
    expect(converted[0].services[1].id).toBe('rnnng');
    expect(converted[0].services[2].id).toBe('dsbld');
  });

  it('should aggregate global service status correctly', function () {
    var mockServiceData = [{
      name: 'UCM Service',
      type: 'c_ucmc'
    }, {
      name: 'Calendar Service',
      type: 'c_cal'
    }, {
      name: 'Fusion Management Service',
      type: 'c_mgmt'
    }];

    var mockClusterData = [
      {
        "id": "717edf8f-8f3b-11e4-9443-005056001397",
        "name": "Test Cluster A",
        "services": [
          {
            "service_type": "c_cal",
            "connectors": [
              {
                "host": {
                  "host_name": "gwydlvm1397"
                },
                "state": "offline",
                "alarms": []
              }
            ]
          },
          {
            "service_type": "c_mgmt",
            "connectors": [
              {
                "host": {
                  "host_name": "gwydlvm1397",
                  "serial": "080716C6"
                },
                "state": "running",
                "alarms": []
              }
            ]
          }
        ],
        "hosts": [
          {
            "host_name": "gwydlvm1397"
          }
        ]
      },
      {
        "id": "9e4ef7d7-89f5-11e4-ba43-005056000340",
        "name": "Test Cluster B",
        "provisioning_data": {
          "not_approved_packages": [
            {
              "service": {
                "service_type": "c_cal"
              },
              "tlp_url": "https://sqfusion-jenkins.cisco.com/job/PIPELINE_CALCLOUD_PUBLISH_TO_CAFE/53/artifact/c_cal_8.6-1.0.525.tlp",
              "version": "8.6-1.0.525"
            }
          ]
        },
        "services": [
          {
            "service_type": "c_cal",
            "connectors": [
              {
                "host": {
                  "host_name": "gwydlvm340"
                },
                "state": "stopped",
                "alarms": []
              },
            ]
          },
          {
            "service_type": "c_ucmc",
            "connectors": [
              {
                "host": {
                  "host_name": "gwydlvm340"
                },
                "state": "offline",
                "alarms": []
              }
            ]
          },
          {
            "service_type": "c_mgmt",
            "connectors": [
              {
                "host": {
                  "host_name": "gwydlvm340"
                },
                "state": "running",
                "alarms": []
              }
            ]
          }
        ],
        "hosts": [
          {
            "host_name": "gwydlvm340"
          }
        ]
      }
    ];

    var serviceAggregates = Service.aggregateServices(mockServiceData, Service._convertClusters(mockClusterData));
    expect(serviceAggregates.activatedClusters).toBe(2);
    expect(serviceAggregates.activatedHosts).toBe(2);

    var ucmService = serviceAggregates.aggregatedServices[0];
    expect(ucmService.activatedClusters).toBe(1);
    expect(ucmService.activatedHosts).toBe(1);
    expect(ucmService.needs_attention).toBe(true);
    expect(ucmService.software_upgrades_available).toBe(false);

    var calService = serviceAggregates.aggregatedServices[1];
    expect(calService.activatedClusters).toBe(2);
    expect(calService.activatedHosts).toBe(2);
    expect(calService.needs_attention).toBe(true);
    expect(calService.software_upgrades_available).toBe(true);

    var mgmtService = serviceAggregates.aggregatedServices[2];
    expect(mgmtService.activatedClusters).toBe(2);
    expect(mgmtService.activatedHosts).toBe(2);
    expect(mgmtService.needs_attention).toBe(false);
    expect(mgmtService.software_upgrades_available).toBe(false);
  });

});
