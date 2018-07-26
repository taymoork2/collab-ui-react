import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class SipAddressMigrationNotificationService {
  public static readonly SIP_ADDRESS_MIGRATION_NOTIFICATION_NAME = 'sipAddressMigration';

  /* @ngInject */
  constructor (
    private $state: ng.ui.IStateService,
  ) {}

  public createNotification(): IOverviewPageNotification {
    return {
      badgeText: 'common.urgent',
      badgeType: 'alert',
      canDismiss: false,
      dismiss: () => {
      },
      link: () => {
        this.$state.go('call-service.settings');
      },
      linkText: 'hercules.settings.migrateSipAddress.migrateNow',
      name: SipAddressMigrationNotificationService.SIP_ADDRESS_MIGRATION_NOTIFICATION_NAME,
      text: 'hercules.settings.migrateSipAddress.migrationNotification',
    };
  }
}
