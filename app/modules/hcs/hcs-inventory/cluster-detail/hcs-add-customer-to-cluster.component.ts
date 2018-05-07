import { ISelectOption } from '../shared/hcs-inventory';

export class HcsAddCustomerToClusterComponent implements ng.IComponentOptions {
  public controller = HcsAddCustomerToClusterCtrl;
  public template = require('./hcs-add-customer-to-cluster.component.html');
  public bindings = {
    addCustomerToCluster: '&',
    dismiss: '&',
  };
}

export class HcsAddCustomerToClusterCtrl implements ng.IComponentController {
  public dismiss: Function;
  public addCustomerToCluster: Function;
  public customerNameInputMessages: Object;
  public customerNamePlaceholder: string;
  public loading: boolean;
  public customerName: string;
  public softwareProfilesPlaceholder: string;
  public node;
  public form: ng.IFormController;
  public softwareProfileSelected: ISelectOption | null;
  public softwareProfilesList: ISelectOption[] | null;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public cancel() {
    this.addCustomerToCluster({
      customerName: undefined,
      softwareProfile: undefined});
    this.dismiss();
  }

  public $onInit() {
    this.customerNameInputMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      exists: this.$translate.instant('hcs.clusterDetail.addCustomerModal.customerExistsErrorMessage'),
    };
    this.customerNamePlaceholder = this.$translate.instant('hcs.clusterDetail.addCustomerModal.enterCustomerNamePlaceholder');
    this.softwareProfilesPlaceholder = this.$translate.instant('hcs.clusterDetail.addCustomerModal.chooseTemplatePlaceholder');

    //TODO: get default software template selected for the partner.
    this.softwareProfileSelected = { label: 'template2', value: 't2' };
    this.softwareProfilesList = [{
      label: 'template1',
      value: 't1',
    }, {
      label: 'template2',
      value: 't2',
    }];
  }

  public save() {
    this.addCustomerToCluster({
      customerName: this.customerName,
      softwareProfile: this.softwareProfileSelected});
    this.dismiss();
  }

  public onsoftwareProfileChange() {}
}
