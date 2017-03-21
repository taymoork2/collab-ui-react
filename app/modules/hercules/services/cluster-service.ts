import { IFMSOrganization, ICluster, IConnector, IExtendedCluster, IExtendedConnector, ConnectorType, IClusterAggregate, IConnectorAlarm, IExtendedConnectorAlarm, ExtendedConnectorState } from 'modules/hercules/hybrid-services.types';

interface IClusterCache {
  c_mgmt: any;
  c_ucmc: any;
  c_cal: any;
  mf_mgmt: any;
  hds_app: any;
  cs_mgmt: any;
  cs_context: any;
}

interface IStateSeverity {
  state: ExtendedConnectorState;
  stateSeverity: string;
  stateSeverityValue: number;
}

export class ClusterService {
  private clusterCache: IClusterCache = {
    c_mgmt: {},
    c_ucmc: {},
    c_cal: {},
    mf_mgmt: {},
    hds_app: {},
    cs_mgmt: {},
    cs_context: {},
  };
  private hub = this.CsdmHubFactory.create();
  private poller = this.CsdmPoller.create(this.fetch.bind(this), this.hub);
  public subscribe= this.hub.on;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private CsdmCacheUpdater,
    private CsdmHubFactory,
    private CsdmPoller,
    private FusionClusterStatesService,
    private UrlConfig,
  ) {}

  // Public methods
  public fetch() {
    return this.$http
      .get<IFMSOrganization>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}?fields=@wide`)
      .then(this.extractDataFromResponse)
      .then((org: IFMSOrganization) => {
        // only keep clusters that have a targetType (just to be on the safe side)
        return _.filter<ICluster>(org.clusters, cluster => {
          return cluster.targetType !== 'unknown';
        });
      })
      .then(clusters => {
        // start modeling the response to match how the UI uses it, per connectorType
        return <IClusterCache>{
          c_mgmt: this.clusterType('c_mgmt', clusters),
          c_ucmc: this.clusterType('c_ucmc', clusters),
          c_cal: this.clusterType('c_cal', clusters),
          mf_mgmt: this.clusterType('mf_mgmt', clusters),
          hds_app: this.clusterType('hds_app', clusters),
          cs_mgmt: this.clusterType('cs_mgmt', clusters),
          cs_context: this.clusterType('cs_context', clusters),
        };
      })
      .then(clusters => {
        const result = <IClusterCache>{
          c_mgmt: this.addAggregatedData('c_mgmt', clusters.c_mgmt),
          c_ucmc: this.addAggregatedData('c_ucmc', clusters.c_ucmc),
          c_cal: this.addAggregatedData('c_cal', clusters.c_cal),
          mf_mgmt: this.addAggregatedData('mf_mgmt', clusters.mf_mgmt),
          hds_app: this.addAggregatedData('hds_app', clusters.hds_app),
          cs_mgmt: this.addAggregatedData('cs_mgmt', clusters.cs_mgmt),
          cs_context: this.addAggregatedData('cs_context', clusters.cs_context),
        };
        return result;
      })
      .then(clusters => {
        const result = <IClusterCache>{
          c_mgmt: _.keyBy(clusters.c_mgmt, 'id'),
          c_ucmc: _.keyBy(clusters.c_ucmc, 'id'),
          c_cal: _.keyBy(clusters.c_cal, 'id'),
          mf_mgmt: _.keyBy(clusters.mf_mgmt, 'id'),
          hds_app: _.keyBy(clusters.hds_app, 'id'),
          cs_mgmt: _.keyBy(clusters.cs_mgmt, 'id'),
          cs_context: _.keyBy(clusters.cs_context, 'id'),
        };
        return result;
      })
      .then(clusters => {
        this.CsdmCacheUpdater.update(this.clusterCache.c_mgmt, clusters.c_mgmt);
        this.CsdmCacheUpdater.update(this.clusterCache.c_ucmc, clusters.c_ucmc);
        this.CsdmCacheUpdater.update(this.clusterCache.c_cal, clusters.c_cal);
        this.CsdmCacheUpdater.update(this.clusterCache.mf_mgmt, clusters.mf_mgmt);
        this.CsdmCacheUpdater.update(this.clusterCache.hds_app, clusters.hds_app);
        this.CsdmCacheUpdater.update(this.clusterCache.cs_mgmt, clusters.cs_mgmt);
        this.CsdmCacheUpdater.update(this.clusterCache.cs_context, clusters.cs_context);
        return this.clusterCache;
      });
  }

  public mergeRunningState(connectors: IConnector[], type: ConnectorType): IStateSeverity {
    if (_.size(connectors) === 0 &&
      (type === 'hds_app' || type === 'mf_mgmt')) {
      return {
        state: 'no_nodes_registered',
        stateSeverity: 'unknown',
        stateSeverityValue: 1,
      };
    }
    if (_.size(connectors) === 0) {
      return {
        state: 'not_registered',
        stateSeverity: 'unknown',
        stateSeverityValue: 1,
      };
    }
    return _.chain(connectors)
      .map(this.addExtendedState.bind(this))
      .reduce(this.getMostSevereRunningState.bind(this), <IStateSeverity>{
        state: 'running',
        stateSeverity: 'ok',
        stateSeverityValue: 0,
      })
      .value();
  }

  public getCluster(type: ConnectorType, id: string): IExtendedCluster {
    return this.clusterCache[type][id];
  }

  public getClustersByConnectorType(type: ConnectorType): IExtendedCluster[] {
    const clusters: IExtendedCluster[] = _.chain(this.clusterCache[type])
      .values<IExtendedCluster>() // turn them to an array
      .sortBy((cluster) => {
        return cluster.name.toLocaleUpperCase();
      })
      .value();
    return clusters;
  }

  public upgradeSoftware(clusterId: string, connectorType: ConnectorType) {
    const url = `${this.UrlConfig.getHerculesUrl()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/services/${connectorType}/upgrade`;
    return this.$http.post(url, '{}')
      .then(this.extractDataFromResponse)
      .then((data) => {
        this.poller.forceAction();
        return data;
      });
  }

  public deleteHost(clusterId: string, serial: string) {
    const url = `${this.UrlConfig.getHerculesUrl()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/hosts/${serial}`;
    return this.$http.delete(url)
      .then(this.extractDataFromResponse)
      .then((data) => {
        this.poller.forceAction();
        return data;
      });
  }

  // Private methods
  private extractDataFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>) {
    return response.data;
  }

  private findExtendedState(connector: IConnector): ExtendedConnectorState {
    if (connector.alarms.length === 0) {
      return connector.state;
    }
    return _.some(connector.alarms, alarm => {
      return alarm.severity === 'critical' || alarm.severity === 'error';
    }) ? 'has_error_alarms' : 'has_warning_alarms';
  }

  private addExtendedState(connector: IConnector): IExtendedConnector {
    const result = _.extend({}, connector, {
      extendedState: this.findExtendedState(connector),
    });
    return result;
  }

  private getMostSevereRunningState(previous: IStateSeverity, connector: IExtendedConnector): IStateSeverity {
    const severity = this.FusionClusterStatesService.getSeverity(connector, 'extendedState');
    if (severity.severity > previous.stateSeverityValue) {
      return {
        state: connector.extendedState,
        stateSeverity: severity.label,
        stateSeverityValue: severity.severity,
      };
    } else {
      return previous;
    }
  }

  /**
   * For each connector, extract their alarms, add the hostname and affectedNodes properties to them
   * flatten the list, sort them by first time reported, remove duplicates and return them.
   * WARING: made public only for testing
   * @param connectors list of connectors
   */
  public _mergeAllAlarms(connectors: IConnector[]): IExtendedConnectorAlarm[] {
    const allAlarms = _.chain(connectors)
      .map(connector => {
        const modifiedAlarms = _.map<IConnectorAlarm, IExtendedConnectorAlarm>(connector.alarms, alarm => {
          const result: IExtendedConnectorAlarm = _.extend({}, alarm, {
            hostname: connector.hostname,
            affectedNodes: [connector.hostname],
          });
          return result;
        });
        return modifiedAlarms;
      })
      .flatten<IExtendedConnectorAlarm>()
      // This sort must happen before the uniqWith so that we keep the oldest alarm when
      // finding duplicates (the order is preserved when running uniqWith, that is, the
      // first entry of a set of duplicates is kept).
      .sortBy(e => {
        return e.firstReported;
      })
      .value();

    // The Lodash type definition for _.uniqWith() doesn't allo _.uniqWith<IExtendedConnectorAlarm>()…
    const uniques: IExtendedConnectorAlarm[] = _.uniqWith(allAlarms, (e1, e2) => {
      return e1.id === e2.id
        && e1.title === e2.title
        && e1.description === e2.description
        && e1.severity === e2.severity
        && e1.solution === e2.solution
        && _.isEqual(e1.solutionReplacementValues, e2.solutionReplacementValues);
    });
    // We only sort by ID once we have pruned the duplicates, to save a few cycles.
    // This sort makes sure refreshing the page will always keep things ordered the
    // same way, even if a new alarm (with a 'younger' firstReportedBy) replaces an
    // older alarm of the same ID.
    const deduplicatedAlarms = _.sortBy(uniques, e => {
      return e.id;
    });

    if (allAlarms.length > deduplicatedAlarms.length) {
      const removedAlarms: IExtendedConnectorAlarm[] = _.differenceWith(allAlarms, deduplicatedAlarms, _.isEqual);
      _.forEach(removedAlarms, removedAlarm => {
        const alarmSiblings = _.filter(allAlarms, a => {
          return removedAlarm.id === a.id
            && removedAlarm.title === a.title
            && removedAlarm.description === a.description
            && removedAlarm.severity === a.severity
            && removedAlarm.solution === a.solution
            && _.isEqual(removedAlarm.solutionReplacementValues, a.solutionReplacementValues);
        });
        _.forEach(alarmSiblings, alarm => {
          alarm.affectedNodes = _.flatMap(alarmSiblings, a => {
            return a.hostname;
          });
          alarm.affectedNodes.sort();
        });
      });
    }
    return deduplicatedAlarms;
  }

  private getUpgradeState(connectors: IConnector[]) {
    const allAreUpgraded = _.every(connectors, { upgradeState: 'upgraded' });
    return allAreUpgraded ? 'upgraded' : 'upgrading';
  }

  /**
   * Create an object representing a summary of the cluster, around a give type
   * @param type connector type
   * @param clusters Hybrid Services cluster
   */
  private buildAggregates(type: ConnectorType, cluster: ICluster): IClusterAggregate {
    const connectors = cluster.connectors;
    const provisioning = _.find(cluster.provisioning, { connectorType: type });
    const upgradeAvailable = provisioning && _.some(cluster.connectors, (connector) => {
      return provisioning.availableVersion && connector.runningVersion !== provisioning.availableVersion;
    });
    const mergedState = this.mergeRunningState(connectors, type).state;
    const hosts = _.chain(connectors)
      .map<string>('hostname')
      .uniq()
      .value();
    return {
      alarms: this._mergeAllAlarms(connectors),
      state: mergedState,
      upgradeState: this.getUpgradeState(connectors),
      provisioning: provisioning,
      upgradeAvailable: upgradeAvailable,
      upgradeWarning: upgradeAvailable && _.some(cluster.connectors, { state: 'offline' }),
      hosts: _.map(hosts, (host) => {
        // 1 host = 1 connector (for a given type)
        const connector = _.find(connectors, { hostname: host });
        return {
          alarms: connector.alarms,
          hostname: host,
          state: connector.state,
          upgradeState: connector.upgradeState,
        };
      }),
    };
  }

  /**
   * Return a list of cluster modified by just adding a `aggregates`
   * property to each of them.
   * @param type connector type
   * @param clusters array of Hybrid Services clusters
   */
  private addAggregatedData(type: ConnectorType, clusters: ICluster[]) {
    // We add aggregated data like alarms, states and versions to the cluster
    return _.map(clusters, cluster => {
      cluster = _.cloneDeep(cluster);
      const result = _.extend<IExtendedCluster>({}, cluster, {
        aggregates: this.buildAggregates(type, cluster),
      });
      return result;
    });
  }

  /**
   * Return a list of cluster to keep only those who are provisionned for
   * a certain connector type, and change their connectors to only keep
   * the ones witht he right type (useful for Expressways for instance)
   * @param type connector type
   * @param clusters array of Hybrid Services clusters
   */
  private clusterType(type: ConnectorType, clusters: ICluster[]) {
    return _.chain(clusters)
      .filter(cluster => _.some(cluster.provisioning, { connectorType: type }))
      .map(cluster => {
        cluster = _.cloneDeep(cluster);
        cluster.connectors = _.filter(cluster.connectors, { connectorType: type });
        return cluster;
      })
      .value();
  }
}

export default angular
  .module('Hercules')
  .service('ClusterService', ClusterService)
  .name;
