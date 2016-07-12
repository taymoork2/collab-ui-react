'use strict';

describe('ClusterService', function () {
  beforeEach(module('Core'));
  beforeEach(module('Squared'));
  beforeEach(module('Hercules'));

  var $rootScope, $httpBackend, ClusterService, CsdmPoller, forceAction;

  beforeEach(module(function ($provide) {
    var Authinfo = {
      getOrgId: sinon.stub().returns('orgId')
    };
    $provide.value('Authinfo', Authinfo);
    var UrlConfig = {
      getHerculesUrl: sinon.stub().returns('http://ulv.no'),
      getHerculesUrlV2: sinon.stub().returns('http://elg.no')
    };
    $provide.value('UrlConfig', UrlConfig);
    forceAction = sinon.stub();
    CsdmPoller = {
      create: sinon.stub().returns({
        forceAction: forceAction
      })
    };
    $provide.value('CsdmPoller', CsdmPoller);
  }));

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, _ClusterService_) {
    $rootScope = _$rootScope_;
    $httpBackend = _$httpBackend_;
    ClusterService = _ClusterService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should start polling right away', function () {
    $rootScope.$digest();
    expect(CsdmPoller.create.called).toBe(true);
  });

  describe('.fetch', function () {
    it('should contact the correct backend', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/orgId?fields=@wide')
        .respond(org());
      ClusterService.fetch();
      $httpBackend.flush();
    });

    it('should separate data based on connector types', function () {
      var response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_ucmc'),
          connector('c_cal')
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var clusterId = response.clusters[0].id;
      var mgmtClusters = clusterCache.c_mgmt;
      var ucmcClusters = clusterCache.c_ucmc;
      var calClusters = clusterCache.c_cal;
      expect(mgmtClusters[clusterId]).toBeDefined();
      expect(ucmcClusters[clusterId]).toBeDefined();
      expect(calClusters[clusterId]).toBeDefined();
      expect(mgmtClusters[clusterId].connectors.length).toBe(1);
      expect(ucmcClusters[clusterId].connectors.length).toBe(1);
      expect(calClusters[clusterId].connectors.length).toBe(1);
    });

    it('should not expose a cluster if it has 0 connectors of the type we want', function () {
      var response = org([
        cluster([
          connector('c_mgmt')
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var clusterId = response.clusters[0].id;
      expect(clusterCache.c_mgmt[clusterId]).toBeDefined();
      expect(clusterCache.c_ucmc[clusterId]).not.toBeDefined();
      expect(clusterCache.c_cal[clusterId]).not.toBeDefined();
    });

    it('should add aggregates and filter connectors but not touch the other information of the cluster', function () {
      var response = org([
        cluster([
          connector('c_mgmt')
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.id).toEqual(originalCluster.id);
      expect(managementCluster.name).toEqual(originalCluster.name);
      expect(managementCluster.state).toEqual(originalCluster.state);
      expect(managementCluster.provisioning).toEqual(originalCluster.provisioning);
      expect(managementCluster.connectors[0]).toEqual(originalCluster.connectors[0]);
      expect(managementCluster.aggregates).toBeDefined();
      expect(managementCluster.aggregates.provisioning).toEqual(jasmine.objectContaining({
        connectorType: 'c_mgmt',
        availableVersion: '1.0'
      }));
    });

    it('should merge all alarms and override the state if there are alarms', function () {
      var response = org([
        cluster([
          connector('c_mgmt', {
            alarms: 2
          }),
          connector('c_mgmt', {
            alarms: 1,
            hostname: 'host2.example.com'
          })
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.alarms.length).toBe(3);
      expect(managementCluster.aggregates.state).toBe('has_alarms');
    });

    it('should merge running states', function () {
      var response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            state: 'not_configured',
            hostname: 'host2.example.com'
          })
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.state).toBe('not_configured');
    });

    it('should merge get upgrade state', function () {
      var response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            upgradeState: 'upgrading',
            hostname: 'host2.example.com'
          })
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeState).toBe('upgrading');
    });

    it('should NOT say that an upgrade is available when there is none', function () {
      var response = org([
        cluster([
          connector('c_mgmt')
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeAvailable).toBe(false);
    });

    it('should say that an upgrade is available when a connector is lagging behind', function () {
      var response = org([
        cluster([
          connector('c_mgmt', {
            runningVersion: 'whatever that is not 1.0 (latest availableVersion)'
          })
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeAvailable).toBe(true);
    });

    it('should warn about upgrades when an upgrade available BUT at least one connector is in state offline', function () {
      var response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            state: 'offline',
            hostname: 'host2.example.com'
          })
        ], {
          upgradeAvailable: ['c_mgmt']
        })
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeAvailable).toBe(true);
      expect(managementCluster.aggregates.upgradeWarning).toBe(false);
    });

    it('should add hosts to aggregates', function () {
      var response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            hostname: 'host2.example.com'
          }),
          connector('c_mgmt', {
            hostname: 'host3.example.com'
          })
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var originalCluster = response.clusters[0];
      var managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.hosts.length).toBe(3);
      expect(managementCluster.aggregates.hosts[0].alarms).toEqual(originalCluster.connectors[0].alarms);
      expect(managementCluster.aggregates.hosts[0].hostname).toEqual(originalCluster.connectors[0].hostname);
      expect(managementCluster.aggregates.hosts[0].state).toEqual(originalCluster.connectors[0].state);
      expect(managementCluster.aggregates.hosts[0].upgradeState).toEqual(originalCluster.connectors[0].upgradeState);
    });

    it('should call error callback on failure', function () {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(500, null);

      var callback = sinon.stub();
      ClusterService.fetch().then(null, callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
    });
  });

  describe('.getClustersByConnectorType', function () {
    it('should return cached clusters as an array', function () {
      var response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_ucmc')
        ]),
        cluster([
          connector('c_mgmt')
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      ClusterService.fetch();
      $httpBackend.flush();

      var mgmtClusters = ClusterService.getClustersByConnectorType('c_mgmt');
      expect(mgmtClusters.length).toBe(2);
      var ucmcClusters = ClusterService.getClustersByConnectorType('c_ucmc');
      expect(ucmcClusters.length).toBe(1);
    });
  });

  describe('.getCluster', function () {
    it('should return a cluster formatted for a certain type', function () {
      var response = org([
        cluster([
          connector('c_mgmt')
        ])
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      ClusterService.fetch();
      $httpBackend.flush();

      var mgmtCluster = ClusterService.getCluster('c_mgmt', response.clusters[0].id);
      var ucmcCluster = ClusterService.getCluster('c_ucmc', response.clusters[0].id);
      expect(mgmtCluster).toBeDefined();
      expect(mgmtCluster.aggregates).toBeDefined();
      expect(ucmcCluster).not.toBeDefined();
    });
  });

  describe('.getRunningStateSeverity', function () {
    it('should have an idea of which state is more critical than another', function () {
      var severity = ClusterService.getRunningStateSeverity('not_installed');
      expect(severity.label).toBeDefined();
      expect(severity.value).toBeDefined();
      expect(severity.label).toBe('neutral');
      expect(severity.value).toBe(1);
    });

    it('should default to error when the state is no known', function () {
      var severity = ClusterService.getRunningStateSeverity('platypus');
      expect(severity.label).toBe('error');
      expect(severity.value).toBe(3);
    });
  });

  describe('.upgradeSoftware', function () {
    it('should upgrade software using the correct backend', function () {
      $httpBackend
        .when('POST', 'http://ulv.no/organizations/orgId/clusters/cluster_0/services/c_mgmt/upgrade', {})
        .respond({
          foo: 'bar'
        });

      var callback = sinon.stub();
      ClusterService.upgradeSoftware('cluster_0', 'c_mgmt').then(callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args[0].foo).toBe('bar');
    });

    it('should call poller.forceAction on success', function () {
      $httpBackend
        .when('POST', 'http://ulv.no/organizations/orgId/clusters/cluster_0/services/c_mgmt/upgrade', {})
        .respond({
          foo: 'bar'
        });

      ClusterService.upgradeSoftware('cluster_0', 'c_mgmt');
      $httpBackend.flush();

      expect(forceAction.callCount).toBe(1);
    });

    it('should fail on 500 errors', function () {
      $httpBackend
        .when('POST', 'http://ulv.no/organizations/orgId/clusters/cluster_0/services/c_mgmt/upgrade', {})
        .respond(500);

      var callback = sinon.stub();
      ClusterService.upgradeSoftware('cluster_0', 'c_mgmt').then(undefined, callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args[0].foo).not.toBe(null);
    });
  });

  describe('.getConnector', function () {
    it('should be using the correct backend', function () {
      $httpBackend
        .when('GET', 'http://ulv.no/organizations/orgId/connectors/123')
        .respond({
          foo: 'bar'
        });

      var callback = sinon.stub();
      ClusterService.getConnector('123').then(callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
      expect(callback.getCall(0).args[0].foo).toBe('bar');
    });

    it('should fail on 500 errors', function () {
      $httpBackend
        .when('GET', 'http://ulv.no/organizations/orgId/connectors/123')
        .respond(500);

      var callback = sinon.stub();
      ClusterService.getConnector('123').then(undefined, callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
    });
  });

  describe('.deleteHost', function () {
    it('should be using the correct backend', function () {
      $httpBackend
        .when('DELETE', 'http://ulv.no/organizations/orgId/clusters/clusterid/hosts/serial')
        .respond(200);

      var callback = sinon.stub();
      ClusterService.deleteHost('clusterid', 'serial').then(callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
    });

    it('should call poller.forceAction on success', function () {
      $httpBackend
        .when('DELETE', 'http://ulv.no/organizations/orgId/clusters/clusterid/hosts/serial')
        .respond(200);

      ClusterService.deleteHost('clusterid', 'serial');
      $httpBackend.flush();

      expect(forceAction.callCount).toBe(1);
    });

    it('should fail on 500 errors', function () {
      $httpBackend
        .when('DELETE', 'http://ulv.no/organizations/orgId/clusters/clusterid/hosts/serial')
        .respond(500);

      var callback = sinon.stub();
      ClusterService.deleteHost('clusterid', 'serial').then(undefined, callback);
      $httpBackend.flush();

      expect(callback.callCount).toBe(1);
    });
  });

  function org(clusters) {
    return {
      id: _.uniqueId('org_'),
      name: 'Org',
      clusters: clusters
    };
  }

  function cluster(connectors, options) {
    options = options || {};
    var typesUsed = _.chain(connectors)
      .pluck('connectorType')
      .uniq()
      .value();
    var provisioning = _.map(typesUsed, function (type) {
      return {
        connectorType: type,
        availableVersion: _.includes(options.upgradeAvailable, type) ? '2.0' : '1.0'
      };
    });
    return {
      id: _.uniqueId('cluster_'),
      name: 'Cluster',
      state: options.state || 'fused',
      provisioning: provisioning,
      connectors: connectors
    };
  }

  function connector(type, options) {
    options = options || {};
    var alarms = _.map(_.range(options.alarms || 0), function () {
      return {
        title: _.uniqueId('alarm_')
      };
    });
    return {
      alarms: alarms,
      hostSerial: _.uniqueId('serial_'),
      hostname: options.hostname || 'host1.example.com',
      state: options.state || 'running',
      upgradeState: options.upgradeState || 'upgraded',
      connectorType: type || 'c_mgmt',
      runningVersion: options.runningVersion || '1.0'
    };
  }
});
