import { AssignableServicesItemCategory, IAssignableLicenseCheckboxState, ILicenseUsage, LicenseStatus } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableLicenseCheckboxController implements ng.IComponentController {
  private static readonly itemCategory = AssignableServicesItemCategory.LICENSE;
  private itemId: string;
  private license: ILicenseUsage;
  private stateData: any;  // TODO: better type
  private onUpdate: Function;

  public $onInit(): void {
    if (!this.license) {
      return;
    }
    const licenseId: string = this.license.licenseId;
    this.itemId = licenseId;
    this.stateDataEntry = _.assignIn({
      isSelected: false,
      isDisabled: false,
      license: this.license,
    }, this.stateDataEntry);
  }

  public getTotalLicenseUsage(): number {
    return _.get(this.license, 'usage', 0);
  }

  public getTotalLicenseVolume(): number {
    return _.get(this.license, 'volume', 0);
  }

  public recvChange(itemUpdateEvent): void {
    const licenseUpdateEvent = {
      $event: {
        itemId: this.itemId,
        itemCategory: AssignableLicenseCheckboxController.itemCategory,
        item: {
          isSelected: itemUpdateEvent.item.isSelected,
          isDisabled: itemUpdateEvent.item.isDisabled,

          // notes:
          // - for convenience, we include the 'license' property in the callback as well
          // - this allows for observers looking only at the top-level 'stateData' property to know
          //   which licenses were selected
          license: this.license,
        },
      },
    };
    this.onUpdate(licenseUpdateEvent);
  }

  public get stateDataEntry(): IAssignableLicenseCheckboxState {
    return _.get(this.stateData, `${AssignableLicenseCheckboxController.itemCategory}["${this.itemId}"]`);
  }

  public set stateDataEntry(stateDataEntry: IAssignableLicenseCheckboxState) {
    _.set(this.stateData, `${AssignableLicenseCheckboxController.itemCategory}["${this.itemId}"]`, stateDataEntry);
  }

  public get isSelected(): boolean {
    return this.stateDataEntry.isSelected;
  }

  public get isDisabled(): boolean {
    return this.stateDataEntry.isDisabled || !this.isLicenseStatusOk() || !this.hasVolume();
  }

  private isLicenseStatusOk(): boolean {
    const licenseStatus: LicenseStatus | undefined = _.get(this.license, 'status');
    return _.includes([LicenseStatus.ACTIVE, LicenseStatus.PENDING], licenseStatus);
  }

  private hasVolume(): boolean {
    return _.get(this.license, 'volume', 0) > 0;
  }
}

export class AssignableLicenseCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableLicenseCheckboxController;
  public template = require('./assignable-license-checkbox.html');
  public transclude = true;
  public bindings = {
    license: '<',
    l10nLabel: '@',
    onUpdate: '&',
    stateData: '<',
  };
}
