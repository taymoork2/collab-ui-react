import { IToolkitModalService } from 'modules/core/modal';
import { ISelectOption, GROUP_TYPE_UNASSIGNED, STATUS_OPERATIONAL, STATUS_NODES_NEED_ACCEPTANCE, STATUS_NO_AGENT_RUNNING, STATUS_AGENT_OFFLINE, STATUS_SOFTWARE_PROFILE_DOES_NOT_COVER_ALL_APPLICATIONS, STATUS_SOFTWARE_VERSION_MISMATCH, STATUS_SOFTWARE_UPGRADE_NEEDED, STATUS_NEED_TO_UPDATE_BATCH_NUMBER, STATUS_UPGRADE_SCHEDULED, STATUS_UPGRADE_IN_PROGRESS, STATUS_FAILED_UPGRADE, STATUS_SOFTWARE_PROFILE_NOT_ASSIGNED } from '../shared/hcs-inventory';
import { HcsUpgradeService, HcsControllerService } from 'modules/hcs/hcs-shared';
import { IHcsCluster, IHcsNode, ISftpServersObject } from 'modules/hcs/hcs-shared/hcs-upgrade';
import { IHcsCustomer, HcsCustomer } from 'modules/hcs/hcs-shared/hcs-controller';
import { Notification } from 'modules/core/notifications';

export enum HcsModalTypeSelect {
  editSftp = 0,
  addCustomer = 1,
}

interface IClusterDetailsForm extends ng.IFormController {
  clusterCustomerSelect: ng.INgModelController;
  sftpLocationSelect: ng.INgModelController;
  clusterNameInput: ng.INgModelController;
}

export class ClusterDetailComponent implements ng.IComponentOptions {
  public controller = ClusterDetailCtrl;
  public template = require('./cluster-detail.component.html');
  public bindings = {
    clusterId: '<',
    groupId: '<',
  };
}

export class ClusterDetailCtrl implements ng.IComponentController {
  public clusterId: string;
  public clusterName: string;
  public groupId: string;
  public back: boolean = true;
  public form: IClusterDetailsForm;
  public sftpServerSelected: ISelectOption;
  public customerSelected: ISelectOption;
  public customerSelectOptions: ISelectOption[];
  public customerList: IHcsCustomer[];
  public customerSelectPlaceholder: string;
  public clusterNameInputMessages: Object;
  public clusterNamePlaceholder: string;
  public clusterDetail: IHcsCluster;
  public typeUnassigned: string = GROUP_TYPE_UNASSIGNED;
  public loading: boolean;
  public sftpSelectPlaceholder: string;
  public sftpServersList: ISelectOption[];
  public processing: boolean = false;
  public disableSftpSelect: boolean = false;
  public disableCustomerSelect: boolean = false;
  public warningMsgCustomerSelect: string;

  private timer: any;
  private timeoutVal: number;

