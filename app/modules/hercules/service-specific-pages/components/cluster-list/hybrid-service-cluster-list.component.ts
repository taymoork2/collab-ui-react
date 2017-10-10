import { ClusterService } from 'modules/hercules/services/cluster-service';
import { ConnectorType, HybridServiceId, IExtendedCluster } from 'modules/hercules/hybrid-services.types';
import { EnterprisePrivateTrunkService, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';
import { HybridServicesUtilsService } from 'modules/hercules/services/hybrid-services-utils.service';

import './_hybrid-service-cluster-list.scss';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { HighLevelStatusForService } from 'modules/hercules/services/hybrid-services-cluster.service';

export interface IGridApiScope extends ng.IScope {
  gridApi?: any;
}

export class HybridServiceClusterListCtrl implements ng.IComponentController {

  public clusterList: any = {};
  public clusterListGridOptions = {};
  public firstLoad = true;

  private serviceId: HybridServiceId;
  private connectorType: ConnectorType | undefined;
  private clusterId: string;

  /* @ngInject */
  constructor(
    private $scope: IGridApiScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private ClusterService: ClusterService,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private HybridServicesUtilsService: HybridServicesUtilsService,
  ) {
    this.updateClusters = this.updateClusters.bind(this);
    this.updateTrunks = this.updateTrunks.bind(this);
  }

  /**
   * Huge hack to please the typing system. We really expect clusters but private trunks are too different…
   * @param trunks
   */
  private convertTrunkResourceToCluster(trunks: IPrivateTrunkResourceWithStatus[]): IExtendedCluster[] {
    return _.map(trunks, (trunk) => {
      return <IExtendedCluster>{
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
        aggregates: {
          alarms: [],
          state: 'running',
          upgradeState: 'upgraded',
          provisioning: {
            availablePackageIsUrgent: false,
            availableVersion: '',
            connectorType: 'c_ucmc',
            packageUrl: '',
            provisionedVersion: '',
            url: '',
          },
          upgradeAvailable: false,
          upgradeWarning: false,
          hosts: [],
        },
        extendedProperties: {
          alarms: 'none',
          alarmsBadgeCss: '',
          allowedRedirectTarget: undefined,
          hasUpgradeAvailable: false,
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

  public $onInit() {
    this.connectorType = this.HybridServicesUtilsService.serviceId2ConnectorType(this.serviceId);
    if (this.serviceId !== 'ept' && this.connectorType !== undefined) {
      this.clusterList = this._keepOnlyRelevantServiceStatus(this.ClusterService.getClustersByConnectorType(this.connectorType));
    } else {
      this.clusterList = this._keepOnlyRelevantServiceStatus(this.convertTrunkResourceToCluster(this.EnterprisePrivateTrunkService.getAllResources()));
    }

    this.clusterListGridOptions = {
      data: '$ctrl.clusterList',
      enableSorting: false,
      multiSelect: false,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      rowHeight: 75,
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
        this.$scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.goToSidepanel(row.entity.id);
        });
        if (!_.isUndefined(this.clusterId) && this.clusterId !== null) {
          this.goToSidepanel(this.clusterId);
        }
      },
    };
    if (this.serviceId === 'ept') {
      this.EnterprisePrivateTrunkService.subscribe('data', this.updateTrunks, {
        scope: this.$scope,
      });
    } else {
      this.ClusterService.subscribe('data', this.updateClusters, {
        scope: this.$scope,
      });
    }
  }

  private updateTrunks() {
    if (this.serviceId === 'ept') {
      this.clusterList = this._keepOnlyRelevantServiceStatus((this.convertTrunkResourceToCluster(this.EnterprisePrivateTrunkService.getAllResources())));
    }
    this.firstLoad = false;
  }

  protected updateClusters() {
    if (this.connectorType === undefined) {
      this.firstLoad = false;
      return;
    }
    this.clusterList = this._keepOnlyRelevantServiceStatus(this.ClusterService.getClustersByConnectorType(this.connectorType));
    this.firstLoad = false;
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

  public _keepOnlyRelevantServiceStatus(clusters: IExtendedCluster[]): any[] {
    return _.map(clusters, (cluster: any) => {
      // Augment cluster.extendedProperties just for this page!
      cluster.extendedProperties.servicesStatus = _.find(cluster.extendedProperties.servicesStatuses, (serviceStatus: any) => {
        return serviceStatus.serviceId === this.serviceId;
      });
      return cluster;
    });
  }
}

export class HybridServiceClusterListComponent implements ng.IComponentOptions {
  public controller = HybridServiceClusterListCtrl;
  public template = require('modules/hercules/service-specific-pages/components/cluster-list/hybrid-service-cluster-list.html');
  public bindings = {
    serviceId: '<',
    clusterId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('hybridServiceClusterList', new HybridServiceClusterListComponent())
  .name;
