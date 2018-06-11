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
        this.$window.open('https://www.cisco.com/c/dam/en_us/about/doing_business/trust-center/docs/cisco-webex-service-privacy-data-sheet.pdf');
      },
      linkText: 'common.learnMore',
      name: 'privacyDataSheets',
      text: 'globalSettings.privacyDataSheetsNotification.text',
    };
  }
}
