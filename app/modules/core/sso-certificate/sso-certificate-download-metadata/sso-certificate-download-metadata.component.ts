import { SsoCertificateService } from 'modules/core/sso-certificate/shared/sso-certificate.service';
import { Notification } from 'modules/core/notifications';

export class SsoCertificateDownloadMetadataController implements ng.IComponentController {
  public dismiss: Function;
  public isMultiple: boolean;
  public isLoading = true;
  public objectUrl: string;
  public filename: string;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Authinfo,
    private SsoCertificateService: SsoCertificateService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.SsoCertificateService.addLatestCertificateToOrg()
      .then(() => {
        return this.downloadHostedSp();
      })
      .catch((response) => {
        this.Notification.errorResponse(response);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  public $onDestroy(): void {
    this.SsoCertificateService.revokeObjectUrl();
  }

  public dismissModal(): void {
    this.dismiss();
  }

  public next(): void {
    this.$state.go('sso-certificate.sso-certificate-test');
  }

  public back(): void {
    this.$state.go('sso-certificate.sso-certificate-type');
  }

  private downloadHostedSp(): void {
    this.SsoCertificateService.downloadMetadata(this.isMultiple)
      .then((metadataXml) => {
        this.filename = `idb-meta-${this.Authinfo.getOrgId()}-SP.xml`;
        this.objectUrl = this.SsoCertificateService.createObjectUrl(metadataXml);
      })
      .catch((response) => {
        this.Notification.errorResponse(response);
      });
  }
}

export class SsoCertificateDownloadMetadataComponent implements ng.IComponentOptions {
  public controller = SsoCertificateDownloadMetadataController;
  public template = require('./sso-certificate-download-metadata.html');
  public bindings = {
    isMultiple: '<',
    dismiss: '&',
  };
}
