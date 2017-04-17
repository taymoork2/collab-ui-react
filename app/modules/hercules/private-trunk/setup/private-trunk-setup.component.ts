import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/prereq/private-trunk-prereq.service';
import { IToolkitModalService } from 'modules/core/modal';
import { IOption, PrivateTrunkResource } from './private-trunk-setup';
import { ICertificate, IformattedCertificate, ICertificateFileNameIdMap } from 'modules/hercules/services/certificate-formatter-service';

export interface  ICertificateArray {
  keys: Array<string>;
  values: Array<string>;
}

export class PrivateTrunkSetupCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 3;
  private static readonly MIN_INDEX: number = 1;
  public domainSelected: Array<IOption>;
  public isNext: boolean = false;
  public currentStepIndex: number;
  public domains: Array<string>;
  public isDomain: boolean;
  public privateTrunkResource: PrivateTrunkResource;
  public certificates: ICertificate;
  public formattedCertList: Array<IformattedCertificate>;
  public certificateInfo: ICertificateArray;
  public certFileNameIdMap: Array<ICertificateFileNameIdMap> = [];
  public fileName: string;
  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private CertService,
    private CertificateFormatterService,
    private Authinfo,
    private Notification,
  ) {
  }

  public $onInit(): void {
    this.currentStepIndex = 1;
    this.isDomain = true;
    this.initDomainInfo();
    if (_.isUndefined(this.domainSelected)) {
      this.domainSelected = [];
    }

  }

  public initDomainInfo(): void {
    this.PrivateTrunkPrereqService.getVerifiedDomains().then(verifiedDomains => {
      this.domains = verifiedDomains;
    });
  }

  public nextStep(): void {
    this.currentStepIndex = (this.currentStepIndex < PrivateTrunkSetupCtrl.MAX_INDEX) ? ++this.currentStepIndex : this.currentStepIndex;
  }

  public previousStep(): void {
    this.currentStepIndex = (this.currentStepIndex > PrivateTrunkSetupCtrl.MIN_INDEX) ? --this.currentStepIndex : this.currentStepIndex;
  }

  public setSelectedDomain(isDomain: boolean, domainSelected: Array<IOption>): void {
    this.domainSelected = _.cloneDeep(domainSelected);
    this.isDomain = isDomain;
  }

  public setResources(privateTrunkResource: PrivateTrunkResource): void {
    this.privateTrunkResource = _.cloneDeep(privateTrunkResource);
  }

  public uploadFile(file: File, fileName: string): void {
    if (!file) {
      return;
    }
    this.fileName = fileName;
    this.CertService.uploadCertificate(this.Authinfo.getOrgId(), file)
    .then( (res) => this.readCerts(res),
    ).catch (error => {
      this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
    });

  }

  public readCerts(res) {
    let certId = _.get(res, 'data.certId', '');
    let obj = _.clone(this.certFileNameIdMap);
    obj.push({ certId: certId, fileName: this.fileName });
    this.certFileNameIdMap = _.clone(obj);
    this.CertService.getCerts(this.Authinfo.getOrgId())
    .then( res => {
      this.certificates = res || [];
      this.formattedCertList = this.CertificateFormatterService.formatCerts(this.certificates);
    }, error => {
      this.Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotRead');
    });
  }

  public isNextButton(): boolean {
    let isNextButton = (!this.isDomain || (_.isArray(this.domainSelected) && this.domainSelected.length > 0));
    return (isNextButton && this.currentStepIndex < PrivateTrunkSetupCtrl.MAX_INDEX) ;
  }

  public dismiss(): void {
    this.$modal.open({
      templateUrl: 'modules/hercules/private-trunk/setup/private-trunk-cancel-confirm.html',
      type: 'dialog',
    })
      .result.then(() => {
        this.PrivateTrunkPrereqService.dismissModal();
        this.$state.go('services-overview');
      });
  }

}

export class PrivateTrunkSetupComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSetupCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-setup.html';
}
