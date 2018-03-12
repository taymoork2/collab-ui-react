import { SsoCertificateService } from '../sso-certificate.service';

export class DownloadMetadataFileController implements ng.IComponentController {
  public dismiss: Function;
  public isMultiple: boolean;
  public isLoading = true;
  public objectUrl: string;
  public filename: string;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams,
    private Authinfo,
    private SsoCertificateService: SsoCertificateService,
  ) {}

  public $onInit(): void {
    this.isMultiple = _.get<boolean>(this.$stateParams, 'isMultiple', undefined);
    this.SsoCertificateService.addLatestCertificateToOrg()
      .then(() => {
        return this.downloadHostedSp();
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
    this.$state.go('sso-certificate.test-sso');
  }

  public back(): void {
    this.$state.go('sso-certificate.certificate-type');
  }

  private downloadHostedSp(): void {
    this.SsoCertificateService.downloadMetadata(this.isMultiple)
      .then((metadataXml) => {
        this.filename = 'idb-meta-' + this.Authinfo.getOrgId() + '-SP.xml';
        this.objectUrl = this.SsoCertificateService.createObjectUrl(metadataXml);
      });
  }
}

export class DownloadMetadataFileComponent implements ng.IComponentOptions {
  public controller = DownloadMetadataFileController;
  public template = require('./download-metadata-file.html');
  public bindings = {
    dismiss: '&',
  };
}
