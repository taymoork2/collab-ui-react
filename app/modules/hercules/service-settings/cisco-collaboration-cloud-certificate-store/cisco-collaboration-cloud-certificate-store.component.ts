import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { CiscoCollaborationCloudCertificateService } from './';
import { FeatureToggleService } from 'modules/core/featureToggle';

export class CiscoCollaborationCloudCertificateStoreCtrl implements ng.IComponentController {
  public certificateCustom: boolean = false;
  public certificate: any;
  public file: File;
  public onChangeFn: Function;
  public onChangeOptionFn: Function;
  public formattedCertList: IformattedCertificate[];
  public certLabels: string[];
  public isImporting: boolean = false;
  public isFirstTimeSetup: boolean;
  public certTitle: string;
  public certDesc: string;
  public isCustomCertificateEnabled: boolean;

  /* @ngInject */
  constructor(
   private $scope: ng.IScope,
   private $translate: ng.translate.ITranslateService,
   private CiscoCollaborationCloudCertificateService: CiscoCollaborationCloudCertificateService,
   private FeatureToggleService: FeatureToggleService,
   ) {  }

  public $onInit(): void {
    this.$scope.$watch(() => this.file,
    file => this.onChangeFile(file),
    );
    this.isCustomCertificateEnabled = false;
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hf6932Certificate).then(result => {
      this.isCustomCertificateEnabled = result;
      this.formattedCertList = !this.isCustomCertificateEnabled ? [] : this.formattedCertList;
    });

    this.certLabels = [
      this.$translate.instant('hercules.settings.call.certificatesEmailAddress'),
      this.$translate.instant('hercules.settings.call.certificatesCommonName'),
      this.$translate.instant('hercules.settings.call.certificatesOrganizationalUnit'),
      this.$translate.instant('hercules.settings.call.certificatesOrganization'),
      this.$translate.instant('hercules.settings.call.certificatesLocality'),
      this.$translate.instant('hercules.settings.call.certificatesStateOrProvince'),
      this.$translate.instant('hercules.settings.call.certificatesCountry'),
      '',
      this.$translate.instant('hercules.settings.call.certificatesCreated'),
      this.$translate.instant('hercules.settings.call.certificatesExpires'),
    ];

    this.certTitle = (!this.isFirstTimeSetup) ?  this.$translate.instant('servicesOverview.cards.privateTrunk.certificateTitleSettings') : this.$translate.instant('servicesOverview.cards.privateTrunk.certificateTitle');
    this.certDesc = (!this.isFirstTimeSetup) ?  this.$translate.instant('servicesOverview.cards.privateTrunk.certificateDescSettings') : this.$translate.instant('servicesOverview.cards.privateTrunk.certificateDescriptionNew');
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { formattedCertList, isImporting } = changes;

    if (!_.isUndefined(formattedCertList)) {
      this.setFormattedCertList(formattedCertList.currentValue);
    }

    if (!_.isUndefined(isImporting)) {
      this.isImporting = isImporting.currentValue;
    }
  }

  public isCustomEnabled(): boolean {
    return this.isCustomCertificateEnabled && !_.isEmpty(this.formattedCertList);
  }

  public setFormattedCertList(formattedCertList: IformattedCertificate[]): void {
    this.formattedCertList = _.cloneDeep(formattedCertList);
    if (!_.isUndefined(this.formattedCertList) && this.formattedCertList.length) {
      this.certificateCustom = true;
    }
  }

  public deleteCert(certId: string) {

    this.CiscoCollaborationCloudCertificateService.deleteCert(certId)
    .then( cert => {
      if (cert) {
        this.formattedCertList = cert.formattedCertList || [];
      }
      if (!cert.formattedCertList.length) {
        this.certificateCustom = false;
      }
    });
  }

  public deleteAllCerts() {
    this.CiscoCollaborationCloudCertificateService.deleteCerts()
    .then( () => {
      this.formattedCertList = [];
      this.certificateCustom = false;
    });
  }

  public onChangeFile(file) {
    this.onChangeFn ({
      file: file,
    });
  }

  public changeOption() {
    this.onChangeOptionFn ({
      isCertificateDefault: !this.certificateCustom,
    });
  }
}

export class CiscoCollaborationCloudCertificateStoreComponent implements ng.IComponentOptions {
  public controller = CiscoCollaborationCloudCertificateStoreCtrl;
  public template = require('./cisco-collaboration-cloud-certificate.html');
  public bindings = {
    isFirstTimeSetup: '<',
    formattedCertList: '<',
    isImporting: '<',
    onChangeFn: '&',
    onChangeOptionFn: '&',
  };
}
