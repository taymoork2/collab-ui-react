import { SsoCertificateService } from 'modules/core/sso-certificate/shared/sso-certificate.service';
import { Notification } from 'modules/core/notifications';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class SsoCertificateTestController implements ng.IComponentController {
  public dismiss: Function;
  public ssoTested = false;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private SsoCertificateService: SsoCertificateService,
    private Notification: Notification,
    private ModalService: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    private Authinfo,
    private UrlConfig,
  ) {}

  public dismissModal(): void {
    this.dismiss();
  }

  public close(): void {
    const options = <IToolkitModalSettings>{
      type: 'dialog',
      hideTitle: true,
      message: this.$translate.instant('ssoCertificateModal.switchMetadataExitConfirmation'),
      dismiss: this.$translate.instant('common.yes'),
      close: this.$translate.instant('common.no'),
    };
    this.ModalService.open(options).result
      .then(() => {
        _.noop();
      }, () => {
        this.dismiss();
      });
  }

  public testSso(): void {
    this.SsoCertificateService.downloadIdpMetadata()
      .then(response => {
        const entityId = response.entityId;
        if (entityId) {
          const reqBinding = this.SsoCertificateService.getReqBinding(response.metadataXml!);
          const testUrl = `${this.UrlConfig.getSSOTestUrl()}?metaAlias=/${this.Authinfo.getOrgId()}/sp&idpEntityID=${encodeURIComponent(entityId)}&binding=${this.SsoCertificateService.HTTP_POST_BINDINGS}${reqBinding}&reqCertId=${this.SsoCertificateService.getLatestCertificate().id}`;
          this.$window.open(testUrl);
          this.ssoTested = true;
        }
      })
      .catch((response) => {
        this.Notification.errorResponse(response);
      });
  }

  public switchMetadata(): void {
    this.SsoCertificateService.switchMetadata()
      .then(() => {
        this.$rootScope.$broadcast('Core::ssoCertificateExpirationNotificationDismissed');
        this.Notification.success('ssoCertificateModal.switchMetadataSuccess');
        this.dismiss();
      })
      .catch((response) => {
        this.Notification.errorResponse(response);
      });
  }
}

export class SsoCertificateTestComponent implements ng.IComponentOptions {
  public controller = SsoCertificateTestController;
  public template = require('./sso-certificate-test.html');
  public bindings = {
    dismiss: '&',
  };
}
