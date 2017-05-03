import { ICertificate, IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkCertificateService } from 'modules/hercules/private-trunk/private-trunk-certificate';
import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/private-trunk-prereq/private-trunk-prereq.service';
import { IOption } from 'modules/hercules/private-trunk/private-trunk-setup/private-trunk-setup';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/';

export class PrivateTrunkOverviewSettingsCtrl implements ng.IComponentController {
  public hasPrivateTrunkFeatureToggle: boolean;
  public backState = 'services-overview';
  public certificates: ICertificate;
  public formattedCertList: Array<IformattedCertificate>;
  public isImporting: boolean = false;
  public isCertificateDefault: boolean = true;
  public domains: Array<string>;
  public isDomain: boolean;
  public selectedVerifiedDomains: Array<string>;
  public domainSelected: Array<IOption>;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private PrivateTrunkCertificateService: PrivateTrunkCertificateService,
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private PrivateTrunkService: PrivateTrunkService,
  ) {
  }

  public $onInit(): void {
    if (!this.hasPrivateTrunkFeatureToggle) {
      this.$state.go(this.backState);
    } else {
      this.initCertificates();
      this.initDomainInfo();
    }
  }

  public initDomainInfo(): void {
    this.PrivateTrunkPrereqService.getVerifiedDomains().then(verifiedDomains => {
      this.domains = verifiedDomains;
    });
    this.PrivateTrunkService.getPrivateTrunk().then(res => {
      this.selectedVerifiedDomains = res.domains || [];
      this.isDomain = true;
      this.domainSelected = _.map(this.domains, domain => {
        if (!_.isUndefined(_.find(this.selectedVerifiedDomains, selected => selected === domain))) {
          return ({ value: domain, label: domain, isSelected: true });
        } else {
          return ({ value: domain, label: domain, isSelected: false });
        }
      });
    });
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

  public setSelectedDomain(isDomain: boolean, domainSelected: Array<IOption>): void {
    this.domainSelected = _.cloneDeep(domainSelected);
    this.isDomain = isDomain;
    this.selectedVerifiedDomains = _.map(this.domainSelected, domainOption => domainOption.value);
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

export class PrivateTrunkOverviewSettingsComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewSettingsCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-overview-settings/private-trunk-overview-settings.html';
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
