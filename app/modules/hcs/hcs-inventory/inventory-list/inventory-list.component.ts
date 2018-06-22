import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

interface IInventoryObject {
  id: string;
  name?: string;
  status: string;
  type?: string;
}
interface IFilterObject {
  value?: any;
  label: string | undefined;
  menu?: any;
  isSelected?: boolean;
}
interface IFilterComponent {
  selected: IFilterObject[];
  placeholder: string;
  singular: string;
  plural: string;
  options: IFilterObject[];
}

export class InventoryListComponent implements ng.IComponentOptions {
  public controller = InventoryListCtrl;
  public template = require('./inventory-list.component.html');
}

export class InventoryListCtrl implements ng.IComponentController {
  private timer;
  private timeoutVal: number;
  private tempFilterOptions: (string| undefined)[];

  public inventoryList: IInventoryObject[] = [];
  public inventoryListData: IInventoryObject[] = [];
  public currentSearchString: string = '';
  public loading: boolean = false;

  public filter: IFilterComponent = {
    selected: [],
    placeholder: this.$translate.instant('customerPage.filters.placeholder'),
    singular: this.$translate.instant('customerPage.filters.filter'),
    plural: this.$translate.instant('customerPage.filters.filters'),
    options: [],
  };

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private $state: ng.ui.IStateService,
    private HcsUpgradeService: HcsUpgradeService,
    private $q: ng.IQService,
    private Notification: Notification,
  ) {
    this.timer = 0;
    this.timeoutVal = 1000;
  }

  public $onInit(): void {
    this.initInventoryList();
  }

  public initInventoryList(): void {
    this.loading = true;
    this.inventoryList = [];
    //check if unassigned is needed
    const unassignedClustersPromise = this.HcsUpgradeService.listClusters('');
    const customerListPromise = this.HcsUpgradeService.listAssignedHcsUpgradeCustomers();
    this.$q.all([ unassignedClustersPromise, customerListPromise ])
      .then(response => {
        if (response[0].length > 0) {
          this.inventoryList.push({
            id: 'unassigned',
            name: 'Unassigned',
            status: 'ASSIGNMENT_NEEDED',
          });
        }
        _.forEach(response[1], (customer) => {
          const inventory: IInventoryObject = {
            id: customer.uuid,
            status: customer.status ? customer.status : '',
            name: customer.name ? customer.name : undefined,
          };
          this.inventoryList.push(inventory);
        });
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .finally(() => {
        this.inventoryListData = this.inventoryList;
        this.tempFilterOptions = _.uniq(this.inventoryList.map(item => _.get(item, 'status')));
        this.tempFilterOptions.map(filterOption => {
          let filterOptionLabel: string;
          switch (filterOption) {
            case 'UNASSIGNED':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.unassigned');
              break;
            case 'ASSIGNMENT_NEEDED':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.assignmentNeeded');
              break;
            case 'NO_AGENT_RUNNING':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.noAgentRunning');
              break;
            case 'AGENT_OFFLINE':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.agentOffline');
              break;
            case 'FAILED_UPGRADE':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.failedUpgrade');
              break;
            case 'SOFTWARE_PROFILE_NOT_ASSIGNED':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.swProfileNotAssigned');
              break;
            case 'NO_CLUSTERS':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.noClusters');
              break;
            case 'NODES_NEED_ACCEPTANCE':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.needsAcceptance');
              break;
            case 'SOFTWARE_PROFILE_DOES_NOT_COVER_ALL_APPLICATIONS':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.swProfileNotCoverAll');
              break;
            case 'SOFTWARE_VERSION_MISMATCH':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.swVersionMismatch');
              break;
            case 'SOFTWARE_UPGRADE_NEEDED':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.swUpgradeNeeded');
              break;
            case 'NEED_TO_UPDATE_BATCH_NUMBER':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.needToUpdateBatchNumber');
              break;
            case 'UPGRADE_SCHEDULED':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.upgradeScheduled');
              break;
            case 'UPGRADE_IN_PROGRESS':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.upgradeInProgress');
              break;
            case 'OPERATIONAL':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.operational');
              break;
            case 'COMPLIANT':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.compliant');
              break;
            case 'NO_ACTIVE_VERSION':
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.noActiveVersion');
              break;
            default:
              filterOptionLabel = this.$translate.instant('hcs.clusterDetail.nodeStatus.unassigned');
          }
          this.filter.options.push({
            value: filterOption,
            label: filterOptionLabel,
          });
        });
        this.loading = false;
      });

  }

  public searchInventoryFunction(str): void {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      if (str) {
        this.currentSearchString = str;
      } else {
        this.currentSearchString = '';
      }
      this.searchFilterFunction();
    }, this.timeoutVal);
  }

  public searchFilterFunction(): void {
    //to start search either filter should be added or search string should be greater than 2.
    if (this.filter.selected.length >= 1 || this.currentSearchString.length > 1) {
      this.inventoryListData = this.inventoryList.filter(inventory => {
        let present: boolean = false;
        // if only filter and no search
        if (this.filter.selected.length >= 1 && this.currentSearchString.length === 0) {
          if (_.find(this.filter.selected, (selected) => selected.value === inventory.status)) {
            present = true;
          }
        } else if (this.filter.selected.length === 0 && this.currentSearchString.length > 1) {
          // if only search and no filter
          const inventoryName = _.get(inventory, 'name', 'Unassigned');
          present = _.includes(inventoryName.toLowerCase(), this.currentSearchString.toLowerCase());
        } else {
          // if both search and filter
          const inventoryName = _.get(inventory, 'name', 'Unassigned');
          if (_.find(this.filter.selected, (selected) => selected.value === inventory.status && _.includes(inventoryName.toLowerCase(), this.currentSearchString.toLowerCase()))) {
            present = true;
          }
        }
        return present;
      });
    } else {
      //else return entire dataset
      this.inventoryListData = this.inventoryList;
    }
  }

  public onClickSettings(inventory: IInventoryObject): void {
    this.$state.go('hcs.clusterList', { groupId: inventory.id });
  }
}
