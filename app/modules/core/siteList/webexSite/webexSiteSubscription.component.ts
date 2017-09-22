

class WebexSiteSubscriptionCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate,
  ) {
  }
  public subscriptionForm: ng.IFormController;

  public currentSubscription = '';
  public selectPlaceholder = this.$translate.instant('common.select');

  public subscriptions;
  public subscriptionList: string[] = [];
  public onSubscriptionChange: Function;

  public $onChanges (changes: ng.IOnChangesObject) {
    if (changes.subscriptions) {
      const subs =  changes.subscriptions.currentValue;
      this.subscriptionList = _.clone(subs) as string[];
    }
    if (changes.currentSubscription) {
      this.currentSubscription = changes.currentSubscription.currentValue;
    }
  }

  public setSubscription() {
    this.onSubscriptionChange({ subId: this.currentSubscription });
  }
}

export class WebexSiteSubscriptionComponent implements ng.IComponentOptions {
  public controller = WebexSiteSubscriptionCtrl;
  public template = require('modules/core/siteList/webexSite/webexSiteSubscription.html');
  public bindings = {
    subscriptions: '<',
    onSubscriptionChange: '&',
    currentSubscription: '<',
  };
}

export default angular
  .module('Core')
  .component('webexSiteSubscription', new WebexSiteSubscriptionComponent());
