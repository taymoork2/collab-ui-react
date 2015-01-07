'use strict';

describe('DashboardAggregator', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service, Converter;
  beforeEach(inject(function (_DashboardAggregator_, _ConverterService_) {
    Service = _DashboardAggregator_;
    Converter = _ConverterService_;
  }));

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

    var serviceAggregates = Service.aggregateServices(mockServiceData, Converter.convertClusters(mockClusterData));
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
