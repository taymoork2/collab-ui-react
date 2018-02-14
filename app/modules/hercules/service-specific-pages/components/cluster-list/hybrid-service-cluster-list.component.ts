import { ConnectorType, HybridServiceId, IExtendedClusterServiceStatus, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import EnterprisePrivateTrunkServiceModuleName, { EnterprisePrivateTrunkService, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';
import HybridServicesUtilsServiceModuleName, { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';
import GridModule, { GridCellService } from 'modules/core/csgrid';
import './_hybrid-service-cluster-list.scss';
import HybridServicesClusterStatesServiceModuleName, { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import HybridServiceClusterServiceModuleName, { HighLevelStatusForService, HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class HybridServiceClusterListCtrl implements ng.IComponentController {

  public clusterListGridOptions: uiGrid.IGridOptions;
  public firstLoad = true;
  public gridApi: uiGrid.IGridApi;
  public state: string;

  private serviceId: HybridServiceId;
  private connectorType: ConnectorType;
  private clusterId: string;

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
  ) {
    this.updateClusters = this.updateClusters.bind(this);
    this.updateTrunks = this.updateTrunks.bind(this);
  }

  public $onInit() {
    if (this.serviceId !== 'ept') {
      this.connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(this.serviceId);
    }

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
        cellTemplate: require('modules/hercules/service-specific-pages/components/cluster-list/cluster-list-display-name.html'),
        width: '35%',
      }, {
        field: 'serviceStatus',
        displayName: this.$translate.instant('hercules.clusterListComponent.status-title'),
        cellTemplate: require('modules/hercules/service-specific-pages/components/cluster-list/cluster-list-status.html'),
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

  private updateTrunks() {
    this.clusterListGridOptions.data = this._keepOnlyRelevantServiceStatus((this.convertTrunkResourceToCluster(this.EnterprisePrivateTrunkService.getAllResources())));
    this.firstLoad = false;
  }

  private getClustersByConnectorType() {
    return this.HybridServicesClusterService.getAll()
      .then(response => {
        const clusters = _.chain(response)
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
        return clusters.sort((a, b) =>  a.name.localeCompare(b.name));
      });
  }

  private updateClusters() {
    return this.getClustersByConnectorType().then(clusters => {
      this.clusterListGridOptions.data = this._keepOnlyRelevantServiceStatus(clusters);
      this.$timeout(this.updateClusters, 30 * 1000);
      return clusters;
    });
  }

  private goToSidepanel(clusterId: string) {
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

  public _keepOnlyRelevantServiceStatus(clusters: IExtendedClusterFusion[]): any[] {
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
  public template = require('modules/hercules/service-specific-pages/components/cluster-list/hybrid-service-cluster-list.html');
  public bindings = {
    serviceId: '<',
    clusterId: '<',
    state: '@?',
  };
}

export default angular
  .module('hybrid-services-service-specific-cluster-list', [
    require('angular-ui-router'),
    require('angular-translate'),
    EnterprisePrivateTrunkServiceModuleName,
    GridModule,
    HybridServiceClusterServiceModuleName,
    HybridServicesClusterStatesServiceModuleName,
    HybridServicesUtilsServiceModuleName,
  ])
  .component('hybridServiceClusterList', new HybridServiceClusterListComponent())
  .name;
