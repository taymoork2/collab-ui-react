import { ILicenseUsage, AssignableServicesItemCategory } from 'modules/core/users/userAdd/assignable-services/shared';

class AssignableLicenseCheckboxController implements ng.IComponentController {
  private static readonly itemCategory = AssignableServicesItemCategory.LICENSE;
  private itemId: string;
  private license: ILicenseUsage;
  private stateData: any;  // TODO: better type
  private onUpdate: Function;
  public formItemId: string;
  public isSelected = false;
  public isDisabled = false;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    const licenseId = this.license!.licenseId;
    this.itemId = licenseId;
    this.formItemId = this.LicenseUsageUtilService.sanitizeIdForJs(licenseId);

    // notes:
    // - 'licenseId' can contain period chars ('.')
    // - so we wrap interpolated value in double-quotes to prevent unintended deep property creation
    const stateDataKey = `${AssignableLicenseCheckboxController.itemCategory}["${licenseId}"]`;
    this.isSelected = _.get(this.stateData, `${stateDataKey}.isSelected`);
    this.isDisabled = _.get(this.stateData, `${stateDataKey}.isDisabled`);
  }

  public recvChange(): void {
    this.onUpdate({
      $event: {
        itemId: this.itemId,
        itemCategory: AssignableLicenseCheckboxController.itemCategory,

        // notes:
        // - for convenience, we include the 'license' property in the callback as well
        // - this allows for observers looking only at the top-level 'stateData' property to know
        //   which licenses were selected
        item: _.pick(this, ['isSelected', 'isDisabled', 'license']),
      },
    });
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
