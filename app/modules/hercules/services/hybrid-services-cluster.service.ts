import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { ICluster, ConnectorType, HybridServiceId, IFMSOrganization, ITimeWindow, ClusterTargetType, IExtendedClusterFusion, ServiceStatusCSSClass, IMoratoria, IHost, IConnector, IExtendedConnector, IConnectorAlarm, IConnectorProvisioning, ConnectorMaintenanceMode, IClusterWithExtendedConnectors, IClusterPropertySet } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HybridServicesExtrasService, IAllowedRegistrationHost } from 'modules/hercules/services/hybrid-services-extras.service';
import { USSService } from 'modules/hercules/services/uss.service';

export interface IServiceStatusWithSetup {
  serviceId: HybridServiceId;
  setup: boolean;
  status: HighLevelStatusForService;
  cssClass: ServiceStatusCSSClass;
}

interface IResourceGroup {
  clusters: IExtendedClusterFusion[];
  id: string;
  name: string;
  numberOfUsers: number | '?';
  releaseChannel: string;
}

interface IAddDryRun {
  clusterId: string;
  connectorType: ConnectorType;
  userCapacitiesBefore: {
    [connecotType: string]: number;
  };
  userCapacitiesAfter: {
    [connecotType: string]: number;
  };
}

export interface IResourceGroups {
  groups: IResourceGroup[];
  unassigned: IExtendedClusterFusion[];
}

export type HighLevelStatusForService = 'setupNotComplete' | 'operational' | 'impaired' | 'outage';

