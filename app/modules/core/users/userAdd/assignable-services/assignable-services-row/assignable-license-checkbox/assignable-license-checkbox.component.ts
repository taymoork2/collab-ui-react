import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableLicenseCheckboxController implements ng.IComponentController {

  private license: ILicenseUsage;

  public getTotalLicenseUsage(): number {
    return _.get(this.license, 'usage', 0);
  }

  public getTotalLicenseVolume(): number {
    return _.get(this.license, 'volume', 0);
  }
}

export class AssignableLicenseCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableLicenseCheckboxController;
  public template = require('./assignable-license-checkbox.html');
  public bindings = {
    license: '<',
    l10nLabel: '@',
    onUpdate: '&',
    stateData: '<',
  };
}
