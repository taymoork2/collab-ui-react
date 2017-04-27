import { ICertificate, IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkCertificateService } from 'modules/hercules/private-trunk/private-trunk-certificate';

export class PrivateTrunkOverviewCtrl implements ng.IComponentController {
  public back: boolean = true;
  public backState = 'services-overview';
  public hasPrivateTrunkFeatureToggle: boolean;
  public tabs = [{
    title: 'Resources',
    state: 'private-trunk-overview.list',
  }, {
    title: 'Settings',
    state: 'private-trunk-overview.settings',
  }];
  public certificates: ICertificate;
  public formattedCertList: Array<IformattedCertificate>;
  public isImporting: boolean = false;
  public isCertificateDefault: boolean = true;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private PrivateTrunkCertificateService: PrivateTrunkCertificateService,
  ) {
  }

  public $onInit(): void {
    if (!this.hasPrivateTrunkFeatureToggle) {
      this.$state.go(this.backState);
    } else {
      this.initCertificates();
    }
  }

  public initCertificates(): void {
    this.PrivateTrunkCertificateService.readCerts()
      .then((cert) => {
        this.formattedCertList = cert.formattedCertList;
        this.isImporting = cert.isImporting;
        if (_.isArray(this.formattedCertList) && this.formattedCertList.length) {
          this.isCertificateDefault = false;
        }
      });
  }

  public uploadFile(file: File): void {
    if (!file) {
      return;
    }
    this.isImporting = true;
    this.PrivateTrunkCertificateService.uploadCertificate(file)
      .then( cert => {
        if (cert) {
          this.formattedCertList = cert.formattedCertList || [];
          this.isImporting = cert.isImporting;
        } else {
          this.isImporting = false;
        }
      });
  }

  public deleteCert(certId: string): void {
    this.PrivateTrunkCertificateService.deleteCert(certId)
    .then( cert => {
      if (cert) {
        this.formattedCertList = cert.formattedCertList || [];
      }
    });
  }

  public changeOption(isCertificateDefault: boolean): void {
    this.isCertificateDefault = isCertificateDefault;
  }

}

export class PrivateTrunkOverviewComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewCtrl;
  public templateUrl = 'modules/hercules/private-trunk/overview/private-trunk-overview.html';
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
