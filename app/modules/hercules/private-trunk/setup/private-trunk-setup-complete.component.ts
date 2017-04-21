
export class PrivateTrunkSetupCompleteCtrl implements ng.IComponentController {
  public verifiedDomain: string;
}

export class PrivateTrunkSetupCompleteComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSetupCompleteCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-setup-complete.html';
  public bindings = {
    verifiedDomain: '<',
  };
}
