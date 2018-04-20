import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { CiscoCollaborationCloudCertificateService } from './';

export class CiscoCollaborationCloudCertificateStoreCtrl implements ng.IComponentController {
  public certificateCustom: boolean = false;
  public certificate: any;
  public file: File;
  public onChangeFn: Function;
  public onChangeOptionFn: Function;
  public serviceId: 'ept' | 'squared-fusion-ec';
  public formattedCertList: IformattedCertificate[];
  public certLabels: string[];
  public isImporting: boolean = false;
  public isFirstTimeSetup: boolean;
  public certTitle: string;
  public certDesc: string;

  /* @ngInject */
  constructor(
   private $scope: ng.IScope,
   private $translate: ng.translate.ITranslateService,
   private CiscoCollaborationCloudCertificateService: CiscoCollaborationCloudCertificateService,
   ) {  }

  public $onInit(): void {
    this.$scope.$watch(() => this.file,
    file => this.onChangeFile(file),
    );

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
    return !_.isEmpty(this.formattedCertList);
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
    serviceId: '<',
  };
}
