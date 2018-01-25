import { ConnectorType, ClusterTargetType, IExtendedClusterFusion, IExtendedConnector, IExtendedConnectorAlarm, IConnectorAlarm } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class ClusterSidepanelOverviewCtrl implements ng.IComponentController {

  private clusterId: string;

  private cluster: IExtendedClusterFusion;
  public hasResourceGroupFeatureToggle: boolean;

  public clusterType: ClusterTargetType;
  public connectorType: ConnectorType;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private HybridServicesClusterService: HybridServicesClusterService,
  ) {
    this.updateCluster = this.updateCluster.bind(this);
  }

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
    this.$rootScope.$broadcast('displayNameUpdated');
    this.updateCluster();
  }

  private updateCluster() {
    this.HybridServicesClusterService.getAll()
      .then(clusters => {
        this.cluster = this.addAggregatedAlarms(_.find(clusters, { id: this.clusterId }));
        this.$timeout(this.updateCluster, 30 * 1000);
      });
  }

  private addAggregatedAlarms(cluster: any): IExtendedClusterFusion {
    cluster.extendedProperties.aggregatedAlarms = this.mergeAllAlarms(cluster.connectors);
    return cluster;
  }

  /**
   * For each connector, extract their alarms, add the hostname and affectedNodes properties to them
   * flatten the list, sort them by first time reported, remove duplicates and return them.
   * WARING: made public only for testing
   * @param connectors list of connectors
   */
  public mergeAllAlarms(connectors: IExtendedConnector[]): IExtendedConnectorAlarm[] {
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
      .sortBy(e => e.firstReported)
      .value();

    // The Lodash type definition for _.uniqWith() doesn't allow _.uniqWith<IExtendedConnectorAlarm>()…
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
    const deduplicatedAlarms = _.sortBy(uniques, e => e.id);

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
          alarm.affectedNodes = _.flatMap(alarmSiblings, a => a.hostname);
          alarm.affectedNodes.sort();
        });
      });
    }
    return deduplicatedAlarms;
  }

  public isExpresswayCluster() {
    return this.cluster && this.cluster.targetType === 'c_mgmt';
  }

  public isHDSCluster() {
    return this.cluster && this.cluster.targetType === 'hds_app';
  }

  public isMediaCluster() {
    return this.cluster && this.cluster.targetType === 'mf_mgmt';
  }

  public isContextCluster() {
    return this.cluster && this.cluster.targetType === 'cs_mgmt';
  }

  public hasConnectors() {
    return this.cluster && this.cluster.connectors.length > 0;
  }

  public goToNodesPage(): void {
    if (this.cluster.targetType === 'c_mgmt') {
      this.$state.go('expressway-cluster.nodes', {
        id: this.clusterId,
        backState: this.connectorType === 'c_cal' ? 'calendar-service.list' : 'call-service.list',
      });
    } else if (this.cluster.targetType === 'mf_mgmt') {
      this.$state.go('mediafusion-cluster.nodes', {
        id: this.clusterId,
        backState: 'media-service-v2.list',
      });
    } else if (this.cluster.targetType === 'hds_app') {
      this.$state.go('hds-cluster.nodes', {
        id: this.clusterId,
        backState: 'hds.list',
      });
    } else if (this.isContextCluster()) {
      this.$state.go('context-cluster.nodes', {
        id: this.clusterId,
        backState: 'context-resources',
      });
    }
  }

  public showButtonToNodesPage(): boolean {
    // Doesn't make sense for empty Expressways and EPT
    // Media doesn't really use the nodes page yet, they still have the node list on this sidepanel
    return !(this.isExpresswayCluster() && !this.hasConnectors()) &&
      !this.isMediaCluster();
  }
}

export class ClusterSidepanelOverviewComponent implements ng.IComponentOptions {
  public controller = ClusterSidepanelOverviewCtrl;
  public template = require('modules/hercules/cluster-sidepanel/cluster-sidepanel-overview/cluster-sidepanel-overview.html');
  public bindings = {
    clusterType: '<',
    clusterId: '<',
    connectorType: '<',
    hasResourceGroupFeatureToggle: '<',
  };
}
