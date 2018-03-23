import { IEmergency, IState, IDevice } from './index';
import { EmergencyServicesService } from './emergencyServices.service';
import { Notification } from 'modules/core/notifications';

export class EmergencyServicesCtrl {
  public emergency: IEmergency;
  public currentDevice: IDevice;
  public loading: boolean = false;
  public useCompanyAddress: boolean = false;
  public showAddressEntry: boolean = false;
  public loadingAddress: boolean = false;
  public processing: boolean = false;
  public companyAddressLoading = false;
  public loadingText: string;
  public form: ng.IFormController;
  public stateOptions: IState[];
  public errorMessage: string;
  public options: string[];
  public companyEmergencyNumber: string;
  public impactedUsers: any[];
  public staticNumber: boolean;
  public addressFound: boolean;
  public locationLabel: string;
  public zipLabel: string;

  /* @ngInject */
  constructor(
    private EmergencyServicesService: EmergencyServicesService,
    private $state,
    private $translate,
    private Notification: Notification,
  ) {

  }

  public $onInit(): void {
    const data = this.EmergencyServicesService.getInitialData();
    this.emergency = data.emergency;
    this.currentDevice = data.currentDevice;
    this.locationLabel = data.locationLabel;
    this.zipLabel = data.zipLabel;
    this.stateOptions = data.stateOptions;
    this.staticNumber = data.staticNumber;
    this.EmergencyServicesService.getOptions().then(options => this.options = options);
    this.EmergencyServicesService.getCompanyECN().then(result => this.companyEmergencyNumber = result);
    this.EmergencyServicesService.getImpactedUsers(this.emergency.emergencyNumber).then(users =>  this.impactedUsers = users);
  }

  public numberChange(): void {
    this.loadingAddress = true;
    this.EmergencyServicesService.getAddressForNumber(this.emergency.emergencyNumber).then(info => {
      this.emergency.emergencyAddress = info.e911Address;
      this.emergency.status = info.status;
    }).finally(() => {
      this.loadingAddress = false;
      this.changes();
    });
    this.EmergencyServicesService.getImpactedUsers(this.emergency.emergencyNumber).then(users => this.impactedUsers = users);
  }

  public getoptions(filter: string): void {
    this.EmergencyServicesService.getOptions(filter)
      .then(options => this.options = options);
  }

  public changes(): void {
    if (this.EmergencyServicesService.matchesOriginalConfig(this.emergency)) {
      this.resetSettings();
    }
  }

  public resetSettings(): void {
    this.emergency = this.EmergencyServicesService.getOriginalConfig();
    this.form.$setPristine();
    this.form.$setUntouched();
    this.errorMessage = '';
    this.showAddressEntry = false;
  }

  public reset() {
    this.resetSettings();
    this.numberChange();
  }

  public modifyAddress(): void {
    this.showAddressEntry = true;
    this.emergency.emergencyAddress = {};
    this.useCompanyAddress = false;
    this.form.$setDirty();
  }

  public companyAddressSelection(): void {
    this.errorMessage = '';
    if (this.useCompanyAddress) {
      this.companyAddressLoading = true;
      this.EmergencyServicesService.getAddress().then(address => {
        this.emergency.emergencyAddress = address;
      })
      .catch(response => response.errorMessage ? this.Notification.errorResponse(response) : undefined)
      .finally(() => this.companyAddressLoading = false);
    } else {
      this.errorMessage = '';
      this.showAddressEntry = false;
      this.emergency.emergencyAddress = this.EmergencyServicesService.getOriginalConfig().emergencyAddress;
      this.changes();
    }
  }

  public save(): void {
    this.processing = true;
    if (!_.isEqual(this.emergency.emergencyNumber, this.EmergencyServicesService.getOriginalConfig().emergencyNumber)) {
      this.EmergencyServicesService.save(this.emergency)
        .then(() => this.validateAndSaveAddress())
        .catch(error => {
          this.Notification.errorResponse(error);
        })
        .finally(() => this.processing = false);
    } else {
      this.validateAndSaveAddress();
    }
  }

  public validateAndSaveAddress() {
    if (this.addressFound) {
      this.saveAddress();
    } else {
      this.validateAddress();
    }
  }

  public saveAddress(): void {
    this.loadingText = this.$translate.instant('spacesPage.saving');
    this.EmergencyServicesService.saveAddress(this.emergency, this.emergency.emergencyAddress, this.useCompanyAddress).then(() => {
      this.$state.go(_.get(this.$state, '$current.parent.name'));
    }).catch(response => {
      this.Notification.errorResponse(response);
      this.loading = false;
    }).finally(() => this.processing = false);
  }

  public resetAddress() {
    this.emergency.emergencyAddress = {};
    this.addressFound = false;
  }

  public validateAddress(): void {
    if (!_.isEqual(this.emergency.emergencyAddress, this.EmergencyServicesService.getOriginalConfig().emergencyAddress)) {
      this.loading = true;
      this.loadingText = this.$translate.instant('spacesPage.validatingAddr');
      const saveData = _.cloneDeep(this.emergency.emergencyAddress);
      if (_.get(saveData, 'state.abbreviation')) {
        saveData.state = <string>_.get(saveData, 'state.abbreviation');
      }
      this.EmergencyServicesService.validateAddress(saveData).then(response => {
        if (response) {
          this.errorMessage = '';
          this.addressFound = true;
          this.emergency.emergencyAddress = response;
          this.loading = false;
        } else {
          this.loading = false;
          this.errorMessage = this.$translate.instant('spacesPage.errorAddr');
        }
      }).catch(response => {
        this.errorMessage = response.data.errorMessage;
        this.loading = false;
      }).finally(() => this.processing = false);
    } else {
      this.$state.go(_.get(this.$state, '$current.parent.name'));
      this.processing = false;
    }
  }
}
export class EmergencyServicesComponent implements ng.IComponentOptions {
  public controller = EmergencyServicesCtrl;
  public template = require('modules/squared/devices/emergencyServices/emergencyServices.html');
  public bindings = <{ [binding: string]: string }>{
  };
}
