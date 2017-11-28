class AssignableLicenseCheckboxController implements ng.IComponentController {
  private serviceItemId: string;
  private stateData: any;  // TODO: better type
  public formItemId: string;
  public isSelected = false;
  public isDisabled = false;

  public onUpdate: Function;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    this.formItemId = this.LicenseUsageUtilService.sanitizeIdForJs(this.serviceItemId);

    // notes:
    // - 'serviceItemId' can contain period chars ('.')
    // - so we wrap interpolated value in double-quotes to prevent unintended deep property creation
    this.isSelected = _.get(this.stateData, `items["${this.serviceItemId}"].isSelected`);
    this.isDisabled = _.get(this.stateData, `items["${this.serviceItemId}"].isDisabled`);
  }

  public recvChange(): void {
    this.onUpdate({
      $event: {
        itemId: this.serviceItemId,
        item: _.pick(this, ['isSelected', 'isDisabled']),
      },
    });
  }
}

export class AssignableLicenseCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableLicenseCheckboxController;
  public template = require('./assignable-license-checkbox.html');
  public transclude = true;
  public bindings = {
    serviceItemId: '<',
    l10nLabel: '@',
    onUpdate: '&',
    stateData: '<',
  };
}
