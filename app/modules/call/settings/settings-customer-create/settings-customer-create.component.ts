import { SetupWizardService } from 'modules/core/setupWizard/setup-wizard.service';
import { Notification } from 'modules/core/notifications';

class HuronCustomerCreate {
  public selected: number;
  public country;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private SetupWizardService: SetupWizardService,
    private Notification: Notification,
  ) { }

  public $onInit() {
    this.$scope.$watch(() => {
      return this.country;
    }, value => {
      this.$scope.$emit('wizardNextButtonDisable', !value);
    });
  }

  public setDefaultCountry(country) {
    this.$scope.$emit('wizardNextButtonLoading', true);
    this.SetupWizardService.activateAndCheckCapacity(country.id).then(() => {
      this.country = country;
    }).catch(error => {
      if (error.status === 412) {
        //Error code from Drachma
        this.Notification.errorWithTrackingId(error, 'firstTimeWizard.error.overCapacity');
      } else {
        this.Notification.errorWithTrackingId(error, 'firstTimeWizard.error.capacityFail');
      }
    }).finally(() => {
      this.$scope.$emit('wizardNextButtonLoading', false);
    });
  }
}

export class HuronCustomerCreateComponent implements ng.IComponentOptions {
  public controller = HuronCustomerCreate;
  public template = require('modules/call/settings/settings-customer-create/settings-customer-create.component.html');
  public bindings = {
    ftsw: '<',
  };
}
