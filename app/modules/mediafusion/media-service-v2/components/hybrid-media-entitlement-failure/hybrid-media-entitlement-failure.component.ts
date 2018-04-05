export class HybridMediaEntitlementFailureController implements ng.IComponentController {

  public entitlementFailure: string;

  /* @ngInject */
  constructor (
  ) { }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { entitlementFailure } = changes;
    if (entitlementFailure && entitlementFailure.currentValue) {
      this.entitlementFailure = entitlementFailure.currentValue;
    }
  }
}

export class HybridMediaEntitlementFailureComponent implements ng.IComponentOptions {
  public controller = HybridMediaEntitlementFailureController;
  public template = require('./hybrid-media-entitlement-failure.html');
  public bindings = {
    entitlementFailure: '<',
  };
}
