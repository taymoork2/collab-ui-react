import { ICertificate, IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkCertificateService } from 'modules/hercules/private-trunk/private-trunk-certificate';
import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/private-trunk-prereq/private-trunk-prereq.service';
import { IOption } from 'modules/hercules/private-trunk/private-trunk-setup/private-trunk-setup';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/';

export class PrivateTrunkOverviewSettingsCtrl implements ng.IComponentController {
  public hasPrivateTrunkFeatureToggle: boolean;
  public backState = 'services-overview';
  public certificates: ICertificate;
  public formattedCertList: IformattedCertificate[];
  public isImporting: boolean = false;
  public isCertificateDefault: boolean;
  public domains: string[];
  public isDomain: boolean;
  public selectedVerifiedDomains: string[];
  public domainSelected: IOption[] = [];
  public privateTrunkDeactivateModalOptions: any = {
    template: '<private-trunk-deactivate dismiss="$dismiss()" class="modal-content"></private-trunk-deactivate>',
    type: 'dialog',
  };
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
      this.initCertificateInfo();
      this.initDomainInfo();
    }
  }

  public initDomainInfo(): void {
    this.PrivateTrunkPrereqService.getVerifiedDomains().then(verifiedDomains => {
      this.domains = verifiedDomains;
      this.PrivateTrunkService.getPrivateTrunk().then(res => {
        this.selectedVerifiedDomains = res.domains || [];
        this.isDomain = true;
        this.domainSelected = _.map(this.selectedVerifiedDomains, domain => {
          return ({ value: domain, label: domain, isSelected: true });
        });
      });
    });
  }

  public initCertificateInfo(): void {
    this.isCertificateDefault = true;
    this.PrivateTrunkCertificateService.readCerts()
      .then((cert) => {
        if (!_.isUndefined(cert)) {
          this.formattedCertList = cert.formattedCertList;
          this.isCertificateDefault =  (!_.isArray(this.formattedCertList) || this.formattedCertList.length === 0);
        }
      });
  }

  public setSelectedDomain(isDomain: boolean, domainSelected: IOption[]): void {
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
        this.isCertificateDefault =  (!_.isArray(this.formattedCertList) || this.formattedCertList.length === 0);
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
