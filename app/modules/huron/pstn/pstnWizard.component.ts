export class PstnWizardComponent implements ng.IComponentOptions {
  public controller = PstnWizardCtrl;
  public templateUrl = 'modules/huron/pstn/pstnWizard.html';
  public bindings = {
    customerId: '<',
    customerName: '<',
    customerEmail: '<',
    customerCommunicationLicenseIsTrial: '<',
    customerRoomSystemsLicenseIsTrial: '<',
  };
}

export class PstnWizardCtrl implements ng.IComponentController {
  public loading: boolean = true;
  private customerId: string;
  private customerName: string;
  private customerEmail: string;
  private customerCommunicationLicenseIsTrial: boolean;
  private customerRoomSystemsLicenseIsTrial: boolean;

  /* @ngInject */
  constructor(
    private PstnSetup,
    private PstnSetupService,
    private Notification,
  ) {}

  public $onInit() {
    this.PstnSetup.clear();
    this.PstnSetup.setCustomerId(this.customerId);
    this.PstnSetup.setCustomerName(this.customerName);
    this.PstnSetup.setCustomerEmail(this.customerEmail);
    this.PstnSetup.setIsTrial(this.customerCommunicationLicenseIsTrial && this.customerRoomSystemsLicenseIsTrial);

    this.checkReseller();
    this.checkCustomer();
  }

  public onProviderChange() {
    this.Notification.success('pstnSetup.setupPstn');
  }

  public onProviderReady() {
    this.loading = false;
  }

  //PSTN check to verify if the Partner is registered with the Terminus service as a carrier reseller
  private checkReseller(): void {
    if (!this.PstnSetup.isResellerExists()) {
      this.PstnSetupService.getResellerV2().then( () => {
        this.PstnSetup.setResellerExists(true);
      }).catch( () => {
        this.createReseller();
      });
    }
  }

  //PSTN register the Partner as a carrier reseller
  private createReseller(): void {
    this.PstnSetupService.createResellerV2().then( () => {
      this.PstnSetup.setResellerExists(true);
    }).catch(error => {
      this.Notification.errorResponse(error, 'pstnSetup.resellerCreateError');
    });
  }

  //PSTN check if customer is setup as a carrier customer.
  private checkCustomer() {
    if (!this.PstnSetup.isCustomerExists()) {
      this.PstnSetupService.getCustomer(this.PstnSetup.getCustomerId()).then( () => {
        this.PstnSetup.setCustomerExists(true);
      });
    }
  }

}
