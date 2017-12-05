import { AssignableServicesItemCategory, IAssignableItemCheckboxState, ILicenseUsage, LicenseStatus, LicenseUsageUtilService } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableItemCheckboxController implements ng.IComponentController {
  public formItemId: string | undefined;
  private static readonly itemCategory = AssignableServicesItemCategory.LICENSE;
  private itemId: string;
  private license: ILicenseUsage;
  private stateData: any;  // TODO: better type
  private onUpdate: Function;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService: LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    const licenseId: string = this.license.licenseId;
    this.itemId = licenseId;
    this.formItemId = this.LicenseUsageUtilService.sanitizeIdForJs(licenseId);
    if (!this.stateDataEntry) {
      this.stateDataEntry = {
        isSelected: false,
        isDisabled: false,
        license: this.license,
      };
    }
  }

  public recvChange(): void {
    this.onUpdate({
      $event: {
        itemId: this.itemId,
        itemCategory: AssignableItemCheckboxController.itemCategory,

        // notes:
        // - for convenience, we include the 'license' property in the callback as well
        // - this allows for observers looking only at the top-level 'stateData' property to know
        //   which licenses were selected
        item: _.pick(this, ['isSelected', 'isDisabled', 'license']),
      },
    });
  }

  public get stateDataEntry(): IAssignableItemCheckboxState {
    return _.get(this.stateData, `${AssignableItemCheckboxController.itemCategory}["${this.itemId}"]`);
  }

  public get isSelected(): boolean {
    return !!_.get(this.stateDataEntry, `isSelected`);
  }

  public get isDisabled(): boolean {
    return !!_.get(this.stateDataEntry, `isDisabled`) || !this.isLicenseStatusOk() || !this.hasVolume();
  }

  public set stateDataEntry(stateDataEntry: IAssignableItemCheckboxState) {
    _.set(this.stateData, `${AssignableItemCheckboxController.itemCategory}["${this.itemId}"]`, stateDataEntry);
  }

  public set isSelected(isSelected: boolean) {
    _.set(this.stateDataEntry, `isSelected`, isSelected);
  }

  public set isDisabled(isDisabled: boolean) {
    _.set(this.stateDataEntry, `isDisabled`, isDisabled);
  }

  private isLicenseStatusOk(): boolean {
    const licenseStatus: LicenseStatus | undefined = _.get(this.license, 'status');
    return _.includes([LicenseStatus.ACTIVE, LicenseStatus.PENDING], licenseStatus);
  }

  private hasVolume(): boolean {
    return _.get(this.license, 'volume', 0) > 0;
  }
}

export class AssignableItemCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableItemCheckboxController;
  public template = require('./assignable-item-checkbox.html');
  public transclude = true;
  public bindings = {
    license: '<',
    l10nLabel: '@',
    onUpdate: '&',
    stateData: '<',
  };
}
