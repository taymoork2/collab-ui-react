// This service should obsolete ClusterService during 2017
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import { ICluster, ConnectorType, HybridServiceId, IFMSOrganization, ITimeWindow, ClusterTargetType, IExtendedClusterFusion, StatusIndicatorCSSClass, IExtendedClusterServiceStatus, IMoratoria, IHost, IConnector, ConnectorAlarmSeverity, IExtendedConnector } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HybridServicesExtrasService, IAllowedRegistrationHost } from 'modules/hercules/services/hybrid-services-extras.service';
import { USSService } from 'modules/hercules/services/uss.service';

interface IOtherServiceStatus {
  serviceId: HybridServiceId;
  setup: boolean;
  status: HighLevelStatusForService;
  statusCss: StatusIndicatorCSSClass;
}

interface IResourceGroup {
  clusters: IExtendedClusterFusion[];
  id: string;
  name: string;
  numberOfUsers: number | '?';
  releaseChannel: string;
}

export interface IResourceGroups {
  groups: IResourceGroup[];
  unassigned: IExtendedClusterFusion[];
}

type HighLevelStatusForService = 'setupNotComplete' | 'outage' | 'impaired' | 'operational';

export class HybridServicesClusterService {
  private static readonly CONTEXT_CONNECTOR_OLD_VERSION = '2.0.1-10131';
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private HybridServicesExtrasService: HybridServicesExtrasService,
    private UrlConfig,
    private USSService: USSService,
  ) {
    this.addExtendedPropertiesToClusters = this.addExtendedPropertiesToClusters.bind(this);
    this.addServicesStatuses = this.addServicesStatuses.bind(this);
    this.addUserCount = this.addUserCount.bind(this);
    this.extractClustersFromResponse = this.extractClustersFromResponse.bind(this);
    this.extractDataFromResponse = this.extractDataFromResponse.bind(this);
    this.filterClustersWithBadContextConnectors = this.filterClustersWithBadContextConnectors.bind(this);
    this.filterUnknownClusters = this.filterUnknownClusters.bind(this);
    this.sortClusters = this.sortClusters.bind(this);
  }

  public deleteMoratoria(clusterId: string, moratoriaId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/upgradeSchedule/moratoria/${moratoriaId}`;
    return this.$http.delete<''>(url)
      .then(this.extractDataFromResponse);
  }

  public deprovisionConnector(clusterId: string, connectorType: ConnectorType): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/remove/invoke?connectorType=${connectorType}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public deregisterCluster(clusterId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/actions/deregisterCluster/invoke?clusterId=${clusterId}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public deregisterEcpNode(connectorId: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/actions/deregister/invoke?managementConnectorId=${connectorId}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public get(clusterId: string, orgId?: string): ng.IPromise<IExtendedClusterFusion> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/clusters/${clusterId}?fields=@wide`;
    return this.$http.get<ICluster>(url)
      .then(this.extractDataFromResponse)
      .then((cluster) => {
        let clusters = this.filterClustersWithBadContextConnectors([cluster]);
        clusters = _.map(clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector);
            }),
          };
        });
        return clusters[0];
      })
      .then((cluster) => {
        return this.addExtendedPropertiesToClusters([cluster])
          .then((clusters) => {
            return clusters[0];
          });
      })
      .then((cluster) => {
        const clusters = this.addServicesStatuses([cluster]);
        return clusters[0];
      });
  }

  public getAll(orgId?: string): ng.IPromise<IExtendedClusterFusion[]> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}?fields=@wide`;
    return this.$http.get<IFMSOrganization>(url)
      .then(this.extractClustersFromResponse)
      .then(this.filterUnknownClusters)
      .then(this.filterClustersWithBadContextConnectors)
      .then(this.addExtendedPropertiesToClusters)
      .then((clusters) => {
        return _.map(clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector);
            }),
          };
        });
      })
      .then(this.addServicesStatuses)
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

  public getResourceGroups(): ng.IPromise<IResourceGroups> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}?fields=@wide`;
    return this.$http.get<IFMSOrganization>(url)
      .then(this.extractDataFromResponse)
      .then((org) => {
        org.clusters = this.filterUnknownClusters(org.clusters);
        org.clusters = this.filterClustersWithBadContextConnectors(org.clusters);
        org.clusters = _.map(org.clusters, cluster => {
          return {
            ...cluster,
            connectors: _.map(cluster.connectors, connector => {
              return this.addExtendedPropertiesToConnector(connector);
            }),
          };
        });
        org.clusters = this.addServicesStatuses(org.clusters);
        return org;
      })
      // addInfoToEmptyExpresswayClusters
      .then((org) => {
        return this.addExtendedPropertiesToClusters(org.clusters)
          .then((clusters) => {
            org.clusters = clusters;
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

  public getStatusForService(serviceId: HybridServiceId, clusterList: IExtendedClusterFusion[]): IOtherServiceStatus {
    const status = this.processClustersToAggregateStatusForService(serviceId, clusterList);
    const serviceStatus = {
      serviceId: serviceId,
      setup: this.processClustersToSeeIfServiceIsSetup(serviceId, clusterList),
      status: status,
      statusCss: this.HybridServicesClusterStatesService.getStatusIndicatorCSSClass(status),
    };
    return serviceStatus;
  }

  public getUnassignedClusters(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, (cluster) => {
      return cluster.resourceGroupId === undefined;
    });
  }

  public postponeUpgradeSchedule(id: string, upgradeWindow: ITimeWindow): ng.IPromise<IMoratoria> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${id}/upgradeSchedule/moratoria`;
    return this.$http.post<IMoratoria>(url, { timeWindow: upgradeWindow })
      .then(this.extractDataFromResponse);
  }

  public preregisterCluster(name: string, releaseChannel: string, targetType: ClusterTargetType): ng.IPromise<ICluster> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters`;
    return this.$http.post<ICluster>(url, {
      name: name,
      releaseChannel: releaseChannel,
      targetType: targetType,
    })
    .then(this.extractDataFromResponse);
  }

  public processClustersToAggregateStatusForService(serviceId: HybridServiceId, clusterList: IExtendedClusterFusion[]): HighLevelStatusForService {
    // get the aggregated statuses per cluster, and transform them into a flat array that
    // represents the state of each cluster for only that service, e.g. ['stopped', 'running']
    const statuses = _.chain(clusterList)
      .map('servicesStatuses')
      .flatten()
      .filter({ serviceId: serviceId })
      .map((service: IExtendedClusterServiceStatus) => {
        return service.state ? service.state.name : 'unknown';
      })
      .value();

    if (statuses.length === 0 || _.every(statuses, (value) => {
      return value === 'not_installed';
    })) {
      return 'setupNotComplete';
    }

    // For Hybrid Media we have to handle upgrading scenario differently than expressway
    // ⚠️ STATUSES CAN'T BE upgrading
    // if (serviceId === 'squared-fusion-media') {
    //   if (_.every(statuses, (value) => {
    //     return (value === 'upgrading');
    //   })) {
    //     return 'outage';
    //   }

    //   if (_.find(statuses, (value) => {
    //     return (value === 'upgrading');
    //   })) {
    //     return 'impaired';
    //   }
    // }

    // We have an outage if all clusters have their connectors in these states or combinations of them:
    if (_.every(statuses, (value) => {
      return (value === 'unknown' || value === 'stopped' || value === 'disabled' || value === 'offline' || value === 'not_configured' || value === 'not_operational');
    })) {
      return 'outage';
    }

    // Service is degraded if one or more clusters have their connectors in one of these states:
    if (_.find(statuses, (value) => {
      // TODO: handle alams?
      return (value === 'stopped' || value === 'not_operational' || value === 'disabled' || value === 'offline');
    })) {
      return 'impaired';
    }

    // fallback: if no connectors are running, return at least 'degraded'
    if (!_.includes(statuses, 'running')) {
      return 'impaired';
    }

    // if no other rule applies, assume we're operational!
    return 'operational';
  }

  public processClustersToSeeIfServiceIsSetup(serviceId: HybridServiceId, clusterList: ICluster[]): boolean {
    const connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(serviceId);
    if (!connectorType) {
      return false; // Cannot recognize service, default to *not* enabled
    }

    if (serviceId === 'squared-fusion-media') {
      return _.some(clusterList, { targetType: 'mf_mgmt' });
    } else if (serviceId === 'contact-center-context') {
      return _.some(clusterList, { targetType: 'cs_mgmt' });
    } else if (serviceId === 'spark-hybrid-datasecurity') {
      return _.some(clusterList, { targetType: 'hds_app' });
    } else {
      return _.chain(clusterList)
        .map('provisioning')
        .flatten()
        .some({ connectorType: connectorType })
        .value();
    }
  }

  public provisionConnector(clusterId: string, connectorType: ConnectorType): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}/provisioning/actions/add/invoke?connectorType=${connectorType}`;
    return this.$http.post<''>(url, null)
      .then(this.extractDataFromResponse);
  }

  public serviceIsSetUp(serviceId: HybridServiceId): ng.IPromise<boolean> {
    return this.getAll()
      .then((clusterList) => {
        return this.processClustersToSeeIfServiceIsSetup(serviceId, clusterList);
      });
  }

  public addExtendedPropertiesToClusters(clusters: ICluster[]): ng.IPromise<IExtendedClusterFusion[]> {
    const promises = _.chain(clusters)
      .map((cluster) => {
        return {
          ...cluster,
          extendedProperties: {
            isEmptyExpresswayCluster: cluster.targetType === 'c_mgmt' && _.size(cluster.connectors) === 0,
          },
        };
      })
      .map((cluster: IExtendedClusterFusion) => {
        if (cluster.extendedProperties.isEmptyExpresswayCluster) {
          return this.HybridServicesExtrasService.getPreregisteredClusterAllowList(cluster.id)
            .then((allowList: IAllowedRegistrationHost[]) => {
              const extendedProperties = {
                allowedRedirectTarget: allowList[0],
                isEmptyExpresswayCluster: cluster.extendedProperties.isEmptyExpresswayCluster,
                registrationTimedOut: _.isUndefined(allowList[0]),
              };
              // The `if (cluster.aggregates)` is there to indicate this method is used to 'augment' the cluster array
              // from hybrid-service-cluster-list#updateClusters(), not from getResourceGroups() in this very file.
              // TODO: handle registrationTimeout in new UI
              // if (cluster.aggregates && !cluster.extendedProperties.allowedRedirectTarget) {
              //   extraProperties['aggregates'] = { state: 'registrationTimeout' };
              // }
              return _.merge({}, cluster, { extendedProperties });
            });
        } else {
          return this.$q.resolve(cluster);
        }
      })
      .value();
    return this.$q.all(promises);
  }

  public setClusterInformation(clusterId: string, data: { name?: string; releaseChannel?: string; }): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${clusterId}`;
    return this.$http.patch<''>(url, data)
      .then(this.extractDataFromResponse);
  }

  public setUpgradeSchedule(id: string, params: any): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${this.Authinfo.getOrgId()}/clusters/${id}/upgradeSchedule`;
    return this.$http.patch<''>(url, params)
      .then(this.extractDataFromResponse);
  }

  public updateHost(serial: string, params: any, orgId?: string): ng.IPromise<''> {
    const url = `${this.UrlConfig.getHerculesUrlV2()}/organizations/${orgId || this.Authinfo.getOrgId()}/hosts/${serial}`;
    return this.$http.patch<''>(url, params)
      .then(this.extractDataFromResponse);
  }

  // PRIVATE

  /**
   * Take the connector data straigth from the API and adds a property named
   * `extendedProperties` containing `alarms` and `alarmsBadgeCss`. They represent
   * an overview of the alarms we can find on the connector.
   * @param {connector} IConnector
   * @return {IExtendedConnector}
   */
  private addExtendedPropertiesToConnector(connector: IConnector): IExtendedConnector {
    let alarms: 'none' | 'warning' | 'error' = 'none'; // type duplicate of what's inside hybrid-services.types.ts
    if (connector.alarms.length > 0) {
      alarms = _.some(connector.alarms, (alarm) => alarm.severity === 'critical' || alarm.severity === 'error') ? 'error' : 'warning';
    }
    return {
      ...connector,
      extendedProperties: {
        alarms: alarms,
        alarmsBadgeCss: this.HybridServicesClusterStatesService.getAlarmSeverityCssClass(alarms as ConnectorAlarmSeverity),
      },
    };
  }

  private addServicesStatuses(clusters: ICluster[]): IExtendedClusterFusion[] {
    return _.map<ICluster, IExtendedClusterFusion>(clusters, cluster => {
      if (cluster.targetType === 'c_mgmt') {
        const mgmtConnectors = _.filter(cluster.connectors, { connectorType: 'c_mgmt' });
        const ucmcConnectors = _.filter(cluster.connectors, { connectorType: 'c_ucmc' });
        const calConnectors = _.filter(cluster.connectors, { connectorType: 'c_cal' });
        const impConnectors = _.filter(cluster.connectors, { connectorType: 'c_imp' });
        (cluster as IExtendedClusterFusion).servicesStatuses = [{
          serviceId: 'squared-fusion-mgmt',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(mgmtConnectors),
          total: mgmtConnectors.length,
        }, {
          serviceId: 'squared-fusion-uc',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(ucmcConnectors),
          total: ucmcConnectors.length,
        }, {
          serviceId: 'squared-fusion-cal',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(calConnectors),
          total: calConnectors.length,
        }, {
          serviceId: 'spark-hybrid-impinterop',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(impConnectors),
          total: impConnectors.length,
        }];
      } else if (cluster.targetType === 'mf_mgmt') {
        const mediaConnectors = _.filter(cluster.connectors, { connectorType: 'mf_mgmt' });
        (cluster as IExtendedClusterFusion).servicesStatuses = [{
          serviceId: 'squared-fusion-media',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(mediaConnectors),
          total: mediaConnectors.length,
        }];
      } else if (cluster.targetType === 'hds_app') {
        const hdsConnectors = _.filter(cluster.connectors, { connectorType: 'hds_app' });
        (cluster as IExtendedClusterFusion).servicesStatuses = [{
          serviceId: 'spark-hybrid-datasecurity',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(hdsConnectors),
          total: hdsConnectors.length,
        }];
      } else if (cluster.targetType === 'cs_mgmt') {
        const hybridContextConnectors = _.filter(cluster.connectors, connector => (connector.connectorType === 'cs_mgmt' || connector.connectorType === 'cs_context'));
        (cluster as IExtendedClusterFusion).servicesStatuses = [{
          serviceId: 'contact-center-context',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(hybridContextConnectors),
          total: hybridContextConnectors.length,
        }];
      } else if (cluster.targetType === 'ucm_mgmt') {
        const ucmConnectors = _.filter(cluster.connectors, { connectorType: 'ucm_mgmt' });
        (cluster as IExtendedClusterFusion).servicesStatuses = [{
          serviceId: 'squared-fusion-khaos',
          state: this.HybridServicesClusterStatesService.getMergedStateSeverity(ucmConnectors),
          total: ucmConnectors.length,
        }];
      }
      return (cluster as IExtendedClusterFusion);
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

  private extractClustersFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>): ICluster[] {
    return _.get(this.extractDataFromResponse(response), 'clusters', []);
  }

  private extractDataFromResponse<T>(response: ng.IHttpPromiseCallbackArg<T>): T {
    return _.get<T>(response, 'data');
  }

  private filterUnknownClusters(clusters: ICluster[]): ICluster[] {
    return _.filter(clusters, cluster => {
      return cluster.targetType !== 'unknown';
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
}

export default angular
  .module('hercules.cluster-service', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/hercules/services/hybrid-services-cluster-states.service').default,
    require('modules/hercules/services/hybrid-services-utils.service').default,
    require('modules/hercules/services/hybrid-services-extras.service').default,
    require('modules/core/config/urlConfig'),
    require('modules/hercules/services/uss.service').default,
  ])
  .service('HybridServicesClusterService', HybridServicesClusterService)
  .name;
