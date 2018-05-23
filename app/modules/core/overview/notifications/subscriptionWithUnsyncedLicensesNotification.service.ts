import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';
import { ICenterDetailsFromAPI } from 'modules/core/siteList/webex-site/webex-site.service';

export class SubscriptionWithUnsyncedLicensesNotificationService {

  /* @ngInject */
  constructor (
    private $state: ng.ui.IStateService,
  ) {}

  public createNotification(subscription: ICenterDetailsFromAPI): IOverviewPageNotification {
    return {
      badgeText: 'homePage.todo',
      badgeType: 'warning',
      canDismiss: true,
      dismiss: () => {},
      link: () => {
        this.$state.go('site-list-distribute-licenses', { subscriptionId: subscription.externalSubscriptionId, centerDetails: subscription.purchasedServices });
      },
      linkText: 'webexSiteManagement.redistributeLicenses',
      name: 'unsyncedLicense-' + subscription.externalSubscriptionId,
      text: 'homePage.licensesNeedToBeRedistributed',
      textValues: {
        subscriptionId: subscription.externalSubscriptionId,
      },
    };
  }
}
