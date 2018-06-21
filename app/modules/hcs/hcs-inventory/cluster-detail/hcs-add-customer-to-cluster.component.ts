import { ISelectOption } from '../shared/hcs-inventory';
import { HcsUpgradeService, HcsControllerService, ISoftwareProfile, ISoftwareProfilesObject, IHcsUpgradeCustomer } from 'modules/hcs/hcs-shared';
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
  public disableSwProfileSelect: boolean = false;
  public processing: boolean = false;

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
    this.softwareProfileSelected = { label: '', value: '' };

    this.HcsUpgradeService.listSoftwareProfiles()
      .then((swProfiles: ISoftwareProfilesObject) => {
        this.softwareProfilesList = [];
        _.forEach(swProfiles.softwareProfiles, (swProfile) => {
          const swProfileListItem = {
            label: swProfile.name,
            value: swProfile.uuid,
          };
          this.softwareProfilesList.push(swProfileListItem);
        });

        if (this.softwareProfilesList.length === 0) {
          this.disableSwProfileSelect = true;
        }
      })
      .catch((err) => {
        this.Notification.errorWithTrackingId(err);
      });
  }

  public save() {
    this.processing = true;
    const addedCustomer: ISelectOption = {
      label: '',
      value: '',
    };
    const services: string[] = ['UPGRADE'];
    this.HcsControllerService.addHcsControllerCustomer(this.customerName, services)
      .then((resp) => {
        const swProfileSelected: ISoftwareProfile = {
          name: this.softwareProfileSelected.label,
          uuid: this.softwareProfileSelected.value,
        };

        const upgradeCustomer: IHcsUpgradeCustomer = {
          uuid: resp.uuid,
          softwareProfile: swProfileSelected,
          name: this.customerName,
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
        this.Notification.errorWithTrackingId(err);
      })
      .finally(() => {
        this.processing = false;
      });
  }
}
