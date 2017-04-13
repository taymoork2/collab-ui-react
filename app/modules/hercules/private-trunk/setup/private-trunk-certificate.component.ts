// import { PrivateTrunkResource, Destination } from 'modules/hercules/private-trunk/setup/private-trunk-setup';

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

  /* @ngInject */
  constructor(
   private $scope: ng.IScope,
   ) {

  }

  public $onInit(): void {
    this.$scope.$watch(() => this.file,
    file => this.onChangeFile(file),
    );
  }

  public onChangeFile(file) {
    this.onChangeFn ({
      file: file,
    });
  }
}
export class PrivateTrunkCertificateComponent implements ng.IComponentOptions {
  public controller = PrivateTrunkCertificateCtrl;
  public templateUrl = 'modules/hercules/private-trunk/setup/private-trunk-certificate.html';
  public bindings = {
    onChangeFn: '&',
  };
}
