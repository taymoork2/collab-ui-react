import { E911_ADDRESS_PENDING } from 'modules/call/settings/shared';
import { Notification } from 'modules/core/notifications';
import { PstnModel, PstnAddressService, Address } from 'modules/huron/pstn';
import { LocationsService } from 'modules/call/locations';


const UPDATE_ADDRESS_WAIT_MS: number = 100;

class EmergencyServiceAddressCtrl implements ng.IComponentController {
  public countryCode: string;
  public carrierId: String;
  public emergencyAddressForm: ng.IFormController;
  public loadingInit: boolean = false;
  public loadingValidate: boolean = false;
  public loadingSave: boolean = false;
  public address: Address = new Address();
  public originalAddress: Address = new Address();
  public isValid: boolean = false;
  public addressStatus: any;
  public addressFound: boolean = false;
  public ftHasLocations: boolean = false;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
    private PstnServiceAddressService,              //Site Based
    private PstnAddressService: PstnAddressService, //Location Based
    private LocationsService: LocationsService,
    private PstnModel: PstnModel,
    private Authinfo,
    private FeatureToggleService,
  ) { }

  public $onInit(): void {
    this.loadingInit = true;
    this.addressStatus = this.PstnServiceAddressService.getStatus();
    this.countryCode = this.PstnModel.getCountryCode();
    this.carrierId = this.PstnModel.getProviderId();

    //Get Feature Toggle for locations
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484).then((supports) => {
      this.ftHasLocations = supports;
    }).finally(this.initAddress.bind(this));
  }

  private initAddress() {
    if (this.ftHasLocations) {
      this.LocationsService.getDefaultLocation()
        .then(location => {
          if (location) {
            return this.PstnAddressService.getByLocation(this.PstnModel.getCustomerId(), location.uuid || '')
              .then(addresses => {
                if (_.isArray(addresses) && addresses.length > 0) {
                  this.originalAddress = _.cloneDeep(addresses[0]);
                  this.initializeAddress(addresses[0], true);
                }
              });
          }
        })
        .finally(() => {
          this.loadingInit = false;
        });
    } else {
      return this.PstnServiceAddressService.getAddress(this.Authinfo.getOrgId())
        .then(address => {
          if (address) {
            this.originalAddress = _.cloneDeep(address);
            this.initializeAddress(address, true);
          }
        })
        .catch(response => {
        //TODO temp remove 500 status after terminus if fixed
          if (response && response.status !== 404 && response.status !== 500) {
            this.Notification.errorResponse(response, 'pstnSetup.listSiteError');
          }
        })
        .finally(() => {
          this.loadingInit = false;
        });
    }
  }

  // Show modify button if address is valid and we can't save
  public hasModify(): boolean {
    return this.isValid && this.addressStatus !== E911_ADDRESS_PENDING && !this.hasSave();
  }

  // Show validate button if address is valid and not equal to the original
  public hasSave(): boolean {
    return this.isValid && !_.isEqual(this.originalAddress, this.address);
  }

  // Show validate button if address is not valid
  public hasValidate(): boolean {
    return !this.isValid;
  }

  public validate(): void {
    this.loadingValidate = true;
    this.PstnServiceAddressService.lookupAddressV2(this.address, this.carrierId)
      .then(address => {
        if (address) {
          this.address = address;
          this.isValid = true;
          this.addressFound = true;
          this.resetForm();
        } else {
          this.Notification.error('pstnSetup.serviceAddressNotFound');
        }
      })
      .catch(error => {
        this.Notification.errorResponse(error);
      })
      .finally(() => {
        this.loadingValidate = false;
      });
  }

  public save(): void {
    this.loadingSave = true;
    // updateAddress has expensive object operation, so run in next digest cycle so loading animation can start
    this.$timeout(() => this.updateAddress(), UPDATE_ADDRESS_WAIT_MS);
  }

  private updateAddress(): void {
    this.$q.resolve().then(() => {
      // If address wasn't initalized, create a new site, otherwise update the existing address
      if (_.isEmpty(this.originalAddress)) {
        return this.PstnServiceAddressService.createCustomerSite(this.Authinfo.getOrgId(), this.Authinfo.getOrgName(), this.address);
      } else {
        return this.PstnServiceAddressService.updateAddress(this.Authinfo.getOrgId(), this.address);
      }
    }).then(() => {
      this.Notification.success('settingsServiceAddress.saveSuccess');
      this.addressStatus = E911_ADDRESS_PENDING;
      this.originalAddress = _.cloneDeep(this.address);
      this.addressFound = false;
    })
      .catch(error => {
        this.Notification.errorResponse(error, 'settingsServiceAddress.saveError');
      })
      .finally(() => {
        this.loadingSave = false;
      });
  }

  public cancelSave(): void {
    this.initializeAddress(this.originalAddress);
    this.addressFound = false;
  }

  public cancelEdit(): void {
    this.resetForm();
    this.initializeAddress(this.originalAddress);
    this.addressFound = false;
  }

  public modify(): void {
    this.address = new Address();
    this.resetForm();
    this.isValid = false;
  }

  private initializeAddress(address, isValid?: boolean): void {
    this.address = _.cloneDeep(address);
    this.isValid = isValid || !_.isEmpty(this.address);
  }

  private resetForm(): void {
    if (this.emergencyAddressForm) {
      this.emergencyAddressForm.$setPristine();
      this.emergencyAddressForm.$setUntouched();
    }
  }
}

export class EmergencyServiceAddressComponent implements ng.IComponentOptions {
  public controller = EmergencyServiceAddressCtrl;
  public template = require('modules/call/settings/settings-emergency-service-address/settings-emergency-service-address.component.html');
  public bindings = { };
}
