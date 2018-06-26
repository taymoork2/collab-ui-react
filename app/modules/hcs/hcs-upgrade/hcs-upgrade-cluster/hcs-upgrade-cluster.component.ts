import { HcsUpgradeService, HcsControllerService, GROUP_TYPE_UNASSIGNED, INodeSummaryItem, IHcsClusterSummaryItem, IUpgradeClusterGridRow, IHcsCustomer, IHcsUpgradeCustomer, ISoftwareProfile } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';
import { STATUS_SOFTWARE_UPGRADE_NEEDED } from 'modules/hcs/hcs-inventory/shared';

export interface IHeaderTab {
  title: string;
  state: string;
}

export class UpgradeClusterComponent implements ng.IComponentOptions {
  public controller = UpgradeClusterCtrl;
  public template = require('./hcs-upgrade-cluster.component.html');
  public bindings = {
    groupId: '<',
  };
}

export class UpgradeClusterCtrl implements ng.IComponentController {
  public gridOptions;
  public gridColumns;
  public groupId: string;
  public groupName: string;
  public customerId: string | undefined;
  private clusterGridData: IUpgradeClusterGridRow[];
  public showGrid: boolean = false;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';
  public typeUnassigned: string = GROUP_TYPE_UNASSIGNED;
  public loading: boolean;
  public statusSwUpgradeNeeded: string = STATUS_SOFTWARE_UPGRADE_NEEDED;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private $q: ng.IQService,
    private $modal,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
    private HcsControllerService: HcsControllerService,
  ) { }

  public startUpgrade(entity) {
    this.$modal.open({
      template: `<hcs-upgrade-modal dismiss="$dismiss()" group-id="${this.groupId}" cluster-name="${entity.clusterName}" cluster-uuid="${entity.clusterUuid}" current-version="${entity.currentVersion}" upgrade-to="${entity.upgradeTo}"></hcs-upgrade-modal>`,
      type: 'full',
    });
  }

  public startPrechecks(entity) {
    this.$modal.open({
      template: `<hcs-precheck-modal dismiss="$dismiss()" group-id="${this.groupId}" cluster-uuid="${entity.clusterUuid}"></hcs-precheck-modal>`,
      type: 'small',
    });
  }

  public $onInit() {
    this.loading = true;
    if (this.groupId !== this.typeUnassigned.toLowerCase()) {
      this.tabs.push({
        title: this.$translate.instant('hcs.clustersList.title'),
        state: `hcs.clusterList({groupId: '${this.groupId}'})`,
      }, {
        title: this.$translate.instant('hcs.upgradePage.title'),
        state: `hcs.upgradeCluster({groupId: '${this.groupId}'})`,
      });
    }

    this.initCustomer();
    this.initClusterGridData();
    this.initUIGrid();
  }

  public initCustomer(): void {
    if (this.groupId === this.typeUnassigned.toLowerCase()) {
      this.groupName = 'Unassigned';
      this.customerId = undefined;
    } else {
      this.customerId = this.groupId;
      this.HcsControllerService.getHcsControllerCustomer(this.groupId)
        .then((customer: IHcsCustomer) => {
          this.groupName = customer.name;
          this.customerId = customer.uuid;
        })
        .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message));
    }
  }

  public initUIGrid() {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'clusterName',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.clusters'),
        width: '20%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate:  '<div class="ui-grid-cell-contents align-left name-column" ng-hide="{{row.entity.rowWidth === 0}}">{{row.entity.clusterName}}</div>',
      }, {
        field: 'applicationName',
        enableSorting: false,
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.application'),
        width: '10%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'currentVersion',
        enableSorting: false,
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.currentVersion'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'upgradeTo',
        enableSorting: false,
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.upgradeTo'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'clusterStatus',
        enableSorting: false,
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.status'),
        width: '20%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/clusterStatusColumn.tpl.html'),
      }, {
        field: 'actions',
        enableSorting: false,
        displayName: this.$translate.instant('common.actions'),
        width: '20%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/actionsColumn.tpl.html'),
      },
    ];

    this.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: this,
      rowHeight: 56,
      onRegisterApi: function (gridApi) {
        this.gridApi = gridApi;
      },
      columnDefs: this.gridColumns,
    };

    this.gridColumns = columnDefs;
    this.gridOptions.columnDefs = columnDefs;
  }

  public initClusterGridData() {
    this.HcsUpgradeService.getHcsUpgradeCustomer(this.groupId)
      .then((customer: IHcsUpgradeCustomer) => {
        const swProfilePromise = this.HcsUpgradeService.getSoftwareProfile(customer.softwareProfile.uuid);
        const clusterListPromise = this.HcsUpgradeService.listClusters(this.customerId);
        return this.$q.all([ swProfilePromise, clusterListPromise ]);
      })
      .then((response) => {
        this.formatClusterGridData(response[0], response[1]);
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .finally(() => {
        this.showGrid = true;
        this.loading = false;
      });
  }

  public formatClusterGridData(swProfile: ISoftwareProfile, clusters: IHcsClusterSummaryItem[]): void {
    this.clusterGridData = [];
    _.forEach(clusters, (cluster: IHcsClusterSummaryItem) => {
      if (!_.isUndefined(cluster.nodes)) {
        const publisherCount: number = _.filter(cluster.nodes, 'publisher').length;
        let multiApp: boolean = false;
        if (publisherCount > 1) {
          multiApp = true;
        }
        _.forEach(cluster.nodes, (node: INodeSummaryItem) => {
          if (node.publisher) {
            let upgradeVersion: string | undefined;
            if (node.typeApplication) {
              swProfile.applicationVersions ? upgradeVersion = _.find(swProfile.applicationVersions, { typeApplication: node.typeApplication }).appVersion : upgradeVersion = '';
            }
            const clusterGridRow: IUpgradeClusterGridRow = {
              customerId: this.groupId,
              clusterUuid: _.get(cluster, 'uuid'),
              clusterName: _.get(cluster, 'name'),
              applicationName: _.get(node, 'typeApplication'),
              currentVersion: _.split(_.get(node, 'activeVersion'), ' ')[0],
              upgradeTo: upgradeVersion,
              clusterStatus: _.get(cluster, 'clusterStatus'),
              rowWidth: ((publisherCount > 1) && multiApp ) ? 2 : ((publisherCount > 1) ? 0 : 1),
            };
            //TODO: CHECK DURING DEMO REGARDING STATUS.
            // clusterGridRow.clusterStatus = this.getUpgradeStatus(clusterGridRow);
            this.clusterGridData.push(clusterGridRow);
            multiApp = false;
          }
        });
      }
    });
    this.gridOptions.data = this.clusterGridData;
  }

  // public getUpgradeStatus(clusterRow: IUpgradeClusterGridRow): string {
  //   const allowedStatus: string[] = [STATUS_SOFTWARE_PROFILE_NOT_ASSIGNED, STATUS_NO_AGENT_RUNNING, STATUS_AGENT_OFFLINE, STATUS_UPGRADE_IN_PROGRESS, STATUS_UPGRADE_SCHEDULED, STATUS_FAILED_UPGRADE];
  //   if (_.findIndex(allowedStatus, (s) => s === clusterRow.clusterStatus) === -1) {
  //     if (clusterRow.currentVersion === clusterRow.upgradeTo) {
  //       return 'COMPLIANT';
  //     } else {
  //       return 'SOFTWARE_UPGRADE_NEEDED';
  //     }
  //   } else {
  //     return clusterRow.clusterStatus;
  //   }
  // }
  public viewUpgradeStatus($event, cluster: IUpgradeClusterGridRow): void {
    $event.stopPropagation();

    this.$state.go('hcs.upgradeClusterStatus', { groupId: this.groupId, clusterId: cluster.clusterUuid });
  }
}
