'use strict';

describe('MediaConverterService', function () {

  // load the service's module
  beforeEach(angular.mock.module('Mediafusion'));

  // instantiate service
  var Service, $q;
  var clusterdata = getJSONFixture('mediafusion/json/mediaservice/clusterdata.json');
  beforeEach(inject(function (_MediaConverterService_, _$q_) {
    Service = _MediaConverterService_;
    $q = _$q_;
  }));
  //Converter Service
  it('should aggregate cluster based on GroupName ', function () {
    var mockData = [{

      "cluster_type": "mf_mgmt",
      "id": "e1db20d6-d6ab-422a-b4e6-d278f7a14dc3",
      "name": "10.196.5.224",
      "hosts": [{
        "host_name": "10.196.5.224",
        "serial": "e1db20d6-d6ab-422a-b4e6-d278f7a14dc3"
      }],
      "provisioning": [

      ],
      "provisioning_data": {
        "approved_packages": [{
          "service": {
            "display_name": "Media Connector",
            "service_type": "mf_mgmt"
          },
          "version": "1.0"
        }],
        "not_approved_packages": [

        ]
      },
      "services": [{
        "enabled": true,
        "display_name": "Media Connector",
        "service_type": "mf_mgmt",
        "connectors": [{
          "connector_status": {
            "operational": false,
            "services": {
              "cloud": [

              ],
              "onprem": [

              ]
            }
          },
          "state": "offline",
          "version": "ME-11.10.216-1-MG-8.24.94-1",
          "host": {
            "host_name": "10.196.5.224",
            "serial": "e1db20d6-d6ab-422a-b4e6-d278f7a14dc3"
          },
          "alarms": [

          ]
        }]
      }],
      "properties": {
        "mf.group.displayName": "trichy"
      },
      "assigned_property_sets": [
        "5874b1e0-0367-4c40-b28d-6ae430241347"
      ]
    }];
    var converted = Service.aggregateClusters(mockData);
    expect(converted[0].groupName).toBe('trichy');
    expect(converted[0].serviceStatus).toBe('offline');
    expect(converted[0].clusters[0].properties).toBeTruthy();
    expect(converted[0].clusters[0].name).toBe(converted[0].clusters[0].hosts[0].host_name);

  });

  it('Ensure No duplicate clusters are added', function () {

    var group = Service.aggregateClusters(clusterdata);
    expect(group[0].serviceStatus).toBeTruthy();
    expect(group[0].clusters[0].cluster_type).toBeDefined();

    expect(group.length).toBe(3);

  });

  it('Ensure No duplicate clusters are added', function () {
    var group = Service.aggregateClusters(clusterdata);
    expect(group[0].serviceStatus).toBeTruthy();
    expect(group[0].clusters[0].cluster_type).toBeDefined();

    expect(group.length).toBe(3);

  });

  it('Ensure No duplicate clusters are added and empty clusters are shown', function () {
    var grpData = ['bangalore'];
    var group = Service.aggregateClusters(clusterdata, grpData);
    expect(group[0].serviceStatus).toBeTruthy();
    expect(group[0].clusters[0].cluster_type).toBeDefined();

    expect(group.length).toBe(4);

  });

  // cluster conversion

  it('should aggregate cluster status from hosts in cluster where connectors are running or disabled', function () {
    var mockData = [{
      id: 0,
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
      id: 0,
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
      id: 0,
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
      id: 0,
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
      id: 0,
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
      id: 0,
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
      id: 0,
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

  it('a cluster with all hosts disabled is not running', function () {
    var mockData = [{
      id: 0,
      "services": [{
        "service_type": "mf_mgmt",
        "display_name": "Media Service",
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
      id: 0,
      "hosts": [{
        host_name: "bar_host_name",
        serial: 1
      }, {
        host_name: "qux_host_name",
        serial: 2
      }],
      "services": [{
        "service_type": "mf_mgmt",
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

  it('should not fail if approved_packages is empty', function () {
    var mockData = [{
      id: 0,
      "provisioning_data": {
        "approved_packages": []
      },
      "services": [{
        "service_type": "mf_mgmt",
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

  it('should sort services based on error status', function () {
    var mockData = [{
      id: 0,
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
      id: 0,
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
      id: 0,
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
        id: 0,
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
        id: 0,
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
        id: 0,
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
        id: 0,
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
        id: 0,
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
        id: 0,
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
        id: 0,
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
        id: 0,
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
