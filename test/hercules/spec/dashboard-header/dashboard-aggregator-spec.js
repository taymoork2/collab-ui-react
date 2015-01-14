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
      icon: 'UCM',
      type: 'c_ucmc'
    }, {
      name: 'Calendar Service',
      icon: 'Calendar',
      type: 'c_cal'
    }, {
      name: 'Fusion Management Service',
      icon: 'Management',
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
                "state": "running",
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
                "state": "running",
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
                "alarms": [{"error": "we are phuket"}]
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
    // console.log(JSON.stringify(Converter.convertClusters(mockClusterData), null, 2));

    var aggregate = Service.aggregateServices(mockServiceData, Converter.convertClusters(mockClusterData));
    expect(aggregate.running).toBe(1);
    expect(aggregate.needs_attention).toBe(1);

    var ucmService = aggregate.services['c_ucmc'];
    expect(ucmService.name).toBe('UCM Service');
    expect(ucmService.icon).toBe('UCM');
    expect(ucmService.running).toBe(0);
    expect(ucmService.needs_attention).toBe(1);
    expect(ucmService.software_upgrades).toBe(0);

    var calService = aggregate.services['c_cal'];
    expect(calService.name).toBe('Calendar Service');
    expect(calService.icon).toBe('Calendar');
    expect(calService.running).toBe(2);
    expect(calService.needs_attention).toBe(0);
    expect(calService.software_upgrades).toBe(1);

    var mgmtService = aggregate.services['c_mgmt'];
    expect(mgmtService.name).toBe('Fusion Management Service');
    expect(mgmtService.icon).toBe('Management');
    expect(mgmtService.running).toBe(1);
    expect(mgmtService.needs_attention).toBe(1);
    expect(mgmtService.software_upgrades).toBe(0);
  });

});
