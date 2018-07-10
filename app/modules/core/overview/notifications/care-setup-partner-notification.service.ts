import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class OverviewCareNotSetupPartnerNotification {

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private UrlConfig,
  ) { }

  public createNotification(): IOverviewPageNotification {
    return {
      badgeText: 'homePage.todo',
      badgeType: 'warning',
      canDismiss: false,
      dismiss: () => {},
      link: () => {
        this.$window.open(this.UrlConfig.getCareDocumentUrl());
      },
      linkText: 'homePage.learnMoreLink',
      name: 'careSetupPartnerViewNotification',
      text: 'homePage.setUpCarePartnerNotification',
    };
  }
}
