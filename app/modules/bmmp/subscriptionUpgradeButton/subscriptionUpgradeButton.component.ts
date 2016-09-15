import { BmmpService } from '../index';

class SubscriptionUpgradeButton implements ng.IComponentController {
  public showLoading: string;
  public showLoadingButton: boolean;
  public widgetLocation: string;

  /* @ngInject */
  constructor(
    private BmmpService: BmmpService
  ) {}

  public $onInit(): void {
    this.showLoadingButton = (this.showLoading === 'true');
    this.widgetLocation = this.widgetLocation || 'navigation-bar';
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    let subscriptionIdChange = changes['subscriptionId'];
    if (subscriptionIdChange && subscriptionIdChange.currentValue) {
      this.BmmpService.init();
    }
  }
}

export class SubscriptionUpgradeButtonComponent implements ng.IComponentOptions {
  public controller = SubscriptionUpgradeButton;
  public templateUrl = 'modules/bmmp/subscriptionUpgradeButton/subscriptionUpgradeButton.html';
  public bindings = <{ [binding: string]: string }>{
    subscriptionId: '<',
    showLoading: '@',
    widgetLocation: '@',
  };
}
