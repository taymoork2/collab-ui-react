import { AssignableServicesItemCategory, IAssignableLicenseCheckboxState, ILicenseUsage, LicenseStatus } from 'modules/core/users/userAdd/assignable-services/shared';
import { IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template';

class AssignableLicenseCheckboxController implements ng.IComponentController {
  private static readonly itemCategory = AssignableServicesItemCategory.LICENSE;
  private itemId: string;
  private license: ILicenseUsage;
  private autoAssignTemplateData: IAutoAssignTemplateData;
  private onUpdate: Function;

  public $onInit(): void {
    if (!this.license) {
      return;
    }
    const licenseId: string = this.license.licenseId;
    this.itemId = licenseId;
    // notes:
    // - 'entryData' might already be populated (ie. 'autoAssignTemplateData' was composed somewhere else)
    // - initialize with default properties, but override if an entry already existed
    this.entryData = _.assignIn({
      isSelected: false,
      isDisabled: false,
      license: this.license,
    }, this.entryData);
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
          // - this allows for observers looking only at the top-level 'autoAssignTemplateData' property to know
          //   which licenses were selected
          license: this.license,
        },
      },
    };
    this.onUpdate(licenseUpdateEvent);
  }

  public get entryData(): IAssignableLicenseCheckboxState {
    return _.get(this.autoAssignTemplateData, `${AssignableLicenseCheckboxController.itemCategory}["${this.itemId}"]`);
  }

  public set entryData(entryData: IAssignableLicenseCheckboxState) {
    _.set(this.autoAssignTemplateData, `${AssignableLicenseCheckboxController.itemCategory}["${this.itemId}"]`, entryData);
  }

  public get isSelected(): boolean {
    return this.entryData.isSelected;
  }

  public get isDisabled(): boolean {
    return this.entryData.isDisabled || !this.isLicenseStatusOk() || !this.hasVolume();
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
    autoAssignTemplateData: '<',
  };
}
