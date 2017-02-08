'use strict';

describe('ClusterService', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Squared'));
  beforeEach(angular.mock.module('Hercules'));

  var $rootScope, $httpBackend, ClusterService, CsdmPoller, forceAction;

  beforeEach(angular.mock.module(function ($provide) {
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

  describe('.mergeAllAlarms', function () {
    var templateAlarm = {
      id: 1,
      title: 't',
      firstReported: '1475651563',
      lastReported: '1475753923',
      description: 'd',
      severity: 's',
      solution: 'so',
      solutionReplacementValues: [
        {
          text: 't',
          link: 'l'
        }
      ]
    };

    it('should return an empty list when no alarms are present', function () {
      var connectors = [
        { alarms: [] },
        { alarms: [] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(0);
    });

    it('should not return duplicate alarms', function () {
      var connectors = [
        { alarms: [templateAlarm] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(1);
      expect(result[0].title).toBe(templateAlarm.title);
    });

    it('should not return duplicate alarms, even when they have different firstReported values', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { firstReported: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
    });

    it('should return the oldest alarm and eliminate younger alarms as duplicates', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { firstReported: '3' })] },
        { alarms: [_.merge({}, templateAlarm, { firstReported: '1' })] },
        { alarms: [_.merge({}, templateAlarm, { firstReported: '2' })] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
      expect(result[0].firstReported).toBe('1');
    });

    it('should not return duplicate alarms, even when they have different lastReported values', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { lastReported: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
    });

    it('should not consider an alarm a duplicate of another alarm if their IDs are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { id: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their titles are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { title: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their descriptions are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { description: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their severities are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { severity: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their solutions are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { solution: 'somethingelse' })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their solution replacement text values are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { solutionReplacementValues: [{ text: 'somethingelse', link: templateAlarm.solutionReplacementValues.link }] })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their solution replacement link values are different', function () {
      var connectors = [
        { alarms: [_.merge({}, templateAlarm, { solutionReplacementValues: [{ text: templateAlarm.solutionReplacementValues.text, link: 'somethingelse' }] })] },
        { alarms: [templateAlarm] },
      ];
      var result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });
  });

  describe('.fetch', function () {
    it('should contact the correct backend', function () {
      $httpBackend
        .expectGET('http://elg.no/organizations/orgId?fields=@wide')
        .respond(org());
      ClusterService.fetch();
      $httpBackend.flush();
    });

    it('should filter out clusters with targetType unknown', function () {
      var clusterId = 'jalla';
      var response = org([
        {
          id: clusterId,
          targetType: 'unknown'
        }
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      expect(clusterCache.c_mgmt[clusterId]).not.toBeDefined();
      expect(clusterCache.c_ucmc[clusterId]).not.toBeDefined();
      expect(clusterCache.c_cal[clusterId]).not.toBeDefined();
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

    it('should merge all alarms and override the state with "has_warning_alarms" if there are warning alarms', function () {
      var response = org([
        cluster([
          connector('c_mgmt', {
            alarms: 2,
            alarmsSeverity: 'alert'
          }),
          connector('c_mgmt', {
            alarms: 1,
            alarmsSeverity: 'warning',
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
      expect(managementCluster.aggregates.state).toBe('has_warning_alarms');
    });

    it('should merge all alarms and override the state with "has_warning_alarms" if there are warning alarms', function () {
      var response = org([
        cluster([
          connector('c_mgmt', {
            alarms: 2,
            alarmsSeverity: 'error'
          }),
          connector('c_mgmt', {
            alarms: 1,
            alarmsSeverity: 'critical',
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
      expect(managementCluster.aggregates.state).toBe('has_error_alarms');
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

    it('should warn about upgrades when an upgrade available and at least one connector is in state offline', function () {
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
      expect(managementCluster.aggregates.upgradeWarning).toBe(true);
    });

    it('should not tag a healthy cluster as having an upgrade warning', function () {

      var cluster = getJSONFixture('hercules/x2-alpha-vcscluster.json');
      var response = org([
        cluster, {
          upgradeAvailable: ['c_mgmt']
        }
      ]);

      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      var callback = sinon.stub();
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      var clusterCache = callback.getCall(0).args[0];
      var managementCluster = clusterCache.c_mgmt['5689c2fc-dbe8-11e5-95a9-0050568c73c4'];

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

    it('should sort clusters by name', function () {
      var response = org([
        cluster([connector('c_mgmt')], { name: 'Z' }),
        cluster([connector('c_mgmt')], { name: '👀' }),
        cluster([connector('c_mgmt')], { name: 'A' }),
      ]);

      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      ClusterService.fetch();
      $httpBackend.flush();

      var mgmtClusters = ClusterService.getClustersByConnectorType('c_mgmt');
      expect(mgmtClusters[0].name).toBe('A');
      expect(mgmtClusters[2].name).toBe('👀');
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

  describe('.mergeRunningState', function () {
    var nonEmpty_mf_clusterList, nonEmpty_hds_connectorList, nonEmpty_exp_connectorList, empty_connector_list;

    beforeEach(function () {
      nonEmpty_mf_clusterList = [
        {
          id: 'mf_mgmt@070EC9D0',
          connectorType: 'mf_app',
          hostname: 'mf.example.org',
          hostSerial: '070EC9D0',
          state: 'not_installed',
          alarms: [],
        }
      ];
      nonEmpty_hds_connectorList = [
        {
          id: 'hds_app@070EC9D0',
          connectorType: 'hds_app',
          hostname: 'hds.example.org',
          hostSerial: '070EC9D0',
          state: 'disabled',
          alarms: [],
        }
      ];
      nonEmpty_exp_connectorList = [
        {
          id: 'c_mgmt@070EC9D0',
          connectorType: 'c_mgmt',
          hostname: 'expressway.example.org',
          hostSerial: '070EC9D0',
          state: 'registered',
          alarms: [],
        }
      ];
      empty_connector_list = [];
    });

    afterEach(function () {
      nonEmpty_mf_clusterList = [];
      nonEmpty_hds_connectorList = [];
      nonEmpty_exp_connectorList = [];
      empty_connector_list = [];
    });

    it('should keep the state for non-empty media clusters', function () {
      var mergedState = ClusterService.mergeRunningState(nonEmpty_mf_clusterList, 'mf_mgmt');
      expect(mergedState.state).toBe('not_installed');
    });

    it('should keep the state for non-empty hds clusters', function () {
      var mergedState = ClusterService.mergeRunningState(nonEmpty_hds_connectorList, 'hds_app');
      expect(mergedState.state).toBe('disabled');
    });

    it('should keep the state for non-empty expressway clusters', function () {
      var mergedState = ClusterService.mergeRunningState(nonEmpty_exp_connectorList, 'c_mgmt');
      expect(mergedState.state).toBe('registered');
    });

    it('should flip to no_nodes_registered for empty media clusters', function () {
      var mergedState = ClusterService.mergeRunningState(empty_connector_list, 'mf_mgmt');
      expect(mergedState.state).toBe('no_nodes_registered');
    });

    it('should flip to no_nodes_registered for empty hds clusters', function () {
      var mergedState = ClusterService.mergeRunningState(empty_connector_list, 'hds_app');
      expect(mergedState.state).toBe('no_nodes_registered');
    });

    it('should flip to not_registered for empty expressway clusters', function () {
      var mergedState = ClusterService.mergeRunningState(empty_connector_list, 'c_mgmt');
      expect(mergedState.state).toBe('not_registered');
    });

    it('should default to expressway if no second argument is provided', function () {
      var mergedState = ClusterService.mergeRunningState(empty_connector_list);
      expect(mergedState.state).toBe('not_registered');
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
      .map('connectorType')
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
      name: options.name || 'Cluster',
      state: options.state || 'fused',
      provisioning: provisioning,
      connectors: connectors
    };
  }

  function connector(type, options) {
    options = options || {};
    var alarms = _.map(_.range(options.alarms || 0), function () {
      return {
        title: _.uniqueId('alarm_'),
        severity: options.alarmsSeverity ? options.alarmsSeverity : 'critical',
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
