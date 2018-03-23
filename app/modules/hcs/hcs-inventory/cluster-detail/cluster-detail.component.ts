export interface ISftpLocationOption {
  label: string;
  value: string;
}

export interface ICsInputMessage {
  required?: string;
  minlength?: string;
  maxlength?: string;
}

export class ClusterDetailComponent implements ng.IComponentOptions {
  public controller = ClusterDetailCtrl;
  public template = require('./cluster-detail.component.html');
  public bindings = {
    clusterId: '<',
    clusterName: '<',
    customerId: '<',
  };
}

export class ClusterDetailCtrl implements ng.IComponentController {
  public clusterId: string;
  public clusterName: string;
  public customerId: string;
  public back: boolean = true;
  public form: ng.IFormController;
  public sftpLocationSelected: ISftpLocationOption;
  public sftpLocationOptions: ISftpLocationOption[];
  public clusterNameInputMessages: ICsInputMessage;
  public clusterDetail: any;

  /* @ngInject */
  constructor() {}

  public $onInit(): void {
    this.sftpLocationSelected = { label: 'sftpserver1', value: 'sftpserver1' };
    this.clusterNameInputMessages = {
      required: 'This field is required',
    };

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
          type: 'Publisher',
          verificationCode: '123456',
          status: 'Active',
          ip: '10.23.34.245',
          sftpLocation: 'sftpserver1',
        }, {
          name: 'ccm-02',
          type: 'Subscriber',
          verificationCode: '123456',
          status: 'Needs acceptance',
          ip: '10.23.34.245',
          sftpLocation: 'sftpserver1',
        },
      ],
    };

  }
  public onSftpLocationChanged() {
  }
}
