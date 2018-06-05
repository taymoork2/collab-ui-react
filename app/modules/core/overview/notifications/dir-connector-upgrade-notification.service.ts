import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class DirConnectorUpgradeNotificationService {
  public static readonly DIR_CONNECTOR_UPGRADE_NOTIFICATION_NAME = 'dirConnectorUpgrade';

  /* @ngInject */
  constructor (
    private $window: ng.IWindowService,
  ) {}

  public createNotification(): IOverviewPageNotification {
    return {
      badgeText: 'common.urgent',
      badgeType: 'alert',
      canDismiss: false,
      dismiss: () => {
      },
      link: () => {
        this.$window.open('https://collaborationhelp.cisco.com/article/en-us/nqvsbmq');
      },
      linkText: 'common.learnMore',
      name: DirConnectorUpgradeNotificationService.DIR_CONNECTOR_UPGRADE_NOTIFICATION_NAME,
      text: 'dirConnectorUpgradeNotification.text',
    };
  }
}
