import { IToolkitModalService } from 'modules/core/modal';
import { ISelectOption } from '../shared/hcs-inventory';
import { HcsUpgradeService, HcsControllerService } from 'modules/hcs/hcs-shared';
import { IHcsCluster, IHcsNode, ISftpServersObject } from 'modules/hcs/hcs-shared/hcs-upgrade';
import { IControllerNode } from 'modules/hcs/hcs-shared/hcs-controller';
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
  public customerList: ISelectOption[];
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

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $log: ng.ILogService,
    private $modal: IToolkitModalService,
    private HcsUpgradeService: HcsUpgradeService,
    private HcsControllerService: HcsControllerService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.loading = true;
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
    this.customerList = [{
      label: 'Betty\'s Flower Shop',
      value: '1234',
    },
    {
      label: 'Susan\'s Mixing Company',
      value: '4567',
    }];

    this.customerList.push({ label: 'Add Customer', value: '0000' });

    this.customerSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.inventoryName.customerSelectPlaceholder');

    //get cluster details info and initialize the cluster
    this.initSftpServers();
    this.initClusterDetails();
  }

  public initClusterDetails() {
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
      this.loading = false;
    })
    .catch((err) => {
      this.Notification.error(err);
    });
  }

  public initSelectedSftpServer(cluster: IHcsCluster) {
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

  public initSftpServers() {
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

  public onSftpLocationChanged() {
  }

  public onCustomerChanged() {
    this.$log.log('On customer change', this.customerSelected);
    if (this.customerSelected.value === '0000') {
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
            saveSftp: (node: IHcsNode, sftp) => this.saveNodeSftp(node, sftp),
            modalType: modalType,
            node: node,
            sftpLocations: this.sftpServersList,
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

  public saveNodeSftp(node: IHcsNode, sftp: ISelectOption) {
    this.$log.log(node, sftp);
  }

  public editNodeSftp(node: IHcsNode) {
    this.openEditModal(HcsModalTypeSelect.editSftp, node);
  }

  public addCustomerModal() {
    this.openEditModal(HcsModalTypeSelect.addCustomer);
  }

  public addCustomerToCluster(customerName: string | undefined, softwareProfile: ISelectOption | undefined) {
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

  public onCustomerSearch(filter) {
    this.$log.log('on search', filter);
  }
}