  public status: Object = {
    operational: STATUS_OPERATIONAL,
    nodeNeedsAcceptance: STATUS_NODES_NEED_ACCEPTANCE,
    noAgentRunning: STATUS_NO_AGENT_RUNNING,
    agentOffline: STATUS_AGENT_OFFLINE,
    swProfileNotCoverAll: STATUS_SOFTWARE_PROFILE_DOES_NOT_COVER_ALL_APPLICATIONS,
    swVersionMismatch: STATUS_SOFTWARE_VERSION_MISMATCH,
    swUpgradeNeeded: STATUS_SOFTWARE_UPGRADE_NEEDED,
    needsUpdateBatchNumer: STATUS_NEED_TO_UPDATE_BATCH_NUMBER,
    upgradeScheduled: STATUS_UPGRADE_SCHEDULED,
    upgradeInProgress: STATUS_UPGRADE_IN_PROGRESS,
    upgradeFailed: STATUS_FAILED_UPGRADE,
    softwareProfileNotAssigned: STATUS_SOFTWARE_PROFILE_NOT_ASSIGNED,
  };

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $modal: IToolkitModalService,
    private $timeout: ng.ITimeoutService,
    private $q: ng.IQService,
    private HcsUpgradeService: HcsUpgradeService,
    private HcsControllerService: HcsControllerService,
    private Notification: Notification,
  ) {
    this.timer = 0;
    this.timeoutVal = 500;
  }

  public $onInit(): void {
    this.clusterNameInputMessages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
    this.sftpSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.sftpLocation.sftpPlaceholder');
    this.clusterNamePlaceholder = this.$translate.instant('hcs.clusterDetail.settings.clustername.enterClusterName');
    this.customerSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.inventoryName.customerSelectPlaceholder');
    this.initCustomer();
    //get cluster details info and initialize the cluster
    this.initSftpServers();
    this.initClusterDetails();
  }

  public initClusterDetails(): void {
    this.loading = true;
    this.HcsUpgradeService.getCluster(this.clusterId).then((cluster: IHcsCluster) => {
      this.clusterDetail = cluster;
      this.clusterName = this.clusterDetail.name;
      if ((this.clusterDetail.clusterStatus === STATUS_UPGRADE_IN_PROGRESS || cluster.clusterStatus === STATUS_UPGRADE_SCHEDULED)) {
        this.warningMsgCustomerSelect = this.$translate.instant('hcs.clusterDetail.addCustomerModal.upgradeInProgress');
        this.disableCustomerSelect = true;
      }
      this.initSelectedSftpServer();
    })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .finally(() => {
        this.loading = false;
      });
  }

  public initSelectedSftpServer(): void {
    if (this.clusterDetail.sftpServer) {
      this.sftpServerSelected = {
        label: this.clusterDetail.sftpServer.name,
        value: this.clusterDetail.sftpServer.sftpServerUuid,
      };
    } else {
      this.sftpServerSelected = { label: '', value: '' };
    }
  }

  public initSftpServers(): void {
    this.sftpServersList = [];
    this.HcsUpgradeService.listSftpServers()
      .then((sftpObject: ISftpServersObject) => {
        _.forEach(sftpObject.sftpServers, (sftp) => {
          const sftpServersListItem: ISelectOption = {
            label: sftp.name,
            value: sftp.uuid,
          };
          this.sftpServersList.push(sftpServersListItem);
        });
        if (this.sftpServersList.length === 0) {
          this.disableSftpSelect = true;
        }
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message));
  }

  public initCustomer(): void {
    if (this.groupId.toLowerCase() === this.typeUnassigned.toLowerCase()) {
      this.customerSelected = {
        label: '',
        value: '',
      };
    } else {
      //get current customer
      this.HcsControllerService.getHcsControllerCustomer(this.groupId)
        .then((customer: IHcsCustomer) => {
          this.customerSelected = {
            label: customer.name,
            value: customer.uuid,
          };
        })
        .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message));
    }
    //get customer list
    this.initCustomerList();
  }
  public initCustomerList(): void {
    this.customerSelectOptions = [];
    this.customerList = [];
    //After BETA: get list of customers for partner from ci.
    this.HcsControllerService.listHcsCustomers()
      .then((hcsCustomers: IHcsCustomer[]) => {
        _.forEach(hcsCustomers, (hcsCustomer) => {
          const customer = new HcsCustomer(hcsCustomer);
          this.customerList.push(customer);
          const customerSelectOption = {
            label: customer.name,
            value: customer.uuid,
          };
          this.customerSelectOptions.push(customerSelectOption);
        });
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .finally(() => {
        this.customerSelectOptions.push({ label: 'Add Customer', value: 'addCustomer' });
      });
  }

  public onCustomerChanged(): void {
    if (this.customerSelected.value === 'addCustomer') {
      //reset customer selected
      this.customerSelected = {
        label: '',
        value: '',
      };
      this.addCustomerModal();
    }
  }

  public onBack(): void {
    this.$state.go('hcs.clusterList', { groupId: this.groupId });
  }

  public cancel(): void {
    this.form.$setPristine();
  }

  public openEditModal(modalType: HcsModalTypeSelect, node?: IHcsNode): void {
    this.$modal.open({
      template: require('modules/hcs/hcs-inventory/cluster-detail/hcs-edit-modal.tpl.html'),
      controller: () => {
        if (modalType === HcsModalTypeSelect.editSftp) {
          return {
            refreshData: () => this.initClusterDetails(),
            modalType: modalType,
            node: node,
            sftpServers: this.sftpServersList,
          };
        } else if (modalType === HcsModalTypeSelect.addCustomer) {
          return {
            addCustomerToCluster: (customer: ISelectOption) => this.addCustomerToCluster(customer),
            modalType: modalType,
          };
        }
      },
      modalClass: 'hcs-edit-modal-class',
      controllerAs: '$ctrl',
      type: 'small',
    });
  }

  public editNodeSftp(node: IHcsNode): void {
    this.openEditModal(HcsModalTypeSelect.editSftp, node);
  }

  public addCustomerModal(): void {
    this.openEditModal(HcsModalTypeSelect.addCustomer);
  }

  public addCustomerToCluster(customer: ISelectOption): void {
    this.customerSelected = customer;
    this.initCustomerList();
  }

  public onCustomerSearch(filter: string): void {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }
    this.timer = this.$timeout(() => {
      //to start search, search string should be greater than 3 or empty.
      if ( filter.length > 2 || filter === '') {
        //TODO: Make call to api for search. write logic to send to 2 servers
        this.customerSelectOptions = [];
        _.forEach(this.customerList, (customer) => {
          if (_.includes(customer.name.toLowerCase(), filter.toLowerCase())) {
            const customerSelectOption = {
              label: customer.name,
              value: customer.uuid,
            };
            this.customerSelectOptions.push(customerSelectOption);
          }
        });
        this.customerSelectOptions.push({ label: 'Add Customer', value: 'addCustomer' });
      }
    }, this.timeoutVal);
  }

  public saveClusterDetailChanges() {
    //Update cluster details with customer, sftpServer and cluster Name
    this.processing = true;
    const cluster: IHcsCluster = {
      name: this.clusterName,
      customerUuid: this.customerSelected.value,
      sftpServerUuid: this.sftpServerSelected.value,
    };
    this.HcsUpgradeService.updateCluster(this.clusterId, cluster)
      .then(() => {
        if (this.clusterDetail.nodes) {
          const promises: ng.IPromise<any>[] = [];
          _.forEach(this.clusterDetail.nodes, (node) => {
            if (node.isAccepted) {
              promises.push(this.HcsControllerService.acceptAgent(node));
            } else if (node.isRejected) {
              promises.push(this.HcsControllerService.rejectAgent(node));
            }
          });
          return this.$q.all(promises);
        } else {
          return;
        }
      })
      .then(() => {
        //reload state with assigned customer id
        this.$state.go('hcs.clusterDetail', { groupId: this.customerSelected.value, clusterId: this.clusterId }, { reload: true });
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .finally(() => {
        this.processing = false;
      });
  }

  public acceptNode(node: IHcsNode): void {
    node.isAccepted = true;
    node.isRejected = false;
    if (!this.form.$dirty) {
      this.form.$dirty = true;
    }
  }

  public rejectNode(node: IHcsNode): void {
    node.isAccepted = false;
    node.isRejected = true;
    if (!this.form.$dirty) {
      this.form.$dirty = true;
    }
  }
}
