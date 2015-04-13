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

  var mockServiceData = {
    fusion_services: [{
      display_name: 'UCM Service',
      icon_class: 'UCM',
      connector_type: 'c_ucmc'
    }, {
      display_name: 'Calendar Service',
      icon_class: 'Calendar',
      connector_type: 'c_cal'
    }, {
      display_name: 'Fusion Management Service',
      icon_class: 'Management',
      connector_type: 'c_mgmt'
    }]
  };

  it('should not count disabled services', function () {
    var mockClusterData = [{
      "id": "717edf8f-8f3b-11e4-9443-005056001397",
      "name": "Test Cluster A",
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal"
          },
          "tlp_url": "tlp",
          "version": "8.6-1.0.525"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "host": {
            "host_name": "gwydlvm1397"
          },
          "state": "disabled",
          "alarms": []
        }, {
          "host": {
            "host_name": "gwydlvm1397"
          },
          "state": "disabled",
          "alarms": []
        }]
      }],
      "hosts": [{
        "host_name": "gwydlvm1397"
      }]
    }];
    // //console.log(JSON.stringify(Converter.convertClusters(mockClusterData), null, 2));

    var aggregate = Service.aggregateServices(mockServiceData, Converter.convertClusters(mockClusterData));
    expect(aggregate.running).toBe(0);
    expect(aggregate.needs_attention).toBe(0);

    var calService = aggregate.services.c_cal;
    expect(calService.running).toBe(0);
    expect(calService.needs_attention).toBe(0);
    expect(calService.software_upgrades).toBe(0);
  });

  it('should aggregate global service status correctly', function () {
    var mockClusterData = [{
      "id": "717edf8f-8f3b-11e4-9443-005056001397",
      "name": "Test Cluster A",
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "host": {
            "host_name": "gwydlvm1397"
          },
          "state": "running",
          "alarms": []
        }]
      }, {
        "service_type": "c_mgmt",
        "connectors": [{
          "host": {
            "host_name": "gwydlvm1397",
            "serial": "080716C6"
          },
          "state": "running",
          "alarms": []
        }]
      }],
      "hosts": [{
        "host_name": "gwydlvm1397"
      }]
    }, {
      "id": "9e4ef7d7-89f5-11e4-ba43-005056000340",
      "name": "Test Cluster B",
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal"
          },
          "tlp_url": "525.tlp",
          "version": "8.6-1.0.525"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "host": {
            "host_name": "gwydlvm340"
          },
          "state": "running",
          "alarms": []
        }]
      }, {
        "service_type": "c_ucmc",
        "connectors": [{
          "host": {
            "host_name": "gwydlvm340"
          },
          "state": "offline",
          "alarms": []
        }]
      }, {
        "service_type": "c_mgmt",
        "connectors": [{
          "host": {
            "host_name": "gwydlvm340"
          },
          "state": "running",
          "alarms": [{
            "error": "we are phuket"
          }]
        }]
      }],
      "hosts": [{
        "host_name": "gwydlvm340"
      }]
    }];
    // //console.log(JSON.stringify(Converter.convertClusters(mockClusterData), null, 2));

    var aggregate = Service.aggregateServices(mockServiceData, Converter.convertClusters(mockClusterData));
    expect(aggregate.running).toBe(1);
    expect(aggregate.needs_attention).toBe(1);

    var ucmService = aggregate.services.c_ucmc;
    expect(ucmService.name).toBe('UCM Service');
    expect(ucmService.icon).toBe('UCM');
    expect(ucmService.running).toBe(0);
    expect(ucmService.needs_attention).toBe(1);
    expect(ucmService.software_upgrades).toBe(0);

    var calService = aggregate.services.c_cal;
    expect(calService.name).toBe('Calendar Service');
    expect(calService.icon).toBe('Calendar');
    expect(calService.running).toBe(2);
    expect(calService.needs_attention).toBe(0);
    expect(calService.software_upgrades).toBe(1);

    var mgmtService = aggregate.services.c_mgmt;
    expect(mgmtService).toBeFalsy();
  });

});
