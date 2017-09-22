import { IOfferData, ISubscription } from 'modules/core/myCompany/mySubscriptions/subscriptionsInterfaces';
import { ProPackService } from 'modules/core/proPack/proPack.service';

class SubscriptionDetailsCtrl {
  public subscription: ISubscription;
  public isProPackPurchased: boolean;
  private viewAll: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ProPackService: ProPackService,
  ) { }

  public $onInit(): void {
    this.ProPackService.hasProPackPurchased().then((isProPackPurchased: boolean): void => {
      this.isProPackPurchased = isProPackPurchased;
    });
  }

  public getProPackStatus(): boolean {
    return this.isProPackPurchased && !_.isUndefined(this.subscription.proPack);
  }

  public getUsage(offer: IOfferData): string  {
    if (_.isNumber(offer.usage)) {
      return `${offer.usage}/${offer.volume}`;
    } else {
      return `${offer.volume}`;
    }
  }

  public getView(): boolean {
    return this.viewAll;
  }

  public getWarning(offer: IOfferData): boolean {
    if (_.isNumber(offer.usage)) {
      return offer.usage > offer.volume;
    } else {
      return false;
    }
  }

  public getQuantity(): number {
    if (this.isProPackPurchased && this.subscription.proPack) {
      return this.subscription.licenses.length + 1;
    } else {
      return this.subscription.licenses.length;
    }
  }

  public getLicenseName(offerName: string): string {
    return this.$translate.instant(`subscriptions.licenseTypes.${offerName}`);
  }

  public toggleView(): void {
    this.viewAll = !this.viewAll;
  }

  public isTotalUsage(offer: IOfferData): boolean {
    return _.isNumber(offer.totalUsage);
  }

  public isUsage(offer: IOfferData): boolean {
    return _.isNumber(offer.usage);
  }
}

export class SubscriptionDetailsComponent implements ng.IComponentOptions {
  public template = require('modules/core/myCompany/mySubscriptions/subscription-details/subscriptionDetails.tpl.html');
  public controller = SubscriptionDetailsCtrl;
  public bindings = {
    subscription: '<',
  };
}
