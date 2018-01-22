import serviceModule, { ClusterService } from './cluster-service';
import { IConnector, ConnectorType, IConnectorAlarm, ConnectorAlarmSeverity, ConnectorState, ConnectorUpgradeState, ClusterTargetType, ICluster, IFMSOrganization, IConnectorProvisioning } from 'modules/hercules/hybrid-services.types';

describe('ClusterService', () => {
  beforeEach(angular.mock.module(serviceModule));

  let $rootScope, $httpBackend: ng.IHttpBackendService, ClusterService: ClusterService, CsdmPoller, forceAction;

  beforeEach(angular.mock.module(function ($provide) {
    const Authinfo = {
      getOrgId: jasmine.createSpy('Authinfo.getOrdId').and.returnValue('orgId'),
    };
    $provide.value('Authinfo', Authinfo);

    const UrlConfig = {
      getUssUrl: jasmine.createSpy('UrlConfig.getUssUrl').and.returnValue('http://ulv.no'),
      getHerculesUrlV2: jasmine.createSpy('UrlConfig.getHerculesUrlV2').and.returnValue('http://elg.no'),
    };
    $provide.value('UrlConfig', UrlConfig);

    forceAction = jasmine.createSpy('forceAction');
    CsdmPoller = {
      create: jasmine.createSpy('CsdmPoller.create').and.returnValue({
        forceAction: forceAction,
      }),
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

  it('should start polling right away', () => {
    $rootScope.$digest();
    expect(CsdmPoller.create).toHaveBeenCalled();
  });

  describe('.mergeAllAlarms', () => {
    const templateAlarm: IConnectorAlarm = {
      id: '1',
      title: 't',
      firstReported: '1475651563',
      lastReported: '1475753923',
      description: 'd',
      severity: 'warning',
      solution: 'so',
      solutionReplacementValues: [
        {
          text: 't',
          link: 'l',
        },
      ],
      replacementValues: [],
    };

    it('should return an empty list when no alarms are present', () => {
      const connectors = [
        connector('c_mgmt'),
        connector('c_mgmt'),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(0);
    });

    it('should not return duplicate alarms', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [templateAlarm] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe(templateAlarm.title);
    });

    it('should not return duplicate alarms, even when they have different firstReported values', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { firstReported: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
    });

    it('should return the oldest alarm and eliminate younger alarms as duplicates', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { firstReported: '3' })] }),
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { firstReported: '1' })] }),
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { firstReported: '2' })] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
      expect(result[0].firstReported).toBe('1');
    });

    it('should not return duplicate alarms, even when they have different lastReported values', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { lastReported: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(1);
    });

    it('should not consider an alarm a duplicate of another alarm if their IDs are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { id: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their titles are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { title: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their descriptions are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { description: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their severities are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { severity: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their solutions are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { solution: 'somethingelse' })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their solution replacement text values are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { solutionReplacementValues: [{ text: 'somethingelse', link: templateAlarm.solutionReplacementValues[0].link }] })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should not consider an alarm a duplicate of another alarm if their solution replacement link values are different', () => {
      const connectors = [
        connector('c_mgmt', { alarms: [_.merge({}, templateAlarm, { solutionReplacementValues: [{ text: templateAlarm.solutionReplacementValues[0].text, link: 'somethingelse' }] })] }),
        connector('c_mgmt', { alarms: [templateAlarm] }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result.length).toBe(2);
    });

    it('should add sorted hostnames to the results when alarms are duplicates', () => {
      const connectors = [
        connector('c_mgmt', {
          hostname: 'aachen.de',
          alarms: [_.merge({}, templateAlarm, { firstReported: '1' })],
        }),
        connector('c_mgmt', {
          hostname: 'zagreb.hr',
          alarms: [_.merge({}, templateAlarm, { firstReported: '2' })],
        }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result[0].affectedNodes).toEqual(['aachen.de', 'zagreb.hr']);
    });

    it('should populate the affectedNodes list with only a single hostname when there are no duplicate alarms', () => {
      const connectors = [
        connector('c_mgmt', {
          hostname: 'aachen.de',
          alarms: [_.merge({}, templateAlarm, { id: 1 })],
        }),
        connector('c_mgmt', {
          hostname: 'zagreb.hr',
          alarms: [_.merge({}, templateAlarm, { id: 2 })],
        }),
      ];
      const result = ClusterService._mergeAllAlarms(connectors);
      expect(result[0].affectedNodes).toEqual(['aachen.de']);
      expect(result[1].affectedNodes).toEqual(['zagreb.hr']);
    });

  });

  describe('.fetch', () => {
    it('should contact the correct backend', () => {
      $httpBackend
        .expectGET('http://elg.no/organizations/orgId?fields=@wide')
        .respond(org());
      ClusterService.fetch();
      $httpBackend.flush();
    });

    it('should filter out clusters with targetType unknown', () => {
      const clusterId = 'jalla';
      const response = org([
        cluster([], {
          targetType: 'unknown',
        }),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      expect(clusterCache.c_mgmt[clusterId]).not.toBeDefined();
      expect(clusterCache.c_ucmc[clusterId]).not.toBeDefined();
      expect(clusterCache.c_cal[clusterId]).not.toBeDefined();
    });

    it('should separate data based on connector types', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_ucmc'),
          connector('c_cal'),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();
      $rootScope.$apply();

      const clusterCache = callback.calls.mostRecent().args[0];
      const clusterId = response.clusters[0].id;
      const mgmtClusters = clusterCache.c_mgmt;
      const ucmcClusters = clusterCache.c_ucmc;
      const calClusters = clusterCache.c_cal;
      expect(mgmtClusters[clusterId]).toBeDefined();
      expect(ucmcClusters[clusterId]).toBeDefined();
      expect(calClusters[clusterId]).toBeDefined();
      expect(mgmtClusters[clusterId].connectors.length).toBe(1);
      expect(ucmcClusters[clusterId].connectors.length).toBe(1);
      expect(calClusters[clusterId].connectors.length).toBe(1);
    });

    it('should not expose a cluster if it has 0 connectors of the type we want', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const clusterId = response.clusters[0].id;
      expect(clusterCache.c_mgmt[clusterId]).toBeDefined();
      expect(clusterCache.c_ucmc[clusterId]).not.toBeDefined();
      expect(clusterCache.c_cal[clusterId]).not.toBeDefined();
    });

    it('should add aggregates and filter connectors but not touch the other information of the cluster', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.id).toEqual(originalCluster.id);
      expect(managementCluster.name).toEqual(originalCluster.name);
      expect(managementCluster.provisioning).toEqual(originalCluster.provisioning);
      expect(managementCluster.aggregates).toBeDefined();
      expect(managementCluster.aggregates.provisioning).toEqual(jasmine.objectContaining({
        connectorType: 'c_mgmt',
        availableVersion: '1.0',
      }));
    });

    it('should merge all alarms and override if there are warning alarms', () => {
      const response = org([
        cluster([
          connector('c_mgmt', {
            alarms: 2,
            alarmsSeverity: 'alert',
          }),
          connector('c_mgmt', {
            alarms: 1,
            alarmsSeverity: 'warning',
            hostname: 'host2.example.com',
          }),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.alarms.length).toBe(3);
    });

    it('should merge running states', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            state: 'not_configured',
            hostname: 'host2.example.com',
          }),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.state).toBe('not_configured');
    });

    it('should merge get upgrade state', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            upgradeState: 'upgrading',
            hostname: 'host2.example.com',
          }),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeState).toBe('upgrading');
    });

    it('should NOT say that an upgrade is available when there is none', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeAvailable).toBe(false);
    });

    it('should say that an upgrade is available when a connector is lagging behind', () => {
      const response = org([
        cluster([
          connector('c_mgmt', {
            runningVersion: 'whatever that is not 1.0 (latest availableVersion)',
          }),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeAvailable).toBe(true);
    });

    it('should warn about upgrades when an upgrade available and at least one connector is in state offline', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            state: 'offline',
            hostname: 'host2.example.com',
          }),
        ], {
          upgradeAvailable: ['c_mgmt'],
        }),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.upgradeAvailable).toBe(true);
      expect(managementCluster.aggregates.upgradeWarning).toBe(true);
    });

    it('should not tag a healthy cluster as having an upgrade warning', () => {

      const cluster = getJSONFixture('hercules/x2-alpha-vcscluster.json');
      const response = org([
        cluster, {
          upgradeAvailable: ['c_mgmt'],
        },
      ]);

      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const managementCluster = clusterCache.c_mgmt['5689c2fc-dbe8-11e5-95a9-0050568c73c4'];

      expect(managementCluster.aggregates.upgradeWarning).toBe(false);
    });

    it('should add hosts to aggregates', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_mgmt', {
            hostname: 'host2.example.com',
          }),
          connector('c_mgmt', {
            hostname: 'host3.example.com',
          }),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(callback);
      $httpBackend.flush();

      const clusterCache = callback.calls.mostRecent().args[0];
      const originalCluster = response.clusters[0];
      const managementCluster = clusterCache.c_mgmt[originalCluster.id];
      expect(managementCluster.aggregates.hosts.length).toBe(3);
      expect(managementCluster.aggregates.hosts[0].alarms).toEqual(originalCluster.connectors[0].alarms);
      expect(managementCluster.aggregates.hosts[0].hostname).toEqual(originalCluster.connectors[0].hostname);
      expect(managementCluster.aggregates.hosts[0].state).toEqual(originalCluster.connectors[0].state);
      expect(managementCluster.aggregates.hosts[0].upgradeState).toEqual(originalCluster.connectors[0].upgradeState);
    });

    it('should call error callback on failure', () => {
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(500, undefined);

      const callback = jasmine.createSpy('callback');
      ClusterService.fetch().then(_.noop, callback);
      $httpBackend.flush();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('.getClustersByConnectorType', () => {
    it('should return cached clusters as an array', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
          connector('c_ucmc'),
        ]),
        cluster([
          connector('c_mgmt'),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      ClusterService.fetch();
      $httpBackend.flush();

      const mgmtClusters = ClusterService.getClustersByConnectorType('c_mgmt');
      expect(mgmtClusters.length).toBe(2);
      const ucmcClusters = ClusterService.getClustersByConnectorType('c_ucmc');
      expect(ucmcClusters.length).toBe(1);
    });

    it('should sort clusters by name', () => {
      const response = org([
        cluster([connector('c_mgmt')], { name: 'Z' }),
        cluster([connector('c_mgmt')], { name: '👀' }),
        cluster([connector('c_mgmt')], { name: 'A' }),
      ]);

      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      ClusterService.fetch();
      $httpBackend.flush();

      const mgmtClusters = ClusterService.getClustersByConnectorType('c_mgmt');
      expect(mgmtClusters[0].name).toBe('A');
      expect(mgmtClusters[2].name).toBe('👀');
    });
  });

  describe('.getCluster', () => {
    it('should return a cluster formatted for a certain type', () => {
      const response = org([
        cluster([
          connector('c_mgmt'),
        ]),
      ]);
      $httpBackend
        .when('GET', 'http://elg.no/organizations/orgId?fields=@wide')
        .respond(response);

      ClusterService.fetch();
      $httpBackend.flush();

      const mgmtCluster = ClusterService.getCluster('c_mgmt', response.clusters[0].id);
      const ucmcCluster = ClusterService.getCluster('c_ucmc', response.clusters[0].id);
      expect(mgmtCluster).toBeDefined();
      expect(mgmtCluster.aggregates).toBeDefined();
      expect(ucmcCluster).not.toBeDefined();
    });
  });

  describe('._mergeRunningState', () => {
    let nonEmpty_mf_clusterList: IConnector[], nonEmpty_hds_connectorList: IConnector[], nonEmpty_exp_connectorList: IConnector[], empty_connector_list: IConnector[];

    beforeEach(() => {
      nonEmpty_mf_clusterList = [
        connector('mf_mgmt', {
          hostname: 'mf.example.org',
          state: 'not_installed',
        }),
      ];
      nonEmpty_hds_connectorList = [
        connector('hds_app', {
          hostname: 'hds.example.org',
          state: 'disabled',
        }),
      ];
      nonEmpty_exp_connectorList = [
        connector('c_mgmt', {
          hostname: 'expressway.example.org',
          state: 'registered',
        }),
      ];
      empty_connector_list = [];
    });

    afterEach(() => {
      nonEmpty_mf_clusterList = [];
      nonEmpty_hds_connectorList = [];
      nonEmpty_exp_connectorList = [];
      empty_connector_list = [];
    });

    it('should keep the state for non-empty media clusters', () => {
      const mergedState = ClusterService._mergeRunningState(nonEmpty_mf_clusterList, 'mf_mgmt');
      expect(mergedState.state).toBe('not_installed');
    });

    it('should keep the state for non-empty hds clusters', () => {
      const mergedState = ClusterService._mergeRunningState(nonEmpty_hds_connectorList, 'hds_app');
      expect(mergedState.state).toBe('disabled');
    });

    it('should keep the state for non-empty expressway clusters', () => {
      const mergedState = ClusterService._mergeRunningState(nonEmpty_exp_connectorList, 'c_mgmt');
      expect(mergedState.state).toBe('registered');
    });

    it('should flip to no_nodes_registered for empty media clusters', () => {
      const mergedState = ClusterService._mergeRunningState(empty_connector_list, 'mf_mgmt');
      expect(mergedState.state).toBe('no_nodes_registered');
    });

    it('should flip to no_nodes_registered for empty hds clusters', () => {
      const mergedState = ClusterService._mergeRunningState(empty_connector_list, 'hds_app');
      expect(mergedState.state).toBe('no_nodes_registered');
    });

    it('should flip to not_registered for empty expressway clusters', () => {
      const mergedState = ClusterService._mergeRunningState(empty_connector_list, 'c_mgmt');
      expect(mergedState.state).toBe('not_registered');
    });
  });

  function org(clusters: ICluster[] = []): IFMSOrganization {
    return {
      alarmsUrl: '',
      clusters: clusters,
      id: _.uniqueId('org_'),
      resourceGroups: [],
      url: '',
      servicesUrl: '',
    };
  }

  interface IClusterOptions {
    name?: string;
    upgradeAvailable?: ConnectorType[];
    targetType?: ClusterTargetType;
  }
  function cluster(connectors: IConnector[], options: IClusterOptions = {}): ICluster {
    options = options || {};
    const typesUsed = _.chain(connectors)
      .map<ConnectorType>('connectorType')
      .uniq()
      .value();
    const provisioning = _.map<ConnectorType, IConnectorProvisioning>(typesUsed, (type) => {
      return {
        availablePackageIsUrgent: false,
        availableVersion: options.upgradeAvailable && _.includes(options.upgradeAvailable, type) ? '2.0' : '1.0',
        connectorType: type,
        packageUrl: '',
        provisionedVersion: '',
        url: '',
      };
    });
    return {
      connectors: connectors,
      id: _.uniqueId('cluster_'),
      name: options.name || 'Cluster',
      provisioning: provisioning,
      releaseChannel: '',
      targetType: options.targetType || 'c_mgmt',
      upgradeSchedule: {
        moratoria: [],
        nextUpgradeWindow: {
          endTime: '',
          startTime: '',
        },
        scheduleDays: [],
        scheduleTime: '00:00',
        scheduleTimeZone: '',
        urgentScheduleTime: '00:00',
        url: '',
      },
      upgradeScheduleUrl: '',
      url: '',
    };
  }

  interface IConnectorOptions {
    alarms?: number | IConnectorAlarm[];
    alarmsSeverity?: ConnectorAlarmSeverity;
    hostname?: string;
    runningVersion?: string;
    state?: ConnectorState;
    upgradeState?: ConnectorUpgradeState;
  }
  function connector(type: ConnectorType, options: IConnectorOptions = {}): IConnector {
    let alarms = options.alarms;
    if (_.isNumber(alarms)) {
      alarms = _.map(_.range(alarms), () => {
        return {
          id: '',
          firstReported: '',
          lastReported: '',
          severity: _.get<ConnectorAlarmSeverity>(options, 'alarmsSeverity', 'critical'),
          title: _.uniqueId('alarm_'),
          description: '',
          solution: '',
          solutionReplacementValues: [],
          replacementValues: [],
        };
      });
    } else if (_.isArray(alarms)) {
      alarms = alarms;
    } else {
      alarms = [];
    }
    return {
      alarms: alarms,
      clusterId: '',
      clusterUrl: '',
      connectorType: type || 'c_mgmt',
      createdAt: '',
      hostSerial: _.uniqueId('serial_'),
      hostUrl: '',
      hostname: _.get(options, 'hostname', 'host1.example.com'),
      id: '',
      maintenanceMode: 'off',
      runningVersion: _.get(options, 'runningVersion' , '1.0'),
      state: _.get(options, 'state', 'running'),
      upgradeState: _.get(options, 'upgradeState', 'upgraded'),
      url: '',
    };
  }
});
