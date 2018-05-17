import { ISelectOption } from '../shared/hcs-inventory';
import { HcsUpgradeService, HcsControllerService, ISoftwareProfile, IHcsUpgradeCustomer } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

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
  public softwareProfileSelected: ISelectOption;
  public softwareProfilesList: ISelectOption[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HcsUpgradeService: HcsUpgradeService,
    private HcsControllerService: HcsControllerService,
    private Notification: Notification,
  ) {}

  public cancel() {
    this.dismiss();
  }

  public $onInit() {
    this.customerNameInputMessages = {
      required: this.$translate.instant('common.invalidRequired'),
      exists: this.$translate.instant('hcs.clusterDetail.addCustomerModal.customerExistsErrorMessage'),
    };
    this.customerNamePlaceholder = this.$translate.instant('hcs.clusterDetail.addCustomerModal.enterCustomerNamePlaceholder');
    this.softwareProfilesPlaceholder = this.$translate.instant('hcs.clusterDetail.addCustomerModal.chooseTemplatePlaceholder');

    //TODO: get software template default for partner.??
    this.softwareProfileSelected = { label: '', value: '' };

    this.HcsUpgradeService.getSoftwareProfiles()
      .then((swProfiles: ISoftwareProfile[]) => {
        this.softwareProfilesList = [];
        _.forEach(swProfiles, (swProfile) => {
          const swProfileListItem = {
            label: swProfile.name,
            value: swProfile.uuid,
          };
          this.softwareProfilesList.push(swProfileListItem);
        });
      })
      .catch((err) => {
        this.Notification.error('common.errorMessage', { error: err });
      });
  }

  public save() {
    const addedCustomer: ISelectOption = {
      label: '',
      value: '',
    };
    this.HcsControllerService.addHcsControllerCustomer(this.customerName, ['UPGRADE'])
    .then((resp) => {
      const swProfileSelected: ISoftwareProfile = {
        name: this.softwareProfileSelected.label,
        uuid: this.softwareProfileSelected.value,
      };

      const upgradeCustomer: IHcsUpgradeCustomer = {
        uuid: resp.uuid,
        softwareProfile: swProfileSelected,
      };

      addedCustomer.value = resp.uuid;
      addedCustomer.label = this.customerName;
      return this.HcsUpgradeService.addHcsUpgradeCustomer(upgradeCustomer);
    })
    .then(() => {
      // Change this to send customer object
      this.addCustomerToCluster({
        customer: addedCustomer,
      });
      this.dismiss();
    })
    .catch((err) => {
      this.Notification.error('common.errorMessage', { error: err });
    });
  }

  public onsoftwareProfileChange() {}
}
