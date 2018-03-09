import { IOverviewPageNotification } from 'modules/core/overview/overviewPage.types';

export class SsoCertificateExpirationNotificationService {

  /* @ngInject */
  constructor (
    private $state: ng.ui.IStateService,
  ) {}

  public createNotification(days: string): IOverviewPageNotification {
    return {
      badgeText: 'common.urgent',
      badgeType: 'alert',
      canDismiss: true,
      dismiss: () => {
        // TO-DO update with the latest certificate
      },
      link: () => {
        this.$state.go('sso-certificate.check-certificate');
      },
      linkText: 'ssoCertificateModal.updateCertificate',
      name: 'ssoCertificateUpdate',
      text: 'ssoCertificateModal.certificateExpirationWarning',
      textValues: {
        days: days,
      },
    };
  }
}
