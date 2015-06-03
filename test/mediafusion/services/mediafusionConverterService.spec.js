'use strict';

describe('MediafusionConverterService', function () {

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

  it('should aggregate alarm count', function () {
    var mockData = [{
      "services": [{
        "connectors": [{
          alarms: [{}]
        }, {
          alarms: [{}]
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].alarm_count).toBe(2);
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

  it('should show sw update details if services are disabled', function () {
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

    expect(converted[0].services[0].service_type).toBe('c_mgmt');
    expect(converted[0].services[0].software_upgrade_available).toBeFalsy();
    expect(converted[0].services[0].installed).toBeTruthy();

    expect(converted[0].services[1].service_type).toBe('c_cal');
    expect(converted[0].services[1].software_upgrade_available).toBeTruthy();
    expect(converted[0].services[1].installed).toBeTruthy();

    expect(converted[0].software_upgrade_available).toBeTruthy();
  });

  it('should show sw update details if service is offline', function () {
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
    expect(converted[0].services[0].service_type).toBe('c_cal');
    expect(converted[0].services[0].software_upgrade_available).toBeTruthy();
    expect(converted[0].services[0].installed).toBeTruthy();
    expect(converted[0].software_upgrade_available).toBeTruthy();
  });

  it('should not show sw update details if service are not installed', function () {
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
        "connectors": []
      }]
    }];

    var converted = Service.convertClusters(mockData);
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

  it('aggregates offline state and services per host', function () {
    var mockData = [{
      "hosts": [{
        host_name: "bar_host_name",
        serial: 1
      }, {
        host_name: "qux_host_name",
        serial: 2
      }],
      "services": [{
        "service_type": "c_cal",
        "connectors": [{
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name',
            serial: 1
          }
        }, {
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'bar_host_name',
            serial: 2
          }
        }]
      }, {
        "service_type": "yolo",
        "connectors": [{
          "state": "offline",
          version: 'bar_version',
          host: {
            host_name: 'qux_host_name',
            serial: 1
          }
        }, {
          "state": "running",
          version: 'bar_version',
          host: {
            host_name: 'qux_host_name',
            serial: 2
          }
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].hosts[0].offline).toBe(true);
    expect(converted[0].hosts[1].offline).toBe(false);

    expect(converted[0].hosts[0].services.length).toBe(2);
    expect(converted[0].hosts[1].services.length).toBe(2);
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

  it('should flag services that do not run the correct SW version', function () {
    var mockData = [{
      provisioning_data: {
        approved_packages: [{
          service: {
            service_type: "c_cal"
          },
          version: "8.2-2.1"
        }]
      },
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "running",
          version: 'foo_version',
          host: {
            host_name: 'foo_host_name'
          }
        }, {
          state: "disabled",
          version: '8.2-2.1',
          host: {
            host_name: 'bar_host_name'
          }
        }]
      }]
    }];

    var converted = Service.convertClusters(mockData);
    expect(converted[0].needs_attention).toBeFalsy();
    expect(converted[0].services[0].needs_attention).toBeFalsy();

    expect(converted[0].services[0].alarm_count).toBe(0);

    expect(converted[0].services[0].connectors[0].software_upgrade_pending).toBe('8.2-2.1');
    expect(converted[0].services[0].connectors[1].software_upgrade_pending).toBeFalsy();
  });

  it('should not fail if approved_packages is empty', function () {
    var mockData = [{
      "provisioning_data": {
        "approved_packages": []
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
    expect(converted[0].services[0].connectors[0].software_upgrade_pending).toBeFalsy();
    expect(converted[0].services[0].connectors[1].software_upgrade_pending).toBeFalsy();
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

  it('should sort services based on error status', function () {
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

  it('should aggregate status to services', function () {
    var mockData = [{
      "services": [{
        id: "dsbld",
        "connectors": [{
          "state": "disabled"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].state).toBe('disabled');
  });

  it('should aggregate mixed status to services as needs_attention', function () {
    var mockData = [{
      "services": [{
        id: "dsbld",
        "connectors": [{
          "state": "disabled"
        }, {
          "state": "yolo"
        }]
      }]
    }];
    var converted = Service.convertClusters(mockData);
    expect(converted[0].services[0].state).toBe('needs_attention');
  });

  describe('connector state to service and connector status conversion', function () {

    it('if service has alarm on a host, it should have status needs_attention', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }, {
          serial: 2
        }, {
          serial: 3
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "running",
            host: {
              serial: 1
            }
          }, {
            state: "running",
            host: {
              serial: 2
            },
            alarms: [{}]
          }, {
            state: "running",
            host: {
              serial: 3
            }
          }]
        }]
      }];

      var converted = Service.convertClusters(mockData);
      expect(converted[0].services[0].status).toBe('needs_attention');
    });

    it('should aggregate status to service and connector where connector state differs', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }, {
          serial: 2
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "running",
            host: {
              serial: 1
            }
          }, {
            state: "offline",
            host: {
              serial: 2
            }
          }]
        }]
      }];
      var converted = Service.convertClusters(mockData);
      expect(converted[0].services[0].status).toBe('needs_attention');

      expect(converted[0].services[0].connectors[0].status).toBe('running');
      expect(converted[0].services[0].connectors[1].status).toBe('needs_attention');
    });

  });

  describe('host state to status conversion', function () {

    it('should aggregate mixed status to hosts as needs_attention', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "offline",
            host: {
              serial: 1
            }
          }, {
            state: "online",
            host: {
              serial: 1
            }
          }]
        }]
      }];
      var converted = Service.convertClusters(mockData);
      expect(converted[0].hosts[0].state).toBe('needs_attention');
    });

    it('should aggregate same status to host', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "disabled",
            host: {
              serial: 1
            }
          }]
        }, {
          service_type: "bar",
          connectors: [{
            state: "disabled",
            host: {
              serial: 1
            }
          }]
        }]
      }];

      var converted = Service.convertClusters(mockData);
      expect(converted[0].hosts[0].status).toBe('disabled');
    });

    it('should aggregate status to hosts', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "offline",
            host: {
              serial: 1
            }
          }]
        }]
      }];
      var converted = Service.convertClusters(mockData);
      expect(converted[0].hosts[0].state).toBe('offline');
    });

    it('should aggregate alarms to hosts', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "offline",
            host: {
              serial: 1
            },
            alarms: [{}]
          }]
        }, {
          service_type: "bar",
          connectors: [{
            state: "offline",
            host: {
              serial: 1
            },
            alarms: [{}, {}]
          }]
        }]
      }];
      var converted = Service.convertClusters(mockData);
      expect(converted[0].hosts[0].alarms.length).toBe(3);
    });

    it('status is running if one service is running and one disabled', function () {
      var mockData = [{
        hosts: [{
          serial: 1
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "running",
            host: {
              serial: 1
            }
          }]
        }, {
          service_type: "bar",
          connectors: [{
            state: "disabled",
            host: {
              serial: 1
            }
          }]
        }]
      }];
      var converted = Service.convertClusters(mockData);
      expect(converted[0].hosts[0].status).toBe('running');
      expect(converted[0].hosts[0].state).toBe('running');

      mockData = [{
        hosts: [{
          serial: 1
        }],
        services: [{
          service_type: "foo",
          connectors: [{
            state: "disabled",
            host: {
              serial: 1
            }
          }]
        }, {
          service_type: "bar",
          connectors: [{
            state: "running",
            host: {
              serial: 1
            }
          }]
        }]
      }];
      converted = Service.convertClusters(mockData);
      expect(converted[0].hosts[0].status).toBe('running');
      expect(converted[0].hosts[0].state).toBe('running');
    });

  });

});
