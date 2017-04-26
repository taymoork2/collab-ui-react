import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/prereq/private-trunk-prereq.service';
import { IToolkitModalService } from 'modules/core/modal';
import { IOption, PrivateTrunkResource } from './private-trunk-setup';
import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services//private-trunk';
import { PrivateTrunkCertificateService } from 'modules/hercules/private-trunk/private-trunk-certificate';
import { Notification } from 'modules/core/notifications';

export interface  ICertificateArray {
  keys: Array<string>;
  values: Array<string>;
}

export class PrivateTrunkSetupCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 4;
  private static readonly MIN_INDEX: number = 1;

  public isNext: boolean = false;
  public currentStepIndex: number;

  //domain
  public domains: Array<string>;
  public isDomain: boolean;
  public selectedVerifiedDomains: Array<string>;
  public domainSelected: Array<IOption>;

  //resource/privatetrunk
  public privateTrunkResource: PrivateTrunkResource;
  private resourceAddSuccess: boolean = false;
  private privateTrunkAddError: boolean = false;

  //certs
  public formattedCertList: Array<IformattedCertificate>;
  public isImporting: boolean = false;
  public isCertificateDefault: boolean = true;

  //setup
  public isSetup: boolean = false;
  public btnLabel1: string;
  public btnLabel2: string;
  public privateTrunkSetupForm: ng.IFormController;

  private errors: Array<any> = [];


  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private PrivateTrunkCertificateService: PrivateTrunkCertificateService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private Notification: Notification,
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
    if (this.privateTrunkSetupForm.$dirty) {
      this.errors = [];
    }
  }

  public isNextButton(): boolean  {
    switch (this.currentStepIndex) {
      case 1:
        return !this.isDomain || (_.isArray(this.domainSelected) && this.domainSelected.length > 0);
      case 2:
        return this.privateTrunkSetupForm.$valid;
      case 3:
        return this.isCertificateChoiceValid() && !this.errors.length;
      default: break;
    }
    return false;
  }

  public setSelectedDomain(isDomain: boolean, domainSelected: Array<IOption>): void {
    this.domainSelected = _.cloneDeep(domainSelected);
    this.isDomain = isDomain;
    this.selectedVerifiedDomains = _.map(this.domainSelected, domainOption => domainOption.value);
  }

  public setResources(privateTrunkResource: PrivateTrunkResource): void {
    this.privateTrunkResource = _.cloneDeep(privateTrunkResource);
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
        }
        this.isImporting = false;
      });
  }

  public deleteCert(certId: string) {
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
          this.resourceAddSuccess = false;
          this.errors.push(this.Notification.processErrorResponse(error, 'servicesOverview.cards.privateTrunk.error.resourceError'));
        }));
    });

    if (!_.isEmpty(this.selectedVerifiedDomains)) {
      promises.push(this.PrivateTrunkService.setPrivateTrunk(this.selectedVerifiedDomains)
        .catch(error => {
          this.privateTrunkAddError = true;
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
      this.PrivateTrunkCertificateService.deleteUploadedCerts();
    }
    this.createPrivateTrunk()
      .then(() => {
        this.isSetup = false;
        if (!this.errors.length) {
          this.currentStepIndex++;
        }
        if (this.privateTrunkAddError) {
          this.cleanupOnError();
        }
      });
  }

  public cleanupOnError(): void {
    this.PrivateTrunkService.removePrivateTrunkResources();
    this.PrivateTrunkCertificateService.deleteUploadedCerts();
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
        this.PrivateTrunkCertificateService.deleteUploadedCerts();
        this.PrivateTrunkPrereqService.dismissModal();
        this.$state.go('services-overview');
      });
  }

}

export class PrivateTrunkSetupComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSetupCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-setup.html';
}
