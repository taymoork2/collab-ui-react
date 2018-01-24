import { IFMSOrganization, ICluster, IConnector, IExtendedCluster, IExtendedConnector, ConnectorType, IClusterAggregate, IConnectorAlarm, IExtendedConnectorAlarm, IExtendedClusterFusion, IClusterWithExtendedConnectors, ConnectorMaintenanceMode } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterStatesService, IConnectorStateDetails } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { CsdmPollerFactory as CsdmPoller, CsdmHubFactory } from 'modules/squared/devices/services/CsdmPoller';
import { CsdmCacheUpdater } from 'modules/squared/devices/services/CsdmCacheUpdater';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

interface IClusterCache {
  c_mgmt: any;
  c_ucmc: any;
  c_cal: any;
  c_imp: any;
  mf_mgmt: any;
  hds_app: any;
  cs_mgmt: any;
  cs_context: any;
}

interface IStateSeverity {
  state: any;
  stateSeverity: string;
  stateSeverityValue: number;
}

export class ClusterService {
  private clusterCache: IClusterCache = {
    c_mgmt: {},
    c_ucmc: {},
    c_cal: {},
    c_imp: {},
    mf_mgmt: {},
    hds_app: {},
    cs_mgmt: {},
    cs_context: {},
  };
  private hub = this.CsdmHubFactory.create();
  public subscribe= this.hub.on;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private CsdmCacheUpdater: CsdmCacheUpdater,
    private CsdmHubFactory: CsdmHubFactory,
    private CsdmPoller: CsdmPoller,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private UrlConfig,
  ) {
    this.CsdmPoller.create(this.fetch.bind(this), this.hub);
  }

  private addExtendedPropertiesToClusters(clusters: IClusterWithExtendedConnectors[]): ng.IPromise<IExtendedClusterFusion[]> {
    return this.HybridServicesClusterService.addExtendedPropertiesToClusters(clusters)
      .then((clusters) => {
        return this.HybridServicesClusterService.addServicesStatusesToClusters(clusters);
      });
  }

  private addExtendedPropertiesToConnectorsOfClusters(clusters: ICluster[]): IClusterWithExtendedConnectors[] {
    return _.map(clusters, (cluster) => {
      return {
        ...cluster,
        connectors: _.map(cluster.connectors, (connector) => {
          return this.HybridServicesClusterService.addExtendedPropertiesToConnector(connector, cluster);
        }),
      };
    });
  }

  // Public methods
  public fetch() {
    return this.$http
      .get<IFMSOrganization>(`${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}?fields=@wide`)
      .then(this.extractDataFromResponse)
      .then((org) => {
        return this.HybridServicesClusterService.filterUnknownClusters(
          this.HybridServicesClusterService.filterClustersWithBadContextConnectors(
            this.HybridServicesClusterService.filterClustersWithEmptyNames(org.clusters),
          ),
        );
      })
      .then(clusters => {
        // start modeling the response to match how the UI uses it, per connectorType
        return <IClusterCache>{
          c_mgmt: this.filterConnectorsInsideClusters('c_mgmt', clusters),
          c_ucmc: this.filterConnectorsInsideClusters('c_ucmc', clusters),
          c_cal: this.filterConnectorsInsideClusters('c_cal', clusters),
          c_imp: this.filterConnectorsInsideClusters('c_imp', clusters),
          mf_mgmt: this.filterConnectorsInsideClusters('mf_mgmt', clusters),
          hds_app: this.filterConnectorsInsideClusters('hds_app', clusters),
          cs_mgmt: this.filterConnectorsInsideClusters('cs_mgmt', clusters),
          cs_context: this.filterConnectorsInsideClusters('cs_context', clusters),
        };
      })
      .then(clusters => {
        const result = <IClusterCache>{
          c_mgmt: this.addAggregatedData('c_mgmt', clusters.c_mgmt),
          c_ucmc: this.addAggregatedData('c_ucmc', clusters.c_ucmc),
          c_cal: this.addAggregatedData('c_cal', clusters.c_cal),
          c_imp: this.addAggregatedData('c_imp', clusters.c_imp),
          mf_mgmt: this.addAggregatedData('mf_mgmt', clusters.mf_mgmt),
          hds_app: this.addAggregatedData('hds_app', clusters.hds_app),
          cs_mgmt: this.addAggregatedData('cs_mgmt', clusters.cs_mgmt),
          cs_context: this.addAggregatedData('cs_context', clusters.cs_context),
        };
        return result;
      })
      // ⭐️ Make the resulting data closer to what HybridServicesClusterService is doing
      .then(clusters => {
        const result = <IClusterCache>{
          c_mgmt: this.addExtendedPropertiesToConnectorsOfClusters(clusters.c_mgmt),
          c_ucmc: this.addExtendedPropertiesToConnectorsOfClusters(clusters.c_ucmc),
          c_cal: this.addExtendedPropertiesToConnectorsOfClusters(clusters.c_cal),
          c_imp: this.addExtendedPropertiesToConnectorsOfClusters(clusters.c_imp),
          mf_mgmt: this.addExtendedPropertiesToConnectorsOfClusters(clusters.mf_mgmt),
          hds_app: this.addExtendedPropertiesToConnectorsOfClusters(clusters.hds_app),
          cs_mgmt: this.addExtendedPropertiesToConnectorsOfClusters(clusters.cs_mgmt),
          cs_context: this.addExtendedPropertiesToConnectorsOfClusters(clusters.cs_context),
        };
        return result;
      })
      .then(clusters => {
        return this.$q.all({
          c_mgmt: this.addExtendedPropertiesToClusters(clusters.c_mgmt),
          c_ucmc: this.addExtendedPropertiesToClusters(clusters.c_ucmc),
          c_cal: this.addExtendedPropertiesToClusters(clusters.c_cal),
          c_imp: this.addExtendedPropertiesToClusters(clusters.c_imp),
          mf_mgmt: this.addExtendedPropertiesToClusters(clusters.mf_mgmt),
          hds_app: this.addExtendedPropertiesToClusters(clusters.hds_app),
          cs_mgmt: this.addExtendedPropertiesToClusters(clusters.cs_mgmt),
          cs_context: this.addExtendedPropertiesToClusters(clusters.cs_context),
        });
      })
      //⭐️ End of Making the resulting data closer to what HybridServicesClusterService is doing
      .then(clusters => {
        const result = <IClusterCache>{
          c_mgmt: _.keyBy(clusters.c_mgmt, 'id'),
          c_ucmc: _.keyBy(clusters.c_ucmc, 'id'),
          c_cal: _.keyBy(clusters.c_cal, 'id'),
          c_imp: _.keyBy(clusters.c_imp, 'id'),
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
        this.CsdmCacheUpdater.update(this.clusterCache.c_imp, clusters.c_imp);
        this.CsdmCacheUpdater.update(this.clusterCache.mf_mgmt, clusters.mf_mgmt);
        this.CsdmCacheUpdater.update(this.clusterCache.hds_app, clusters.hds_app);
        this.CsdmCacheUpdater.update(this.clusterCache.cs_mgmt, clusters.cs_mgmt);
        this.CsdmCacheUpdater.update(this.clusterCache.cs_context, clusters.cs_context);
        return this.clusterCache;
      })
      .then((result) => {
        return result;
      });
  }

  public _mergeRunningState(connectors: IConnector[], type: ConnectorType): IStateSeverity {
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

  // Private methods
  private extractDataFromResponse<T>(response: ng.IHttpResponse<T>) {
    return response.data;
  }

  private addExtendedState(connector: IConnector): IExtendedConnector {
    const result = _.extend({}, connector, {
      // hack
      extendedProperties: {
        alarms: 'none',
        alarmsBadgeCss: '',
        hasUpgradeAvailable: false,
        maintenanceMode: 'off' as ConnectorMaintenanceMode,
        state: <IConnectorStateDetails>{
          cssClass: 'success',
          label: 'ok',
          name: 'running',
          severity: 0,
        },
      },
    });
    return result;
  }

  // obsolete
  private getMostSevereRunningState(previous: IStateSeverity, connector: IExtendedConnector): IStateSeverity {
    const severity = this.HybridServicesClusterStatesService.getConnectorStateDetails(connector);
    if (severity.severity > previous.stateSeverityValue) {
      return {
        state: connector.state,
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
    const mergedState = this._mergeRunningState(connectors, type).state;
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
  private addAggregatedData(type: ConnectorType, clusters: ICluster[]): IExtendedCluster[] {
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
  private filterConnectorsInsideClusters(type: ConnectorType, clusters: ICluster[]) {
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
  .module('hercules.cluster-service', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/squared/devices/services/CsdmCacheUpdater'),
    require('modules/squared/devices/services/CsdmPoller'),
    require('modules/hercules/services/hybrid-services-cluster.service').default,
    require('modules/hercules/services/hybrid-services-cluster-states.service').default,
    require('modules/core/config/urlConfig'),
  ])
  .service('ClusterService', ClusterService)
  .name;
