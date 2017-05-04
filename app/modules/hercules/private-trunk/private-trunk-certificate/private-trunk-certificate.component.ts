import { IformattedCertificate } from 'modules/hercules/services/certificate-formatter-service';

export enum CertificateRadioType {
  DEFAULT = <any>'default',
  NEW = <any>'new',
}

export class PrivateTrunkCertificateCtrl implements ng.IComponentController {
  public certificateRadio: CertificateRadioType = CertificateRadioType.DEFAULT;
  public certificate: any;
  public file: File;
  public onChangeFn: Function;
  public onDeleteCertFn: Function;
  public onChangeOptionFn: Function;
  public formattedCertList: IformattedCertificate;
  public certLabels: Array<string>;
  public isImporting: boolean = false;
  public isSettings: boolean;
  public certTitle: string;
  public certDesc: string;

  /* @ngInject */
  constructor(
   private $scope: ng.IScope,
   private $translate: ng.translate.ITranslateService,
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

    this.certTitle = (this.isSettings) ?  this.$translate.instant('servicesOverview.cards.privateTrunk.certificateTitleSettings') : this.$translate.instant('servicesOverview.cards.privateTrunk.certificateTitle');
    this.certDesc = (this.isSettings) ?  this.$translate.instant('servicesOverview.cards.privateTrunk.certificateDescSettings') : this.$translate.instant('servicesOverview.cards.privateTrunk.certificateDescription');

  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { formattedCertList, isImporting, isCertificateDefault } = changes;

    if (!_.isUndefined(formattedCertList)) {
      this.setFormattedCertList(formattedCertList.currentValue);
    }

    if (!_.isUndefined(isImporting)) {
      this.isImporting = isImporting.currentValue;
    }
    if (!_.isUndefined(isCertificateDefault)) {
      this.certificateRadio = isCertificateDefault.currentValue ? CertificateRadioType.DEFAULT : CertificateRadioType.NEW;
    }
  }

  public setFormattedCertList(formattedCertList: IformattedCertificate): void {
    this.formattedCertList = _.cloneDeep(formattedCertList);
  }

  public changeOption() {
    this.onChangeOptionFn({
      isCertificateDefault: (this.certificateRadio === CertificateRadioType.DEFAULT),
    });
  }

  public deleteCert(certId: string): void {
    this.onDeleteCertFn({
      certId: certId,
    });
  }

  public onChangeFile(file) {
    this.onChangeFn ({
      file: file,
    });
  }
}

export class PrivateTrunkCertificateComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkCertificateCtrl;
  public templateUrl = 'modules/hercules/private-trunk/private-trunk-certificate/private-trunk-certificate.html';
  public bindings = {
    isSettings: '<',
    formattedCertList: '<',
    isImporting: '<',
    isCertificateDefault: '<',
    onChangeFn: '&',
    onDeleteCertFn: '&',
    onChangeOptionFn: '&',
  };
}
