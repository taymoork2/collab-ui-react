import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';
import { PrivateTrunkCertificateService } from './';

export class PrivateTrunkCertificateCtrl implements ng.IComponentController {
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

  /* @ngInject */
  constructor(
   private $scope: ng.IScope,
   private $translate: ng.translate.ITranslateService,
   private PrivateTrunkCertificateService: PrivateTrunkCertificateService,
   ) {

  }

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

    this.certTitle = (!this.isFirstTimeSetup) ?  this.$translate.instant('servicesOverview.cards.privateTrunk.certificateTitleSettings') : this.$translate.instant('servicesOverview.cards.privateTrunk.certificateTitle');
    this.certDesc = (!this.isFirstTimeSetup) ?  this.$translate.instant('servicesOverview.cards.privateTrunk.certificateDescSettings') : this.$translate.instant('servicesOverview.cards.privateTrunk.certificateDescription');

  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { formattedCertList, isImporting } = changes;

    if (!_.isUndefined(formattedCertList)) {
      this.setFormattedCertList(formattedCertList.currentValue);
    }

    if (!_.isUndefined(isImporting)) {
      this.isImporting = isImporting.currentValue;
    }
  }

  public setFormattedCertList(formattedCertList: IformattedCertificate[]): void {
    this.formattedCertList = _.cloneDeep(formattedCertList);
    if (!_.isUndefined(this.formattedCertList) && this.formattedCertList.length) {
      this.certificateCustom = true;
    }
  }

  public deleteCert(certId: string) {

    this.PrivateTrunkCertificateService.deleteCert(certId)
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
    this.PrivateTrunkCertificateService.deleteCerts()
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

export class PrivateTrunkCertificateComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkCertificateCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-certificate/private-trunk-certificate.html';
  public bindings = {
    isFirstTimeSetup: '<',
    formattedCertList: '<',
    isImporting: '<',
    onChangeFn: '&',
    onChangeOptionFn: '&',
  };
}
