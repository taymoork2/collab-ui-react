import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class PrivacyDataSheetsNotificationService {

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
  ) { }

  public createNotification(): IOverviewPageNotification {
    return {
      badgeText: 'common.new',
      badgeType: 'success',
      canDismiss: false,
      dismiss: () => {},
      link: () => {
        this.$window.open('https://www.cisco.com/c/en/us/about/trust-center/solutions-privacy-data-sheets.html');
      },
      linkText: 'common.learnMore',
      name: 'privacyDataSheets',
      text: 'globalSettings.privacyDataSheetsNotification.text',
    };
  }
}
