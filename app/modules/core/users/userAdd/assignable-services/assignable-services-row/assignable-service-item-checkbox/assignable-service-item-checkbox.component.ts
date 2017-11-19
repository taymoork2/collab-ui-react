class AssignableServiceItemCheckboxController implements ng.IComponentController {
  private serviceItemId: string;
  public formItemId: string;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    this.formItemId = this.LicenseUsageUtilService.sanitizeIdForJs(this.serviceItemId);
  }
}

export class AssignableServiceItemCheckboxComponent implements ng.IComponentOptions {
  public controller = AssignableServiceItemCheckboxController;
  public template = require('./assignable-service-item-checkbox.html');
  public transclude = true;
  public bindings = {
    serviceItemId: '<',
    l10nLabel: '@',
  };
}
