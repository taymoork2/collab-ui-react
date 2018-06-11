import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class SsoCertificateExpirationNotificationService {
  public static readonly CERTIFICATE_EXPIRATION_DAYS = 90;
  public static readonly SSO_CERTIFICATE_NOTIFICATION_NAME = 'ssoCertificateUpdate';

  /* @ngInject */
  constructor (
    private $state: ng.ui.IStateService,
  ) {}

  public createNotification(days: number): IOverviewPageNotification {
    return {
      badgeText: 'common.urgent',
      badgeType: 'alert',
      canDismiss: false,
      dismiss: () => {
      },
      link: () => {
        this.$state.go('sso-certificate.sso-certificate-check');
      },
      linkText: 'ssoCertificateModal.updateCertificate',
      name: SsoCertificateExpirationNotificationService.SSO_CERTIFICATE_NOTIFICATION_NAME,
      text: (days > 0) ? 'ssoCertificateModal.certificateExpirationWarning' : 'ssoCertificateModal.certificateExpirationNotice',
      textValues: {
        days: days,
      },
    };
  }
}
