import { BmmpService } from '../index';
import { IBmmpAttr } from 'modules/online/upgrade/shared/upgrade.service';

class SubscriptionUpgradeButton implements ng.IComponentController {
  public showLoading: string;
  public showLoadingButton: boolean;
  public widgetLocation: string;
  public emptyBmmpAttr: IBmmpAttr;
  public IBmmpAttr: IBmmpAttr;

  /* @ngInject */
  constructor(
    private BmmpService: BmmpService,
  ) {}

  public $onInit(): void {
    this.showLoadingButton = (this.showLoading === 'true');
    this.widgetLocation = this.widgetLocation || 'navigation-bar';
    this.emptyBmmpAttr = {
      subscriptionId: '',
      productInstanceId: '',
      changeplanOverride: '',
    };
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { bmmpAttr } = changes;
    const currentValue = _.get<IBmmpAttr>(bmmpAttr, 'currentValue');
    if (currentValue && !angular.equals(this.emptyBmmpAttr, currentValue)) {
      this.BmmpService.init();
    }
  }
}

export class SubscriptionUpgradeButtonComponent implements ng.IComponentOptions {
  public controller = SubscriptionUpgradeButton;
  public template = require('modules/bmmp/subscriptionUpgradeButton/subscriptionUpgradeButton.html');
  public bindings = <{ [binding: string]: string }>{
    bmmpAttr: '<',
    showLoading: '@',
    widgetLocation: '@',
  };
}