export class HybridServicesClusterService {
  private static readonly CONTEXT_CONNECTOR_OLD_VERSION = '2.0.1-10131';
  private static readonly CACHE_KEY = 'hybrid-services-cluster-cache';
  private static readonly CACHE_AGE_DEFAULT = 29 * 1000; // 29s (1 less then the connectors heartbeat)
  private static readonly CACHE_EXPIRE_POLICY = 'passive';
  private allResourcesCache;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private CacheFactory,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private UrlConfig,
    private USSService: USSService,
  ) {
    this.addExtendedPropertiesToClusters = this.addExtendedPropertiesToClusters.bind(this);
    this.addServicesStatusesToClusters = this.addServicesStatusesToClusters.bind(this);
    this.addUserCount = this.addUserCount.bind(this);
    this.extractClustersFromResponse = this.extractClustersFromResponse.bind(this);
    this.extractDataFromResponse = this.extractDataFromResponse.bind(this);
    this.filterClustersWithBadContextConnectors = this.filterClustersWithBadContextConnectors.bind(this);
    this.filterUnknownClusters = this.filterUnknownClusters.bind(this);
    this.filterClustersWithEmptyNames = this.filterClustersWithEmptyNames.bind(this);
    this.sortClusters = this.sortClusters.bind(this);
    this.initCache();
  }

  public deleteMoratoria(clusterId: string, moratoriaId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/upgradeSchedule/moratoria/${moratoriaId}`;
    return this.$http.delete<''>(url)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public deprovisionConnector(clusterId: string, connectorType: ConnectorType): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/remove/invoke?connectorType=${connectorType}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public deregisterCluster(clusterId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}`;
    return this.$http.delete<''>(url)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public deregisterEcpNode(connectorId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/actions/deregister/invoke?managementConnectorId=${connectorId}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public moveEcpNode(connectorId: string, fromClusterId: string, toClusterId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/actions/moveNodeByManagementConnectorId/invoke?managementConnectorId=${connectorId}&fromClusterId=${fromClusterId}&toClusterId=${toClusterId}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public get(clusterId: string, orgId?: string): ng.IPromise<IExtendedClusterFusion> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/clusters/${clusterId}?fields=@wide`;
    return this.$http.get<ICluster>(url)
      .then(this.extractDataFromResponse)
      .then((cluster) => {
        let clusters = this.filterClustersWithBadContextConnectors([cluster]);
        clusters = _.map<ICluster, IClusterWithExtendedConnectors>(clusters, cluster => {
          return <IClusterWithExtendedConnectors>{
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector, cluster);
            }),
          };
        });
        return clusters[0] as IClusterWithExtendedConnectors;
      })
      .then((cluster) => {
        return this.addExtendedPropertiesToClusters([cluster])
          .then((clusters) => {
            return clusters[0];
          });
      })
      .then((cluster) => {
        const clusters = this.addServicesStatusesToClusters([cluster]);
        return clusters[0];
      });
  }

  public getAll(orgId = this.Authinfo.getOrgId()): ng.IPromise<IExtendedClusterFusion[]> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId}?fields=@wide`;
    return this.$http.get<IFMSOrganization>(url, { cache: this.allResourcesCache })
      .then(this.extractClustersFromResponse)
      .then(this.filterUnknownClusters)
      .then(this.filterClustersWithEmptyNames)
      .then(this.filterClustersWithBadContextConnectors)
      .then((clusters) => {
        return _.map(clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector, cluster);
            }),
          };
        });
      })
      .then(this.addExtendedPropertiesToClusters)
      .then(this.addServicesStatusesToClusters)
      .then(this.sortClusters);
  }

  public getClustersForResourceGroup(id: string, clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.resourceGroupId === id;
    });
  }

  public getHost(serial: string, orgId?: string): ng.IPromise<IHost> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/hosts/${serial}`;
    return this.$http.get<IHost>(url)
      .then(this.extractDataFromResponse);
  }

  public purgeExpresswayHost(serial: string, orgId?: string) {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/hosts/${serial}`;
    return this.$http.delete(url)
      .then(this.extractDataFromResponse);
  }

  public getConnector(connectorId: string, orgId?: string): ng.IPromise<IConnector> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/connectors/${connectorId}`;
    return this.$http.get<IConnector>(url)
      .then(this.extractDataFromResponse);
  }

  public getHomedClusternameAndHostname(connectorId: string, orgId = this.Authinfo.getOrgId()): ng.IPromise<{ clustername: string, hostname: string}> {
    return this.getAll(orgId)
      .then((clusters) => {
        const connectors: IConnector[] = _.chain(clusters)
          .map((cluster) => cluster.connectors)
          .flatten<IConnector>()
          .value();
        const connector = _.find(connectors, { id: connectorId } );
        const cluster = _.find(clusters, { id: connector.clusterId });
        return {
          clustername: cluster.name,
          hostname: connector.hostname,
        };
      });
  }

  public getResourceGroups(orgId = this.Authinfo.getOrgId()): ng.IPromise<IResourceGroups> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId}?fields=@wide`;
    return this.$http.get<IFMSOrganization>(url, { cache: this.allResourcesCache })
      .then(this.extractDataFromResponse)
      .then((org) => {
        org.clusters = this.filterUnknownClusters(org.clusters);
        org.clusters = this.filterClustersWithEmptyNames(org.clusters);
        org.clusters = this.filterClustersWithBadContextConnectors(org.clusters);
        org.clusters = _.map(org.clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector, cluster);
            }),
          };
        });
        return org;
      })
      // addInfoToEmptyExpresswayClusters
      .then((org) => {
        return this.addExtendedPropertiesToClusters(org.clusters as IClusterWithExtendedConnectors[])
          .then((clusters) => {
            org.clusters = this.addServicesStatusesToClusters(clusters);
            return org;
          });
      })
      // formatData
      .then((org: IFMSOrganization) => {
        const resourceGroups = _.sortBy(org.resourceGroups, 'name');
        return {
          groups: _.map(resourceGroups, (resourceGroup) => {
            return {
              id: resourceGroup.id,
              name: resourceGroup.name,
              releaseChannel: resourceGroup.releaseChannel,
              clusters: this.sortClusters(this.getClustersForResourceGroup(resourceGroup.id, org.clusters)),
            };
          }),
          unassigned: this.sortClusters(this.getUnassignedClusters(org.clusters)),
        };
      })
      .then(this.addUserCount);
  }

  public getUnassignedClusters(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, (cluster) => cluster.resourceGroupId === undefined);
  }

  public postponeUpgradeSchedule(id: string, upgradeWindow: ITimeWindow): ng.IPromise<IMoratoria> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${id}/upgradeSchedule/moratoria`;
    return this.$http.post<IMoratoria>(url, { timeWindow: upgradeWindow })
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public preregisterCluster(name: string, releaseChannel: string, targetType: ClusterTargetType): ng.IPromise<ICluster> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters`;
    return this.$http.post<ICluster>(url, {
      name: name,
      releaseChannel: releaseChannel,
      targetType: targetType,
    })
    .then(this.extractDataFromResponse)
    .then((res) => {
      this.clearCache();
      return res;
    });
  }

  public processClustersToAggregateStatusForService(serviceId: HybridServiceId, clusterList: IExtendedClusterFusion[]): HighLevelStatusForService {
    const connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(serviceId);
    const connectors = _.chain(clusterList)
      .map(cluster => cluster.connectors)
      .flatten<IExtendedConnector>()
      .filter(connector => connector.connectorType === connectorType)
      .value();
    if (connectors.length === 0 || _.every(connectors, connector => connector.state === 'not_installed')) {
      return 'setupNotComplete';
    }
    // TODO: today we piggiyback on the method to compute the status for a service, inside a cluster.
    // But find the status for a service overall (by taking into account all clusters) could be different.
    // For Expressways, we would have to look at it per resource group, and them have a different algorithm than today to decide.
    return this.HybridServicesClusterStatesService.getServiceStatusDetails(connectors).name;
  }

  public provisionConnector(clusterId: string, connectorType: ConnectorType): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/add/invoke?connectorType=${connectorType}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse)
      .then(res => {
        this.clearCache();
        return res;
      });
  }

  public provisionConnectorDryRun(clusterId: string, connectorType: ConnectorType): ng.IPromise<IAddDryRun> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/dryRunAdd/invoke?connectorType=${connectorType}`;
    return this.$http.post<IAddDryRun>(url, null)
      .then(this.extractDataFromResponse);
  }

  public hasOnlyOneExpresswayWithConnectorProvisioned(connectorType: ConnectorType): ng.IPromise<boolean> {
    return this.getAll()
      .then((clusters) => {
        return _.compact(_.map(clusters, (cluster) => {
          if (cluster.targetType === 'c_mgmt') {
            return cluster.provisioning;
          }
        }));
      })
      .then((provisioningData) => {
        return _.map(provisioningData, (services: IConnectorProvisioning) => {
          return _.some(services, (service) => service.connectorType === connectorType);
        });
      })
      .then((hasConnectorProvisioned: boolean[]) => {
        return _.sumBy(hasConnectorProvisioned, x => x === true ? 1 : 0) === 1;
      });
  }

  public addExtendedPropertiesToClusters(clusters: IClusterWithExtendedConnectors[]): ng.IPromise<IExtendedClusterFusion[]> {
    const promises = _.map(clusters, (cluster) => {
      const isClusterEmpty = _.size(cluster.connectors) === 0;
      const allClusterAlarms = _.chain(cluster.connectors)
        .map((connector) => connector.alarms)
        .flatten<IConnectorAlarm>()
        .value();
      // TODO: add unit tests
      let alarms: 'none' | 'warning' | 'error' = 'none'; // this type is duplicate of what's inside hybrid-services.types.ts?
      if (allClusterAlarms.length > 0) {
        alarms = _.some(allClusterAlarms, (alarm) => alarm.severity === 'critical' || alarm.severity === 'error') ? 'error' : 'warning';
      }
      // TODO: add unit tests
      const hasUpgradeAvailable = _.some(cluster.connectors, (connector) => connector.extendedProperties.hasUpgradeAvailable);
      const isUpgradeUrgent = _.some(cluster.connectors, (connector) => connector.extendedProperties.isUpgradeUrgent);
      // no_nodes_registered or not_registered if _.size(connectors) === 0
      if (isClusterEmpty && cluster.targetType === 'c_mgmt') {
        return this.HybridServicesExtrasService.getPreregisteredClusterAllowList(cluster.id)
          .catch(() => {
            /* An error here is not critical. Missing redirect target data in FMS should not block us from adding the other extended properties */
            return [];
          })
          .then((allowList: IAllowedRegistrationHost[]) => {
            return {
              ...cluster,
              extendedProperties: {
                alarms: alarms,
                alarmsBadgeCss: 'danger',
                allowedRedirectTarget: allowList[0],
                hasUpgradeAvailable: hasUpgradeAvailable,
                isUpgradeUrgent: isUpgradeUrgent,
                isEmpty: isClusterEmpty,
                maintenanceMode: this.getMaintenanceModeForCluster(cluster),
                registrationTimedOut: _.isUndefined(allowList[0]),
                servicesStatuses: [],
                upgradeState: this.getUpgradeState(cluster.connectors),
              },
            };
          });
      } else {
        return this.$q.resolve<IExtendedClusterFusion>({
          ...cluster,
          extendedProperties: {
            alarms: alarms,
            alarmsBadgeCss: 'danger',
            allowedRedirectTarget: undefined,
            hasUpgradeAvailable: hasUpgradeAvailable,
            isUpgradeUrgent: isUpgradeUrgent,
            isEmpty: isClusterEmpty,
            maintenanceMode: this.getMaintenanceModeForCluster(cluster),
            registrationTimedOut: false,
            servicesStatuses: [],
            upgradeState: this.getUpgradeState(cluster.connectors),
          },
        });
      }
    });
    return this.$q.all(promises);
  }

  public setClusterInformation(clusterId: string, data: { name?: string; releaseChannel?: string; }): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}`;
    return this.$http.patch<''>(url, data)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public setUpgradeSchedule(id: string, params: any): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${id}/upgradeSchedule`;
    return this.$http.patch<''>(url, params)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  public updateHost(serial: string, params: any, orgId?: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/hosts/${serial}`;
    return this.$http.patch<''>(url, params)
      .then(this.extractDataFromResponse)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }

  // PRIVATE

  /**
   * Take the connector data straigth from the API and adds a property named
   * `extendedProperties` containing `alarms` and `alarmsBadgeCss`. They represent
   * an overview of the alarms we can find on the connector.
   * @param {connector} IConnector
   * @return {IExtendedConnector}
   */
  private addExtendedPropertiesToConnector(connector: IConnector, cluster: ICluster): IExtendedConnector {
    let alarms: 'none' | 'warning' | 'error' = 'none'; // this type is duplicate of what's inside hybrid-services.types.ts?
    if (connector.alarms.length > 0) {
      alarms = _.some(connector.alarms, (alarm) => alarm.severity === 'critical' || alarm.severity === 'error') ? 'error' : 'warning';
    }
    const relevantProvisioning = _.find(cluster.provisioning, { connectorType: connector.connectorType });
    return {
      ...connector,
      extendedProperties: {
        alarms: alarms,
        alarmsBadgeCss: 'danger',
        state: this.HybridServicesClusterStatesService.getConnectorStateDetails(connector),
        hasUpgradeAvailable: relevantProvisioning && this.hasConnectorUpgradeAvailable(connector, relevantProvisioning), // TODO: add unit tests
        isUpgradeUrgent: relevantProvisioning && this.isConnectorUpgradeUrgent(connector, relevantProvisioning), // TODO: add unit tests
        maintenanceMode: this.getMaintenanceModeForConnector(connector), // TODO: add unit tests
      },
    };
  }

  private addServicesStatusesToClusters(clusters: IExtendedClusterFusion[]): IExtendedClusterFusion[] {
    return _.map(clusters, cluster => {
      if (cluster.targetType === 'c_mgmt') {
        const mgmtConnectors = _.filter(cluster.connectors, { connectorType: 'c_mgmt' });
        const ucmcConnectors = _.filter(cluster.connectors, { connectorType: 'c_ucmc' });
        const calConnectors = _.filter(cluster.connectors, { connectorType: 'c_cal' });
        const impConnectors = _.filter(cluster.connectors, { connectorType: 'c_imp' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'squared-fusion-mgmt',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(mgmtConnectors),
          total: mgmtConnectors.length,
        }, {
          serviceId: 'squared-fusion-uc',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(ucmcConnectors),
          total: ucmcConnectors.length,
        }, {
          serviceId: 'squared-fusion-cal',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(calConnectors),
          total: calConnectors.length,
        }, {
          serviceId: 'spark-hybrid-impinterop',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(impConnectors),
          total: impConnectors.length,
        }];
      } else if (cluster.targetType === 'mf_mgmt') {
        const mediaConnectors = _.filter(cluster.connectors, { connectorType: 'mf_mgmt' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'squared-fusion-media',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(mediaConnectors),
          total: mediaConnectors.length,
        }];
      } else if (cluster.targetType === 'hds_app') {
        const hdsConnectors = _.filter(cluster.connectors, { connectorType: 'hds_app' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'spark-hybrid-datasecurity',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(hdsConnectors),
          total: hdsConnectors.length,
        }];
      } else if (cluster.targetType === 'cs_mgmt') {
        const hybridContextConnectors = _.filter(cluster.connectors, connector => (connector.connectorType === 'cs_mgmt' || connector.connectorType === 'cs_context'));
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'contact-center-context',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(hybridContextConnectors),
          total: hybridContextConnectors.length,
        }];
      } else if (cluster.targetType === 'ucm_mgmt') {
        const ucmConnectors = _.filter(cluster.connectors, { connectorType: 'ucm_mgmt' });
        cluster.extendedProperties.servicesStatuses = [{
          serviceId: 'squared-fusion-khaos',
          state: this.HybridServicesClusterStatesService.getServiceStatusDetails(ucmConnectors),
          total: ucmConnectors.length,
        }];
      }
      return cluster;
    });
  }

  /* Caution: This function is written with Hybrid Call in mind, and reflects their definition of High Availability (HA).
   * Before using it on other connectors, make sure to verify their HA definitions. Note that this function should not
   * be used for c_cal, because they do not follow this HA definition.   */
  public serviceHasHighAvailability(connectorType: ConnectorType, orgId?: string): ng.IPromise<boolean> {
    return this.getAll(orgId)
      .then((clusters) => {
        return _.filter(clusters, (cluster) => {
          return _.some(cluster.provisioning, (provisioning) => provisioning.connectorType === connectorType);
        });
      })
      .then((clusters) => {
        return _.map(clusters, (cluster) => {
          return _.reduce(cluster.connectors, (sum, connector) => sum + Number(connector.connectorType === connectorType) , 0);
        });
      })
      .then((connectorCounts) => {
        if (connectorCounts.length === 0) {
          return false;
        }
        return !_.some(connectorCounts, (connectorCount) => connectorCount < 2);
      });
  }

  private addUserCount(response): ng.IPromise<any> {
    if (response.groups.length === 0) {
      return response;
    }
    return this.USSService.getUserPropsSummary()
      .then((summary) => {
        return {
          groups: _.map(response.groups, (group: any) => {
            const countForGroup = _.find(summary.userCountByResourceGroup, (count) => {
              return count.resourceGroupId === group.id;
            });
            group.numberOfUsers = countForGroup ? countForGroup.numberOfUsers : 0;
            return group;
          }),
          unassigned: response.unassigned,
        };
      })
      .catch(() => {
        return {
          groups: _.map(response.groups, (group: any) => {
            group.numberOfUsers = '?';
            return group;
          }),
          unassigned: response.unassigned,
        };
      });
  }

  private extractClustersFromResponse<T>(response: ng.IHttpResponse<T>): ICluster[] {
    return _.get(this.extractDataFromResponse(response), 'clusters', []);
  }

  private extractDataFromResponse<T>(response: ng.IHttpResponse<T>): T {
    return _.get<T>(response, 'data');
  }

  private filterUnknownClusters(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.targetType !== 'unknown';
    });
  }

  /**
   * Mainly for Media Fusion team. They have an empty cluster they can't get rid of!
   * @param clusters ICluster[]
   */
  // to test
  public filterClustersWithEmptyNames(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.name !== '';
    });
  }

  /**
   * Filtering the old Context Connectors.
   * The issue is that the hosts show the new connectors as well as the old ones.
   * The old ones disappear after a few days, but we need to remove them from the list so that overall state shows correctly.
   * @param clusters
   * @returns ICluster[] clusters
   */
  private filterClustersWithBadContextConnectors(clusters: ICluster[]): ICluster[] {
    return _.map(clusters, cluster => {
      if (cluster.targetType === 'cs_mgmt') {
        cluster.connectors = _.filter(cluster.connectors, connector => connector.runningVersion !== HybridServicesClusterService.CONTEXT_CONNECTOR_OLD_VERSION);
      }
      return cluster;
    });
  }

  private sortClusters<T extends ICluster>(clusters: T[]): T[] {
    // Could be any predicate, but at least make it consistent between 2 page refresh
    return _.sortBy(clusters, ['targetType', 'name']);
  }

  private hasConnectorUpgradeAvailable(connector: IConnector, provisioning: IConnectorProvisioning): boolean {
    // Upgrade available if:
    // - is not currently upgrading
    // - version is different from the available version
    return provisioning.connectorType === connector.connectorType &&
      connector.upgradeState === 'upgraded' &&
      !_.isUndefined(provisioning.availableVersion) && connector.runningVersion !== provisioning.availableVersion;
  }

  private isConnectorUpgradeUrgent(connector: IConnector, provisioning: IConnectorProvisioning): boolean {
    return this.hasConnectorUpgradeAvailable(connector, provisioning) && provisioning.availablePackageIsUrgent;
  }

  private getMaintenanceModeForConnector(connector: IConnector): ConnectorMaintenanceMode {
    // `connector.maintenanceMode` should reflect the status it should be in (maps `maintenanceMode` on the node)
    // `connector.connectorStatus.maintenanceMode` is the latest mode received via an heartbeat
    const fromHeartbeat = _.get<IConnector, ConnectorMaintenanceMode>(connector, 'connectorStatus.maintenanceMode');
    if (connector.maintenanceMode === 'off') {
      return 'off';
    } else if (connector.maintenanceMode === 'on' && _.includes(['stopped', 'disabled', 'offline'], connector.state)) {
      return 'on';
    } else if (connector.maintenanceMode === 'on' && fromHeartbeat === 'off') {
      return 'pending';
    } else {
      return fromHeartbeat;
    }
  }

  // TODO: add unit tests
  private getMaintenanceModeForCluster(cluster: IClusterWithExtendedConnectors): ConnectorMaintenanceMode {
    if (_.some(cluster.connectors, (connector) => connector.extendedProperties.maintenanceMode === 'pending')) {
      return 'pending';
    } else if (_.some(cluster.connectors, (connector) => connector.extendedProperties.maintenanceMode === 'on')) {
      return 'on';
    } else {
      return 'off';
    }
  }

  private getUpgradeState(connectors: IExtendedConnector[]): 'upgraded' | 'upgrading' {
    const allAreUpgraded = _.every(connectors, { upgradeState: 'upgraded' });
    return allAreUpgraded ? 'upgraded' : 'upgrading';
  }

  public clearCache() {
    this.allResourcesCache.removeAll();
  }

  public upgradeSoftware(clusterId: string, connectorType: ConnectorType) {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/update/invoke?connectorType=${connectorType}&forced=true`;
    return this.$http.post(url, '')
      .then(this.extractDataFromResponse);
  }

  private initCache() {
    this.allResourcesCache = this.CacheFactory.get(HybridServicesClusterService.CACHE_KEY);
    if (!this.allResourcesCache) {
      this.allResourcesCache = new this.CacheFactory(HybridServicesClusterService.CACHE_KEY, {
        maxAge: HybridServicesClusterService.CACHE_AGE_DEFAULT,
        deleteOnExpire: HybridServicesClusterService.CACHE_EXPIRE_POLICY,
      });
    }
  }

  public getProperties(clusterId: string): ng.IPromise<IClusterPropertySet> {
    const url = `${this.UrlConfig.getHerculesUrl()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/properties`;
    return this.$http.get(url)
      .then(this.extractDataFromResponse);
  }

  public setProperties(clusterId: string, payload: IClusterPropertySet): ng.IPromise<{}> {
    const url = `${this.UrlConfig.getHerculesUrl()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/properties`;
    return this.$http.post(url, payload)
      .then((res) => {
        this.clearCache();
        return res;
      });
  }
}

export default angular
  .module('hercules.hybrid-services-cluster-service', [
    require('angular-cache'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/hybrid-services-cluster-states.service').default,
    require('modules/hercules/services/hybrid-services-utils.service').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/core/config/urlConfig'),
    require('modules/hercules/services/uss.service').default,
  ])
  .service('HybridServicesClusterService', HybridServicesClusterService)
  .name;
