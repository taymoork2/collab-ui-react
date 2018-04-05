import { SsoCertificateService, IIdpMetadata } from 'modules/core/sso-certificate/shared/sso-certificate.service';
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
        const entityId = (<IIdpMetadata>response).entityId;
        const reqBinding = this.checkReqBinding((<IIdpMetadata>response).metadataXml!);
        if (entityId && reqBinding) {
          const _BINDINGS = 'urn:oasis:names:tc:SAML:2.0:bindings:';
          const testUrl = `${this.UrlConfig.getSSOTestUrl()}?metaAlias=/${this.Authinfo.getOrgId()}/sp&idpEntityID=${encodeURIComponent(entityId)}&binding=${_BINDINGS}HTTP-POST&reqBinding=${_BINDINGS}${reqBinding}&reqCertId=${this.SsoCertificateService.getLatestCertificate().id}`;
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

  private checkReqBinding(metadataXml: string): string {
    const SINGLE_SIGN_ON = 'SingleSignOnService';
    const SSO_BINDINGS = 'Binding="urn:oasis:names:tc:SAML:2.0:bindings:';
    const BINDING_END = '" ';
    const LOCATION = 'Location';

    let start = metadataXml.indexOf(SINGLE_SIGN_ON);
    start = metadataXml.indexOf(SSO_BINDINGS, start);
    const end = metadataXml.indexOf(LOCATION, start) - BINDING_END.length;
    const reqBinding = metadataXml.substring(start + SSO_BINDINGS.length, end);
    return reqBinding;
  }
}

export class SsoCertificateTestComponent implements ng.IComponentOptions {
  public controller = SsoCertificateTestController;
  public template = require('./sso-certificate-test.html');
  public bindings = {
    dismiss: '&',
  };
}
