import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/prereq/private-trunk-prereq.service';
import { IToolkitModalService } from 'modules/core/modal';
import { IOption, PrivateTrunkResource } from './private-trunk-setup';
import { ICertificate, IformattedCertificate, ICertificateFileNameIdMap } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services//private-trunk';

export interface  ICertificateArray {
  keys: Array<string>;
  values: Array<string>;
}

export class PrivateTrunkSetupCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 4;
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
  public isImporting: boolean = false;
  public isCertificateDefault: boolean = true;
  public isSetup: boolean = false;
  public btnLabel1: string;
  public btnLabel2: string;
  public privateTrunkSetupForm: ng.IFormController;
  public selectedVerifiledDomains: Array<string>;
  private errors: Array<any> = [];

  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private CertService,
    private CertificateFormatterService,
    private Authinfo,
    private Notification,
    private PrivateTrunkService: PrivateTrunkService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
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

  public isFinish(): boolean {
    return this.currentStepIndex === PrivateTrunkSetupCtrl.MAX_INDEX - 1;
  }

  public previousStep(): void {
    this.currentStepIndex = (this.currentStepIndex > PrivateTrunkSetupCtrl.MIN_INDEX) ? --this.currentStepIndex : this.currentStepIndex;
  }

  public isNextButton(): boolean  {
    switch (this.currentStepIndex) {
      case 1:
        return !this.isDomain || (_.isArray(this.domainSelected) && this.domainSelected.length > 0);
      case 2:
        return this.privateTrunkSetupForm.$valid;
      case 3:
        return this.isCertificateChoiceValid();
      default: break;
    }
    return false;
  }

  public setSelectedDomain(isDomain: boolean, domainSelected: Array<IOption>): void {
    this.domainSelected = _.cloneDeep(domainSelected);
    this.isDomain = isDomain;
    this.selectedVerifiledDomains = _.map(this.domainSelected, domainOption => domainOption.value);
  }

  public setResources(privateTrunkResource: PrivateTrunkResource): void {
    this.privateTrunkResource = _.cloneDeep(privateTrunkResource);
  }

  public uploadFile(file: File, fileName: string): void {
    if (!file) {
      return;
    }
    this.isImporting = true;
    this.fileName = fileName;
    this.CertService.uploadCertificate(this.Authinfo.getOrgId(), file)
    .then( (res) => this.readCerts(res))
    .catch (error => {
      this.isImporting = false;
      this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
    });

  }

  public readCerts(res) {
    if (res) {
      let certId = _.get(res, 'data.certId', '');
      let obj = _.clone(this.certFileNameIdMap);
      obj.push({ certId: certId, fileName: this.fileName });
      this.certFileNameIdMap = _.clone(obj);
    }
    this.CertService.getCerts(this.Authinfo.getOrgId())
    .then( res => {
      this.certificates = res || [];
      this.formattedCertList = this.CertificateFormatterService.formatCerts(this.certificates);
      this.isImporting = false;
    }, error => {
      this.Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotRead');
      this.isImporting = false;
    });
  }

  public deleteCertModal(certId: string): void {
    this.$modal.open({
      templateUrl: 'modules/hercules/private-trunk/setup/private-trunk-certificate-delete-confirm.html',
      type: 'dialog',
    })
      .result.then(() => {
        this.CertService.deleteCert(certId)
        .then(() => this.getUpdatedCertInfo(certId),
        ).catch(error => {
          this.Notification.errorWithTrackingId(error, 'hercules.settings.call.certificatesCannotDelete');
        });
      });
  }

  public deleteCerts(): void {
    _.forEach(this.formattedCertList, (cert) => {
      this.CertService.deleteCert(cert.certId);
    });
    this.formattedCertList = [];
    this.certFileNameIdMap  = [];
  }

  public getUpdatedCertInfo(certId: string) {
    this.readCerts(null);
    this.certFileNameIdMap.splice(_.indexOf(this.certFileNameIdMap, { certId: certId } ));
  }

  public changeOption(isCertificateDefault: boolean): void {
    this.isCertificateDefault = isCertificateDefault;
  }

  public isCertificateChoiceValid(): boolean {
    let isValid = false;
    if (this.isCertificateDefault) {
      isValid = true;
    } else if (this.formattedCertList && this.formattedCertList.length) {
      isValid = true;
    }
    return isValid;
  }

  public createPrivateTrunk(): ng.IPromise<any> {
    this.isSetup = true;
    let promises: Array<ng.IPromise<any>> = [];
    _.forEach(this.privateTrunkResource.destinations, (dest) => {
      let addressPort: Array<string> = dest.address.split(':');
      let resource: IPrivateTrunkResource = {
        name: dest.name,
        address: addressPort[0],
      };

      if (addressPort[1]) {
        resource.port =  _.toNumber(addressPort[1]);
      }
      promises.push(this.PrivateTrunkService.createPrivateTrunkResource(resource)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'servicesOverview.cards.privateTrunk.error.resourceError'));
        }));
    });

    if (!_.isEmpty(this.selectedVerifiledDomains)) {
      promises.push(this.PrivateTrunkService.setPrivateTrunk(this.selectedVerifiledDomains)
        .catch(error => {
          this.errors.push(this.Notification.processErrorResponse(error, 'servicesOverview.cards.privateTrunk.error.privateTrunkError'));
        }));
    }
    return this.$q.all(promises).then(() => {
      if (this.errors.length > 0) {
        this.errors.splice(0, 0, this.$translate.instant(''));
        this.Notification.notify(this.errors, 'servicesOverview.cards.privateTrunk.error.privateTrunkError');
      }
    });
  }

  public setupPrivateTrunk (): void {
    //cleanup certificates if the option changed to cisco default
    if (this.isCertificateDefault) {
      this.deleteCerts();
    }
    this.createPrivateTrunk()
      .then(() => {
        this.isSetup = false;
        if (!this.errors.length) {
          this.currentStepIndex++;
        }
      });
  }

  public setupComplete(): void {
    this.PrivateTrunkPrereqService.dismissModal();
    this.$state.go('private-trunk-overview');
  }

  public dismiss(): void {
    this.$modal.open({
      templateUrl: 'modules/hercules/private-trunk/setup/private-trunk-cancel-confirm.html',
      type: 'dialog',
    })
      .result.then(() => {
        this.deleteCerts();
        this.PrivateTrunkPrereqService.dismissModal();
        this.$state.go('services-overview');
      });
  }

}

export class PrivateTrunkSetupComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSetupCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-setup.html';
}
