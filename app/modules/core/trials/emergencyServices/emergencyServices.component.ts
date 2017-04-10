class EmergencyServicesCtrl implements ng.IComponentController {
  public resetAddress: Function;

  public resetAddr(): void {
    this.resetAddress();
  }

}

export class EmergencyServicesComponent implements ng.IComponentOptions {
  public controller = EmergencyServicesCtrl;
  public templateUrl = 'modules/core/trials/emergencyServices/emergencyServices.html';
  public bindings = {
    address: '<',
    validation: '<',
    addressLoading: '<',
    addressFound: '<',
    readOnly: '<',
    countryCode: '<',
    resetAddress: '&',
  };
}
