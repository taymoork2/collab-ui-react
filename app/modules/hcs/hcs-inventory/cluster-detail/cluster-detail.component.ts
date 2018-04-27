import { IToolkitModalService } from 'modules/core/modal';
import { ISelectOption } from '../shared/hcs-inventory';

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
const STATUS_NEEDS_ACCEPTANCE: string = 'Needs acceptance';

export class ClusterDetailComponent implements ng.IComponentOptions {
  public controller = ClusterDetailCtrl;
  public template = require('./cluster-detail.component.html');
  public bindings = {
    clusterId: '<',
    clusterName: '<',
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
  public customerSelected: string;
  public customerList: string[];
  public customerSelectPlaceholder: string;
  public clusterNameInputMessages: Object;
  public clusterNamePlaceholder: string;
  public clusterDetail: any;
  public typeUnassigned: string = GROUP_TYPE_UNASSIGNED;
  public statusActive: string = STATUS_ACTIVE;
  public statusNeedsAcceptance: string = STATUS_NEEDS_ACCEPTANCE;
  public loading: boolean;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $log: ng.ILogService,
    private $modal: IToolkitModalService,
  ) {}

  public $onInit(): void {
    this.loading = true;
    this.sftpLocationSelected = { label: 'sftpserver1', value: 'sftpserver1' };
    this.clusterNameInputMessages = {
      required: this.$translate.instant('common.invalidRequired'),
    };
    this.clusterNamePlaceholder = this.$translate.instant('hcs.clusterDetail.settings.clustername.enterClusterName');
    if (this.groupType === this.typeUnassigned.toLowerCase()) {
      this.customerSelected = '';
    } else {
      //TODO: get current customer
      this.customerSelected = 'Betty\'s Flower Shop';
    }

    //TODO: get list of customers for partner
    this.customerList = ['Betty\'s Flower Shop', 'Susan\'s Mixing Company'];

    //TODO: push add customer only if unassigned??
    this.customerList.push('Add Customer');

    this.customerSelectPlaceholder = this.$translate.instant('hcs.clusterDetail.settings.inventoryName.customerSelectPlaceholder');

    this.clusterDetail = {
      clusterId: this.clusterId,
      clusterName: this.clusterName,
      sftpLocations: [
        {
          label: 'sftpserver1',
          value: 'sftpserver1',
        }, {
          label: 'sftpserver2',
          value: 'sftpserver2',
        },
      ],
      nodes: [
        {
          name: 'ccm-01',
          type: 'CUCM',
          isPublisher: true,
          verificationCode: '123456',
          status: 'Active',
          ip: '10.23.34.245',
          sftpLocation: 'sftpserver1',
        }, {
          name: 'ccm-02',
          type: 'CUCM',
          isPublisher: false,
          verificationCode: '123456',
          status: 'Needs acceptance',
          ip: '10.23.34.245',
          sftpLocation: 'sftpserver1',
        }, {
          name: 'ccm-03',
          type: 'CUCM',
          isPublisher: false,
          verificationCode: '123456',
          status: 'Needs acceptance',
          ip: '10.23.34.245',
          sftpLocation: 'sftpserver1',
        },
      ],
    };
    this.loading = false;
  }

  public onSftpLocationChanged() {
  }

  public onCustomerChanged() {
    this.$log.log(this.customerSelected);
  }

  public onBack(): void {
    this.$state.go('hcs.clusterList', { groupId: this.groupId, groupType: this.groupType });
  }

  public cancel(): void {
    this.form.$setPristine();
  }

  public openEditModal(modalType: HcsModalTypeSelect, node?): void {
    this.$modal.open({
      template: require('modules/hcs/hcs-inventory/cluster-detail/hcs-edit-modal.tpl.html'),
      controller: () => {
        if (modalType === HcsModalTypeSelect.editSftp) {
          return {
            saveSftp: (node, sftp) => this.saveNodeSftp(node, sftp),
            modalType: modalType,
            node: node,
            sftpLocations: this.clusterDetail.sftpLocations,
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

  public saveNodeSftp(node, sftp) {
    this.$log.log(node, sftp);
  }

  public editNodeSftp(node) {
    this.openEditModal(HcsModalTypeSelect.editSftp, node);
  }

  public addCustomerModal() {
    this.openEditModal(HcsModalTypeSelect.addCustomer);
  }

  public addCustomerToCluster(customerName: string, softwareProfile: ISelectOption) {
    this.$log.log(customerName, JSON.stringify(softwareProfile));
  }

  public onCustomerSearch(searchItem) {
    this.$log.log(JSON.stringify(searchItem));
  }
}
