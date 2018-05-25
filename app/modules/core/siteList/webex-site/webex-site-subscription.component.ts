import { SiteListService } from 'modules/core/siteList/shared/site-list.service';

class WebexSiteSubscriptionCtrl implements ng.IComponentController {
  public currentSubscriptionId;
  public subscriptions: {
    id: string;
    isPending: boolean;
  }[];
  public onSendTracking: Function;
  public onSubscriptionChange: Function;
  public onValidationStatusChange: Function;

  private useManagement: boolean;

  public canManage: boolean;
  public currentSubscription: {
    id: string;
    isPending: boolean;
  };
  public isPending = false;
  public noSubscription = false;
  public selectPlaceholder = this.$translate.instant('common.select');
  public subscriptionForm: ng.IFormController;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private SiteListService: SiteListService,
  ) {
  }

  public $onInit() {
    this.currentSubscription = _.find(this.subscriptions, { id: this.currentSubscriptionId });
    if (!this.currentSubscription) {
      this.noSubscription = true;
    } else {
      this.setSubscription();
    }
  }

  public launchMeetingSetup(): void {
    this.onSubscriptionChange({ subId: '', needsSetup: true });
  }

  public setSubscription(): void {
    this.isPending = this.currentSubscription.isPending;
    this.canManage = this.isSubscriptionManaged(this.currentSubscription.id);
    // TODO: refactor once site-management toggle is GA
    if (_.isUndefined(this.useManagement)) {
      this.SiteListService.useSiteManagement().then(useManagement => {
        this.useManagement = useManagement;
        this.triggerValidation();
      });
    } else {
      this.triggerValidation();
    }
  }

  private isSubscriptionManaged(subscriptionId: string): boolean {
    return this.SiteListService.canManageSubscription(subscriptionId);
  }

  private triggerValidation(): void {
    if (this.useManagement) {
      this.onValidationStatusChange({ isValid: !this.isPending && this.canManage });
    } else {
      this.onValidationStatusChange({ isValid: !this.isPending });
    }
    if (!this.currentSubscription.isPending) {
      this.onSubscriptionChange({ subId: this.currentSubscription.id });
    }
  }

}

export class WebexSiteSubscriptionComponent implements ng.IComponentOptions {
  public controller = WebexSiteSubscriptionCtrl;
  public template = require('./webex-site-subscription.html');
  public bindings = {
    currentSubscriptionId: '<',
    subscriptions: '<',
    onSendTracking: '&?',
    onSubscriptionChange: '&',
    onValidationStatusChange: '&',
  };
}
