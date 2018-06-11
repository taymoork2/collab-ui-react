import { PrivateTrunkPrereqService } from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import { IToolkitModalService } from 'modules/core/modal';
import { IOption, PrivateTrunkResource } from './private-trunk-setup';
import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkService } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk.service';
import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';
import { CiscoCollaborationCloudCertificateService } from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store';
import { Notification } from 'modules/core/notifications';

export interface  ICertificateArray {
  keys: string[];
  values: string[];
}

export class PrivateTrunkSetupCtrl implements ng.IComponentController {
  private static readonly MAX_INDEX: number = 4;
  private static readonly MIN_INDEX: number = 1;

  public isNext: boolean = false;
  public currentStepIndex: number;

  //domain
  public domains: string[];
  public isDomain: boolean;
  public selectedVerifiedDomains: string[];
  public domainSelected: IOption[];

  //resource/SIP Destinations
  public privateTrunkResource: PrivateTrunkResource;
  private resourceAddSuccess: boolean = true;
  private privateTrunkAddError: boolean = false;
  public setupTitle: string;
  //certs
  public formattedCertList: IformattedCertificate[];
  public isImporting: boolean = false;
  public isCertificateDefault: boolean = true;

  //setup
  public isSetup: boolean = false;
  public btnLabel1: string;
  public btnLabel2: string;
  public privateTrunkSetupForm: ng.IFormController;
  private dismiss: Function;
  public isFirstTimeSetup: boolean;
  public promises: ng.IPromise<any>[] = [];
  public errors: string[] = [];

  /* @ngInject */
  constructor(
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private CiscoCollaborationCloudCertificateService: CiscoCollaborationCloudCertificateService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private Notification: Notification,
    private PrivateTrunkService: PrivateTrunkService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
  ) {
  }

