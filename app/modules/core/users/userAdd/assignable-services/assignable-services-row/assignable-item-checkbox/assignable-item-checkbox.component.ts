import { ILicenseUsage, AssignableServicesItemCategory, LicenseUsageUtilService } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableItemCheckboxController implements ng.IComponentController {
  public formItemId: string | undefined;
  public isSelected = false;
  public isDisabled = false;
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

    // notes:
    // - 'licenseId' can contain period chars ('.')
    // - so we wrap interpolated value in double-quotes to prevent unintended deep property creation
    const stateDataKey = `${AssignableItemCheckboxController.itemCategory}["${licenseId}"]`;
    this.isSelected = _.get(this.stateData, `${stateDataKey}.isSelected`);
    this.isDisabled = _.get(this.stateData, `${stateDataKey}.isDisabled`);
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
