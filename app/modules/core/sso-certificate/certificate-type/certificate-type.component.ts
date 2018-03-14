import { CertificateType } from '../sso-certificate.constants';

export class CertificateTypeController implements ng.IComponentController {
  public dismiss: Function;
  public nextDisabled = true;
  public certificateTypeValue = CertificateType.NEITHER;
  public certificateType = CertificateType;

  public dismissModal(): void {
    this.dismiss();
  }

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
  ) {}

  public next(): void {
    // TO-DO go to next dialog
  }

  public back(): void {
    this.$state.go('sso-certificate.check-certificate');
  }

  public onCertificateTypeValueChanged(): void {
    this.nextDisabled = false;
  }
}

export class CertificateTypeComponent implements ng.IComponentOptions {
  public controller = CertificateTypeController;
  public template = require('./certificate-type.html');
  public bindings = {
    dismiss: '&',
  };
}
