import { ICertificate, IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { CiscoCollaborationCloudCertificateService } from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store';
import { PrivateTrunkPrereqService } from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import { IOption } from 'modules/hercules/private-trunk/private-trunk-setup/private-trunk-setup';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/';
import { Notification } from 'modules/core/notifications';

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
  public modalOptions: any = {
    template: '<private-trunk-deactivate dismiss="$dismiss()" class="modal-content"></private-trunk-deactivate>',
    type: 'dialog',
  };
  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private CiscoCollaborationCloudCertificateService: CiscoCollaborationCloudCertificateService,
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private PrivateTrunkService: PrivateTrunkService,
    private Notification: Notification,
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
    this.CiscoCollaborationCloudCertificateService.readCerts()
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
    this.updatePrivateTrunk();
  }

  public updatePrivateTrunk(): void {
    this.PrivateTrunkService.setPrivateTrunk(this.selectedVerifiedDomains)
      .catch(error => this.Notification.errorResponse(error, 'servicesOverview.cards.privateTrunk.error.privateTrunkError'));
  }

  public uploadFile(file: File): void {
    if (!file) {
      return;
    }
    this.isImporting = true;
    this.CiscoCollaborationCloudCertificateService.uploadCertificate(file)
      .then( cert => {
        if (cert) {
          this.formattedCertList = cert.formattedCertList || [];
          this.isImporting = cert.isImporting;
        } else {
          this.isImporting = false;
        }
      });
  }

  public changeOption(isCertificateDefault: boolean): void {
    this.isCertificateDefault = isCertificateDefault;
  }

}

export class PrivateTrunkOverviewSettingsComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkOverviewSettingsCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-overview-settings/private-trunk-overview-settings.html');
  public bindings = {
    hasPrivateTrunkFeatureToggle: '<',
  };
}