  public $onInit(): void {
    if (_.isUndefined(this.currentStepIndex)) {
      this.currentStepIndex = 1;
    }
    this.setupTitle = this.$translate.instant('servicesOverview.cards.privateTrunk.setupTitle');
    this.isFirstTimeSetup = (this.$state.current.name === 'services-overview');
    if (!this.isFirstTimeSetup) {
      this.currentStepIndex = 2;
      this.setupTitle = this.$translate.instant('servicesOverview.cards.privateTrunk.destinationTitle');
    }

    this.isDomain = true;
    this.initDomainInfo();
    if (_.isUndefined(this.domainSelected)) {
      this.domainSelected = [];
    }
    this.initCertificateInfo();
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

  public isClose(): boolean {
    return (this.currentStepIndex === 1 || this.currentStepIndex === 2 && !this.isFirstTimeSetup);
  }

  public leftButtonLabel(): string {
    let label = this.$translate.instant('common.close');
    if (this.isClose()) {
      label = this.$translate.instant('common.close');
    } else if (this.currentStepIndex < 4) {
      label = this.$translate.instant('common.back');
    }
    return label;
  }

  public leftButtonAction(): void {
    if (this.isClose()) {
      this.dismissModal();
    } else if (this.currentStepIndex < 4) {
      this.previousStep();
    }
  }

  public setSelectedDomain(isDomain: boolean, domainSelected: IOption[]): void {
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
    this.CiscoCollaborationCloudCertificateService.uploadCertificate(file)
      .then( cert => {
        if (cert) {
          this.formattedCertList = cert.formattedCertList || [];
          this.isImporting = cert.isImporting;
        }
        this.isImporting = false;
      });
  }

  public changeOption(isCertificateDefault: boolean): void {
    this.isCertificateDefault = isCertificateDefault;
    if (!this.isCertificateDefault) {
      this.initCertificateInfo();
    }
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

  public initCertificateInfo(): void {
    this.CiscoCollaborationCloudCertificateService.readCerts()
      .then((cert) => {
        if (!_.isUndefined(cert)) {
          this.formattedCertList = cert.formattedCertList;
        }
      });
  }

  public createPrivateTrunk(): ng.IPromise<any> {
    return this.PrivateTrunkService.setPrivateTrunk(this.selectedVerifiedDomains)
      .catch(error => {
        this.privateTrunkAddError = true;
        this.errors.push(error.data.errorMessage);
      });
  }

  public addSipDestinations(): ng.IPromise<any> {
    if (!_.isEmpty(this.privateTrunkResource.hybridDestination.name)) {
      this.privateTrunkResource.destinations = [];
      this.privateTrunkResource.destinations.push(this.privateTrunkResource.hybridDestination);
    }
    // Create the first SIP Destination
    const resource = this.getResource(_.first(this.privateTrunkResource.destinations));
    this.promises.push(this.PrivateTrunkService.createPrivateTrunkResource(resource)
      .then(() => {
        this.resourceAddSuccess = true;
        //Add rest of the resources
        _.forEach (_.drop(this.privateTrunkResource.destinations, 1), dest => {
          const resource = this.getResource(dest);
          this.promises.push(this.PrivateTrunkService.createPrivateTrunkResource(resource)
            .catch(error => {
              this.errors.push(error.data.errorMessage);
            }));
        });
      }).catch(error => {
        this.resourceAddSuccess = false;
        this.errors.push(this.$translate.instant('servicesOverview.cards.privateTrunk.error.resourceError'));
        this.errors.push(error.data.errorMessage);
      }));
    return this.$q.all(this.promises);
  }

  public getResource(dest): IPrivateTrunkResource {
    const addressPort: string[] = dest.address.split(':');
    const resource: IPrivateTrunkResource = {
      name: dest.name,
      address: addressPort[0],
    };

    if (addressPort[1]) {
      resource.port =  _.toNumber(addressPort[1]);
    }
    return resource;
  }

  public setupPrivateTrunk (): void {
    this.isSetup = true;
    const promises: ng.IPromise<any>[] = [];

    promises.push(this.addSipDestinations());
    if (this.isFirstTimeSetup) {
      promises.push(this.createPrivateTrunk());
      this.$q.all(promises).then(() => {
        this.isSetup = false;
        if (!this.privateTrunkAddError && this.resourceAddSuccess) {
          this.currentStepIndex++;
        }
        if (this.privateTrunkAddError || !this.resourceAddSuccess) {
          this.Notification.notify(this.errors);
          this.cleanupOnError();
          this.PrivateTrunkPrereqService.dismissModal();
        } else if (this.errors.length) {
          //At least one resouce has been added and one or more resource addition failed.
          //This is success path, but do notify errors.
          this.Notification.notify(this.errors);
        }
      });
    } else {
      this.$q.all(promises).then(() => {
        this.isSetup = false;
        if (this.resourceAddSuccess) {
          this.Notification.success('servicesOverview.cards.privateTrunk.success.resource');
        } else {
          this.Notification.notify(this.errors);
        }
        this.$state.go('private-trunk-overview.list');
        this.dismiss();
      });
    }
  }

  public cleanupOnError(): void {
    this.PrivateTrunkService.removePrivateTrunkResources();
    this.CiscoCollaborationCloudCertificateService.deleteUploadedCerts();
  }


  public setupComplete(): void {
    this.PrivateTrunkPrereqService.dismissModal();
    this.$state.go('private-trunk-overview.settings');
  }

  public dismissModal(): void {
    const template = (this.isFirstTimeSetup) ? require('./private-trunk-cancel-confirm.html') : require('./private-trunk-destination-cancel-confirm.html');
    this.$modal.open({
      template: template,
      type: 'dialog',
    })
      .result.then(() => {
        this.CiscoCollaborationCloudCertificateService.deleteUploadedCerts();
        if (!this.isFirstTimeSetup) {
          this.dismiss();
          this.$state.go('private-trunk-overview.settings');
        } else {
          this.PrivateTrunkPrereqService.dismissModal();
          if ( this.currentStepIndex ===  PrivateTrunkSetupCtrl.MAX_INDEX ) {
            this.$state.go('private-trunk-overview.settings');
          }
        }
      });
  }

}

export class PrivateTrunkSetupComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkSetupCtrl;
  public template = require('modules/hercules/private-trunk/private-trunk-setup/private-trunk-setup.html');
  public bindings = {
    currentStepIndex: '<',
    dismiss: '&',
  };
}
