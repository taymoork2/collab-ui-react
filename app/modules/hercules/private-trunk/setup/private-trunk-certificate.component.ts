import { IformattedCertificate, ICertificateFileNameIdMap } from 'modules/hercules/services/certificate-formatter-service';

export enum CertificateRadioType {
  DEFAULT = <any>'default',
  NEW = <any>'new',
}

export class PrivateTrunkCertificateCtrl implements ng.IComponentController {
  public certificateRadio: CertificateRadioType = CertificateRadioType.DEFAULT;
  public certificate: any;
  public file: File;
  public fileName: string = '';
  public onChangeFn: Function;
  public onDeleteCertFn: Function;
  public formattedCertList: IformattedCertificate;
  public certLabels: Array<string>;
  public certFileNameIdMap: Array<ICertificateFileNameIdMap> = [];
  public isImporting: boolean = false;


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
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject }): void {
    const { formattedCertList, certFileNameIdMap, isImporting } = changes;

    if (!_.isUndefined(formattedCertList)) {
      this.setFormattedCertList(formattedCertList.currentValue);
    }
    if (!_.isUndefined(certFileNameIdMap)) {
      this.setCertFileNameIdMap(certFileNameIdMap.currentValue);
    }
    if (!_.isUndefined(isImporting)) {
      this.isImporting = isImporting.currentValue;
    }
  }

  public setFormattedCertList(formattedCertList: IformattedCertificate): void {
    this.formattedCertList = _.cloneDeep(formattedCertList);
  }

  public setCertFileNameIdMap(certFileNameIdMap: Array<ICertificateFileNameIdMap>): void {
    this.certFileNameIdMap = _.cloneDeep(certFileNameIdMap);
  }

  public getFileName(certId: string): any {
    return _.get(_.find(this.certFileNameIdMap, { certId: certId }), 'fileName', '');
  }

  public deleteCert(certId: string): void {
    this.onDeleteCertFn({
      certId: certId,
    });
  }

  public onChangeFile(file) {
    this.onChangeFn ({
      file: file,
      fileName: this.fileName,
    });
  }
}

export class PrivateTrunkCertificateComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkCertificateCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-certificate.html';
  public bindings = {
    formattedCertList: '<',
    certFileNameIdMap: '<',
    isImporting: '<',
    onChangeFn: '&',
    onDeleteCertFn: '&',
  };
}
