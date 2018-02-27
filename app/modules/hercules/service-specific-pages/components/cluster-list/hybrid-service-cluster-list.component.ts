import { ConnectorType, HybridServiceId, IExtendedClusterServiceStatus, IExtendedClusterFusion, IExtendedConnector } from 'modules/hercules/hybrid-services.types';
import enterprisePrivateTrunkServiceModuleName, { EnterprisePrivateTrunkService, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';
import hybridServicesUtilsServiceModuleName, { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import gridModuleName, { GridCellService } from 'modules/core/csgrid';
import './_hybrid-service-cluster-list.scss';
import hybridServicesClusterStatesServiceModuleName, { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import hybridServiceClusterServiceModuleName, { HighLevelStatusForService, HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';
import ussServiceName, { IExtendedStatusByClusters, USSService } from 'modules/hercules/services/uss.service';
import * as ngTranslateModuleName from 'angular-translate';

interface ISelectOption {
  label: string;
  value: string;
}

export class HybridServiceClusterListCtrl implements ng.IComponentController {
  public clusterListGridOptions: uiGrid.IGridOptions;
  public firstLoad = true;
  public gridApi: uiGrid.IGridApi;
  public state: string;
  public hasCapacityFeatureToggle: boolean;
  public hasResourceGroups: boolean;
  public defaultOptions: ISelectOption[] = [{
    label: this.$translate.instant('hercules.capacity.allClusters'),
    value: 'all',
  }, {
    label: this.$translate.instant('hercules.capacity.noInARG'),
    value: 'unassigned',
  }];
  public options: ISelectOption[] = [];
  public selectedOption: ISelectOption = this.defaultOptions[0];
  public allRelevantClusters: IExtendedClusterFusion[];
  public userStatusesByClustersSummary: IExtendedStatusByClusters[] | undefined;
  public capacity = 0;
  public maxUsers = 0;
  public tooltip: string = '';
  public progressBarType: 'success' | 'warning' | 'danger' = 'success';

  private subscribeStatusesSummary: any;
  private serviceId: HybridServiceId;
  private connectorType: ConnectorType;
  private clusterId: string;
  private timeoutTimer: ng.IPromise<any> | null;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private GridCellService: GridCellService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
    private USSService: USSService,
  ) {
    this.updateClusters = this.updateClusters.bind(this);
    this.updateTrunks = this.updateTrunks.bind(this);
  }

  private extractSummary() {
    this.userStatusesByClustersSummary = this.USSService.extractSummaryForClusters([this.serviceId]);
  }

  public $onInit() {
    if (this.serviceId !== 'ept') {
      this.connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(this.serviceId);
    }

    this.extractSummary();
    this.subscribeStatusesSummary = this.USSService.subscribeStatusesSummary('data', this.extractSummary.bind(this));

    // Setup the grid
    this.clusterListGridOptions = {
      enableRowSelection: true,
      rowHeight: 75,
      appScopeProvider: {
        goToSidepanel: (row: uiGrid.IGridRow) => {
          this.goToSidepanel(row.entity.id);
        },
        keypressSidepanel: (grid: uiGrid.IGridInstance, row: uiGrid.IGridRow) => {
          this.GridCellService.selectRow(grid, row);
          this.goToSidepanel(row.entity.id);
        },
      },
      columnDefs: [{
        field: 'name',
        displayName: this.$translate.instant(`hercules.clusterListComponent.clusters-title-${this.serviceId}`),
        cellTemplate: require('./cluster-list-display-name.html'),
        width: '35%',
      }, {
        field: 'serviceStatus',
        displayName: this.$translate.instant('hercules.clusterListComponent.status-title'),
        cellTemplate: require('./cluster-list-status.html'),
        width: '65%',
      }],
      onRegisterApi: (gridApi) => {
        this.gridApi = gridApi;
        if (!_.isUndefined(this.clusterId) && this.clusterId !== null) {
          this.goToSidepanel(this.clusterId);
        }
      },
    };

    // Fecth first data and setup polling
    if (this.serviceId !== 'ept') {
      this.updateClusters()
        .finally(() => {
          this.firstLoad = false;
        });
    } else if (this.serviceId === 'ept') {
      this.clusterListGridOptions.data = this._keepOnlyRelevantServiceStatus(this.convertTrunkResourceToCluster(this.EnterprisePrivateTrunkService.getAllResources()));
      this.updateTrunks();
      this.EnterprisePrivateTrunkService.subscribe('data', this.updateTrunks, {
        scope: this.$scope,
      });
    }
  }

  public $onDestroy(): void {
    this.subscribeStatusesSummary.cancel();
    if (this.timeoutTimer) {
      this.$timeout.cancel(this.timeoutTimer);
    }
  }

  public showResourceGroupBar(): boolean {
    return this.hasCapacityFeatureToggle;
  }

  public showSelect(): boolean {
    return this.hasResourceGroups;
  }

  public someClustersAreInAResourceGroup(): boolean {
    return _.some(this.allRelevantClusters, cluster => !!cluster.resourceGroupId);
  }

  public showCapacityNA(): boolean {
    return (this.selectedOption.value === 'all' && this.someClustersAreInAResourceGroup()) ||
      this.maxUsers === 0;
  }

  private updateCapacity(clusters: IExtendedClusterFusion[]): void {
    this.maxUsers = _.chain(clusters)
      .map(cluster => cluster.connectors)
      .flatten<IExtendedConnector>()
      .filter(connector => connector.connectorType === this.connectorType)
      .map(connector => connector.userCapacity)
      .sum()
      .value();

    let users = 0;
    const relevantClusterIds = _.reduce(clusters, (acc, cluster) => {
      acc.push(cluster.id);
      // The data we get from the User Statuses summary could use the legacy device id instead of the current cluster id
      if (cluster.legacyDeviceClusterId) {
        acc.push(cluster.legacyDeviceClusterId);
      }
      return acc;
    }, <string[]>[]);
    if (this.userStatusesByClustersSummary && this.userStatusesByClustersSummary.length > 0) {
      users = _.sum(_.map(this.userStatusesByClustersSummary, summary => {
        if (_.includes(relevantClusterIds, summary.id)) {
          return summary.users;
        }
        return 0;
      }));
    }
    this.capacity = Math.ceil(users / this.maxUsers * 100);
    if (this.capacity > 90) {
      this.progressBarType = 'danger';
    } else if (this.capacity > 60) {
      this.progressBarType = 'warning';
    }
    this.tooltip = this.$translate.instant('hercules.capacity.tooltip', {
      capacity: this.capacity,
      total: users,
      max: this.maxUsers,
    });
  }

  private updateUI(option: ISelectOption): void {
    let clustersToDisplay: IExtendedClusterFusion[] = [];
    if (option.value === 'all') {
      clustersToDisplay = _.clone(this.allRelevantClusters);
    } else if (option.value === 'unassigned') {
      clustersToDisplay = _.clone(_.filter(this.allRelevantClusters, cluster => !cluster.resourceGroupId));
    } else {
      clustersToDisplay = _.clone(_.filter(this.allRelevantClusters, cluster => cluster.resourceGroupId === option.value));
    }
    this.clusterListGridOptions.data = clustersToDisplay;
    this.updateCapacity(clustersToDisplay);
  }

  private updateTrunks() {
    this.clusterListGridOptions.data = this._keepOnlyRelevantServiceStatus((this.convertTrunkResourceToCluster(this.EnterprisePrivateTrunkService.getAllResources())));
    this.firstLoad = false;
  }

  private getClustersByConnectorType(): ng.IPromise<IExtendedClusterFusion[]> {
    return this.HybridServicesClusterService.getResourceGroups()
      .then(response => {
        if (response.groups.length > 0) {
          this.options = this.defaultOptions.concat(_.map(response.groups, group => {
            return {
              label: this.$translate.instant('hercules.capacity.clustersIn', { name: group.name }),
              value: group.id,
            };
          }).sort((a, b) =>  a.label.localeCompare(b.label)));
          this.hasResourceGroups = true;
        } else {
          this.hasResourceGroups = false;
        }

        const allRelevantClusters = _.chain(response.groups)
          .map('clusters')
          .flatten<IExtendedClusterFusion>()
          .concat(response.unassigned)
          .filter(cluster => {
            return _.some(cluster.provisioning, { connectorType: this.connectorType });
          })
          .map(cluster => {
            return {
              ...cluster,
              connectors: _.filter(cluster.connectors, { connectorType: this.connectorType }),
            };
          })
          .value();

        return this._keepOnlyRelevantServiceStatus(allRelevantClusters);
      });
  }

  private updateClusters(): ng.IPromise<IExtendedClusterFusion[]> {
    return this.getClustersByConnectorType().then(clusters => {
      this.allRelevantClusters = clusters;
      this.clusterListGridOptions.data = clusters;
      this.updateUI(this.selectedOption);
      this.timeoutTimer = this.$timeout(this.updateClusters, 30 * 1000);
      return clusters;
    });
  }

  private goToSidepanel(clusterId: string): void {
    const routeMap = {
      ept: 'private-trunk-sidepanel',
      'squared-fusion-cal': 'expressway-cluster-sidepanel',
      'squared-fusion-uc': 'expressway-cluster-sidepanel',
      'spark-hybrid-impinterop': 'expressway-cluster-sidepanel',
      'squared-fusion-media': 'media-cluster-details',
      'spark-hybrid-datasecurity': 'hds-cluster-details',
      'contact-center-context': 'context-cluster-sidepanel',
    };
    this.$state.go(routeMap[this.serviceId], {
      clusterId: clusterId,
      connectorType: this.connectorType,
    });
  }

  private _keepOnlyRelevantServiceStatus(clusters: IExtendedClusterFusion[]): IExtendedClusterFusion[] {
    return _.map(clusters, (cluster: any) => {
      // Augment cluster.extendedProperties by adding a new property, servicesStatuses, derived from servicesStatuseses, just for this page!
      cluster.extendedProperties.servicesStatus = _.find(cluster.extendedProperties.servicesStatuses, (serviceStatus: IExtendedClusterServiceStatus) => {
        return serviceStatus.serviceId === this.serviceId;
      });
      return cluster;
    });
  }

  /**
   * Huge hack to please the typing system. We really expect clusters but private trunks are too different…
   * @param trunks
   */
  private convertTrunkResourceToCluster(trunks: IPrivateTrunkResourceWithStatus[]): IExtendedClusterFusion[] {
    return _.map(trunks, trunk => {
      return <IExtendedClusterFusion>{
        allowedRegistrationHostsUrl: '',
        createdAt: '',
        connectors: [],
        id: trunk.uuid,
        name: trunk.name,
        provisioning: [],
        releaseChannel: '',
        targetType: 'ept',
        upgradeSchedule: {
          moratoria: [],
          nextUpgradeWindow: {
            endTime: '',
            startTime: '',
          },
          scheduleDays: [],
          scheduleTime: '03:00',
          scheduleTimeZone: '',
          urgentScheduleTime: '00:00',
          url: '',
        },
        upgradeScheduleUrl: '',
        url: '',
        extendedProperties: {
          alarms: 'none',
          alarmsBadgeCss: '',
          allowedRedirectTarget: undefined,
          hasUpgradeAvailable: false,
          isUpgradeUrgent: false,
          isEmpty: false,
          maintenanceMode: 'off',
          registrationTimedOut: false,
          servicesStatuses: [{
            serviceId: 'ept',
            state: {
              cssClass: this.HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(trunk.status.state as HighLevelStatusForService),
              name: trunk.status.state,
            },
            total: 1,
          }],
          upgradeState: 'upgraded',
        },
      };
    });
  }
}

export class HybridServiceClusterListComponent implements ng.IComponentOptions {
  public controller = HybridServiceClusterListCtrl;
  public template = require('./hybrid-service-cluster-list.html');
  public bindings = {
    clusterId: '<',
    hasCapacityFeatureToggle: '<',
    serviceId: '<',
    state: '@?',
  };
}

export default angular
  .module('hybrid-services-service-specific-cluster-list', [
    require('angular-ui-router'),
    ngTranslateModuleName,
    enterprisePrivateTrunkServiceModuleName,
    gridModuleName,
    hybridServiceClusterServiceModuleName,
    hybridServicesClusterStatesServiceModuleName,
    hybridServicesUtilsServiceModuleName,
    ussServiceName,
  ])
  .component('hybridServiceClusterList', new HybridServiceClusterListComponent())
  .name;
