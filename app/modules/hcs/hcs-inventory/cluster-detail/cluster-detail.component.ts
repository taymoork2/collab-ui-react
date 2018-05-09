import { IToolkitModalService } from 'modules/core/modal';
import { ISelectOption } from '../shared/hcs-inventory';
import { HcsUpgradeService, HcsControllerService } from 'modules/hcs/hcs-shared';
import { IHcsCluster, IHcsNode, ISftpServersObject } from 'modules/hcs/hcs-shared/hcs-upgrade';
import { IControllerNode, IHcsCustomer, HcsCustomer } from 'modules/hcs/hcs-shared/hcs-controller';
import { Notification } from 'modules/core/notifications';

enum HcsModalTypeSelect {
  editSftp = 0,
  addCustomer = 1,
}


interface IClusterDetailsForm extends ng.IFormController {
  clusterCustomerSelect: ng.INgModelController;
  sftpLocationSelect: ng.INgModelController;
  clusterNameInput: ng.INgModelController;
}

const GROUP_TYPE_UNASSIGNED: string = 'Unassigned';
const STATUS_ACTIVE: string = 'Active';
const STATUS_NEEDS_ACCEPTANCE: string = 'NEEDS_ACCEPTANCE';

export class ClusterDetailComponent implements ng.IComponentOptions {
  public controller = ClusterDetailCtrl;
  public template = require('./cluster-detail.component.html');
  public bindings = {
    clusterId: '<',
    groupId: '<',
    groupType: '<',
  };
}

export class ClusterDetailCtrl implements ng.IComponentController {
  public clusterId: string;
  public clusterName: string;
  public groupId: string;
  public groupType: string;
  public back: boolean = true;
  public form: IClusterDetailsForm;
  public sftpLocationSelected: ISelectOption;
  public customerSelected: ISelectOption;
  public customerSelectOptions: ISelectOption[];
  public customerList: IHcsCustomer[];
  public customerSelectPlaceholder: string;
  public clusterNameInputMessages: Object;
  public clusterNamePlaceholder: string;
  public clusterDetail: IHcsCluster;
  public typeUnassigned: string = GROUP_TYPE_UNASSIGNED;
  public statusActive: string = STATUS_ACTIVE;
  public statusNeedsAcceptance: string = STATUS_NEEDS_ACCEPTANCE;
  public loading: boolean;
  public sftpSelectPlaceholder: string;
  public sftpServersList: ISelectOption[];
  private timer: any;
  private timeoutVal: number;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $log: ng.ILogService,
    private $modal: IToolkitModalService,
    private $timeout: ng.ITimeoutService,
    private HcsUpgradeService: HcsUpgradeService,
    private HcsControllerService: HcsControllerService,
    private Notification: Notification,
  ) {
    this.timer = 0;
    this.timeoutVal = 1000;
  }

  public $onInit(): void {
    this.clusterNameInputMessages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
    this.sftpSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.sftpLocation.sftpPlaceholder');
    this.clusterNamePlaceholder = this.$translate.instant('hcs.clusterDetail.settings.clustername.enterClusterName');
    if (this.groupType === this.typeUnassigned.toLowerCase()) {
      this.customerSelected = {
        label: '',
        value: '',
      };
    } else {
      //TODO: get current customer
      this.customerSelected = {
        label: '',
        value: this.groupId,
      };
    }

    //TODO: get list of customers for partner
    this.initCustomerList();

    this.customerSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.inventoryName.customerSelectPlaceholder');

    //get cluster details info and initialize the cluster
    this.initSftpServers();
    this.initClusterDetails();
  }

  public initClusterDetails(): void {
    this.loading = true;
    this.HcsUpgradeService.getCluster(this.clusterId).then((cluster: IHcsCluster) => {
      this.initSelectedSftpServer(cluster);
      return this.getNodeList(cluster.nodes);
    })
    .then((nodeArray: string[] | null) => {
      if (nodeArray) {
        return this.HcsControllerService.getNodesStatus(nodeArray);
      }
    })
    .then((nodeList: IControllerNode[]) => {
      //Node Status logic
      if (nodeList) {
        if (this.clusterDetail.nodes) {
          _.forEach(this.clusterDetail.nodes, (upgradeNode) => {
            const contollerNode: IControllerNode | undefined = _.find(nodeList, ['uuid', upgradeNode.nodeUuid]);
            if (contollerNode) {
              upgradeNode.status = contollerNode.nodeStatus;
              upgradeNode.verificationCode = contollerNode.agent.verificationCode;
            }
          });
        }
      }
    })
    .catch((err) => {
      this.Notification.error(err);
    })
    .finally(() => {
      this.loading = false;
    });
  }

  public initSelectedSftpServer(cluster: IHcsCluster): void {
    this.clusterDetail = cluster;
    this.clusterName = this.clusterDetail.name;
    if (this.clusterDetail.sftpServer) {
      this.sftpLocationSelected = {
        label: this.clusterDetail.sftpServer.name,
        value: this.clusterDetail.sftpServer.sftpServerUuid,
      };
    } else {
      this.sftpLocationSelected = { label: '', value: '' };
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
      })
      .catch((err) => {
        this.Notification.error(err);
      });
  }

  public initCustomerList(): void {
    this.customerSelectOptions = [];
    this.customerList = [];
    this.HcsControllerService.getHcsCustomers()
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
    .catch((err) => {
      this.Notification.error(err);
    })
    .finally(() => {
      this.customerSelectOptions.push({ label: 'Add Customer', value: 'addCustomer' });
    });
  }

  public getNodeList(nodeList: IHcsNode[] | null): string[] | null {
    if (nodeList) {
      const nodeArray: string[] = [];
      _.forEach(nodeList, (node) => {
        if (node.nodeUuid) {
          nodeArray.push(node.nodeUuid);
        }
      });
      return nodeArray;
    } else {
      return null;
    }
  }

  public onSftpLocationChanged(): void {
  }

  public onCustomerChanged(): void {
    this.$log.log('On customer change', this.customerSelected);
    if (this.customerSelected.value === 'addCustomer') {
      this.addCustomerModal();
    }
  }

  public onBack(): void {
    this.$state.go('hcs.clusterList', { groupId: this.groupId, groupType: this.groupType });
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
            addCustomerToCluster: (customerName: string, softwareProfile: ISelectOption) => this.addCustomerToCluster(customerName, softwareProfile),
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

  public addCustomerToCluster(customerName: string | undefined, softwareProfile: ISelectOption | undefined): void {
    this.$log.log(customerName, JSON.stringify(softwareProfile));
    if (customerName) {
      //add customer to controller
    } else {
      //reset selected customer name to empty
      if (this.groupType === this.typeUnassigned.toLowerCase()) {
        this.customerSelected = {
          label: '',
          value: '',
        };
      } else {
        //TODO: get current customer
        this.customerSelected = {
          label: '',
          value: this.groupId,
        };
      }
    }
  }

  public onCustomerSearch(filter: string): void {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }
    this.timer = this.$timeout(() => {
      //to start search, search string should be greater than 3.
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
}
