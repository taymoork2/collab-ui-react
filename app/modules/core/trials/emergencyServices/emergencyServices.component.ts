class EmergencyServicesCtrl implements ng.IComponentController {
  public resetAddress: Function;
  public validateAddress: Function;
  public showValidation: boolean = false;

  public resetAddr(): void {
    this.resetAddress();
  }

  public validate(): void {
    this.validateAddress();
  }

}

export class EmergencyServicesComponent implements ng.IComponentOptions {
  public controller = EmergencyServicesCtrl;
  public template = require('modules/core/trials/emergencyServices/emergencyServices.html');
  public bindings = {
    address: '<',
    validation: '<',
    addressLoading: '<',
    addressFound: '<',
    readOnly: '<',
    countryCode: '<',
    resetAddress: '&',
    validateAddress: '&',
    showValidation: '@',
  };
}
