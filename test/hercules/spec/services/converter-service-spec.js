'use strict';

describe('ConverterService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ConverterService_) {
    Service = _ConverterService_;
  }));

  // cluster conversion

  it('should aggregate cluster status from hosts in cluster where connectors are running or disabled', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          "state": "running"
        }, {
          "state": "disabled"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].needs_attention).toBeFalsy();
  });

  it('should aggregate cluster status from hosts in cluster where one connector is not running', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          "state": "running"
        }, {
          "state": "installing"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].needs_attention).toBe(true);
  });

  it('should aggregate cluster status from hosts in cluster where one connector has alarms', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          "state": "running",
          alarms: [{}]
        }, {
          "state": "running"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].needs_attention).toBe(true);
  });

  it('should aggregate service status from hosts in cluster where one connector has alarms', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          "state": "running",
          alarms: [{}]
        }, {
          "state": "running"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].needs_attention).toBe(true);
  });

  it('should aggregate state from disabled services', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          "state": "disabled"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].is_disabled).toBe(true);
    expect(!!converted[0].services[0].needs_attention).toBe(false);
  });

  it('should aggregate number of hosts running the service', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          "state": "disabled"
        }, {
          "state": "running"
        }, {
          "state": "running"
        }, {
          "state": "disabled"
        }, {
          "state": "disabled"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].running_hosts).toBeTruthy();
    expect(converted[0].services[0].running_hosts).toBe(2);
    expect(!!converted[0].services[0].is_disabled).toBe(false);
    expect(!!converted[0].services[0].needs_attention).toBe(false);
  });

  it('should show sw update details per service', function () {
    var mockData = [{
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal"
          },
          "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
          "version": "8.2-2.1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "state": "running",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].not_approved_package).not.toBe(null);
    expect(converted[0].services[0].software_upgrade_available).toBe(true);
    expect(converted[0].services[0].not_approved_package.service.service_type).toBe('c_cal');
  });

  it('should not show sw update details if services are disabled', function () {
    var mockData = [{
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal"
          },
          "tlp_url": "foo",
          "version": "1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "display_name": "Calendar Service",
        "connectors": [{
          "state": "disabled",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }, {
        "service_type": "c_mgmt",
        "connectors": [{
          "state": "running",
          version: '1',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].software_upgrade_available).toBeFalsy();
    expect(converted[0].services[1].software_upgrade_available).toBeFalsy();
    expect(converted[0].services[0].installed).toBeTruthy();
    expect(converted[0].services[1].installed).toBeTruthy();
    expect(converted[0].services[0].install_available).toBeFalsy();
    expect(converted[0].services[1].install_available).toBeFalsy();
    expect(converted[0].software_upgrade_available).toBeFalsy();
  });

  it('should not show sw update details if service is offline', function () {
    var mockData = [{
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal",
            "display_name": "Calendar Service"
          },
          "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
          "version": "8.2-2.1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "display_name": "Calendar Service",
        "connectors": [{
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].software_upgrade_available).toBeFalsy();
    expect(converted[0].services[0].installed).toBeTruthy();
    expect(converted[0].services[0].install_available).toBeFalsy();
    expect(converted[0].software_upgrade_available).toBeFalsy();
  });

  it('should show sw update details if one service is running', function () {
    var mockData = [{
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal",
            "display_name": "Calendar Service"
          },
          "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
          "version": "8.2-2.1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "display_name": "Calendar Service",
        "connectors": [{
          "state": "disabled",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }, {
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }, {
          "state": "running",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].not_approved_package).toBeTruthy();
    expect(converted[0].services[0].software_upgrade_available).toBeTruthy();
    expect(converted[0].services[0].installed).toBeTruthy();
    expect(converted[0].services[0].install_available).toBeFalsy();
    expect(converted[0].software_upgrade_available).toBeTruthy();
  });

  it('should show sw update details if service is not installed and there are no approved_packages', function () {
    var mockData = [{
      "provisioning_data": {
        "not_approved_packages": [{
          "service": {
            "service_type": "c_cal",
            "display_name": "Calendar Service"
          },
          "tlp_url": "gopher://whatever/c_cal_8.2-2.1.tlp",
          "version": "8.2-2.1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "display_name": "Calendar Service",
        "connectors": []
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].not_approved_package).toBeTruthy();
    expect(converted[0].services[0].installed).toBeFalsy();
    expect(converted[0].services[0].install_available).toBeTruthy();
    expect(converted[0].services[0].software_upgrade_available).toBeTruthy();
    expect(converted[0].software_upgrade_available).toBeTruthy();
  });

  it('a cluster with all hosts disabled is not running', function () {
    var mockData = [{
      "services": [{
        "service_type": "c_cal",
        "display_name": "Calendar Service",
        "connectors": [{
          "state": "disabled",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }, {
          "state": "disabled",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted.running_hosts).toBeFalsy();
  });

  it('aggregates offline state per host', function () {
    var mockData = [{
      "hosts": [{
        host_name: "bar_host_name"
      }, {
        host_name: "qux_host_name"
      }],
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }, {
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }, {
        "service_type": "yolo",
        "connectors": [{
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'qux_host_name'
          }
        }, {
          "state": "running",
          version: 'bar_version',
          host: {
            host_name: 'qux_host_name'
          }
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].hosts[0].offline).toBe(true);
    expect(converted[0].hosts[1].offline).toBe(false);
  });

  it('set display_name to first connector if none provided', function () {
    var mockData = [{
      hosts: [{
        host_name: ''
      }, {
        host_name: 'bar_host_name'
      }, {
        host_name: 'qux_host_name'
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].name).toBe('bar_host_name');
  });

  it('should raise alarm for running services that do not run the correct SW version', function () {
    var mockData = [{
      "provisioning_data": {
        "approved_packages": [{
          "service": {
            "service_type": "c_cal"
          },
          "version": "8.2-2.1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "state": "running",
          version: 'foo_version',
          host: {
            host_name: 'foo_host_name'
          }
        }, {
          "state": "disabled",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].needs_attention).toBe(true);
    expect(converted[0].services[0].needs_attention).toBe(true);
    expect(converted[0].services[0].connectors[0].deduced_alarms.length).toEqual(1);
    expect(converted[0].services[0].connectors[0].deduced_alarms[0].type).toEqual('software_version_mismatch');
    expect(converted[0].services[0].connectors[0].deduced_alarms[0].expected_version).toEqual('8.2-2.1');
    expect(converted[0].services[0].connectors[1].deduced_alarms.length).toEqual(0);
  });

  it('should not fail if approved_packages is empty', function () {
    var mockData = [{
      "provisioning_data": {
        "approved_packages": [{
          "service": {
            "service_type": "yolo"
          },
          "version": "8.2-2.1"
        }]
      },
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "state": "running",
          version: 'foo_version',
          host: {
            host_name: 'foo_host_name'
          }
        }, {
          "state": "running",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].needs_attention).toBeFalsy();
    expect(converted[0].services[0].needs_attention).toBeFalsy();
    expect(converted[0].services[0].connectors[0].deduced_alarms.length).toEqual(0);
    expect(converted[0].services[0].connectors[1].deduced_alarms.length).toEqual(0);
  });

  it('should sort clusters based on error status', function () {
    var mockData = [{
      id: 'uno_disabled',
      "services": [{
        "connectors": [{
          "state": "disabled"
        }]
      }]
    }, {
      id: 'dos_error',
      "services": [{
        "connectors": [{
          "state": "running",
          alarms: [{}]
        }, {
          "state": "running"
        }]
      }]
    }, {
      id: 'tres_ok',
      "services": [{
        "connectors": [{
          "state": "running"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].id).toBe('dos_error');
  });

  it('should services based on error status', function () {
    var mockData = [{
      "services": [{
        id: "dsbld",
        "connectors": [{
          "state": "disabled"
        }]
      }, {
        id: "rnnng",
        "connectors": [{
          "state": "running"
        }]
      }, {
        id: "errrr",
        "connectors": [{
          "state": "error"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].id).toBe('errrr');
    expect(converted[0].services[1].id).toBe('rnnng');
    expect(converted[0].services[2].id).toBe('dsbld');
  });

});
