import { PstnService } from './pstn.service';
import { PstnModel } from './pstn.model';
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
    private PstnModel: PstnModel,
    private PstnService: PstnService,
    private Notification,
  ) {}

  public $onInit() {
    this.PstnModel.clear();
    this.PstnModel.setCustomerId(this.customerId);
    this.PstnModel.setCustomerName(this.customerName);
    this.PstnModel.setCustomerEmail(this.customerEmail);
    this.PstnModel.setIsTrial(this.customerCommunicationLicenseIsTrial && this.customerRoomSystemsLicenseIsTrial);

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
    if (!this.PstnModel.isResellerExists()) {
      this.PstnService.getResellerV2().then( () => {
        this.PstnModel.setResellerExists(true);
      }).catch( () => {
        this.createReseller();
      });
    }
  }

  //PSTN register the Partner as a carrier reseller
  private createReseller(): void {
    this.PstnService.createResellerV2().then( () => {
      this.PstnModel.setResellerExists(true);
    }).catch(error => {
      this.Notification.errorResponse(error, 'pstnSetup.resellerCreateError');
    });
  }

  //PSTN check if customer is setup as a carrier customer.
  private checkCustomer() {
    if (!this.PstnModel.isCustomerExists()) {
      this.PstnService.getCustomer(this.PstnModel.getCustomerId()).then( () => {
        this.PstnModel.setCustomerExists(true);
      });
    }
  }

}
