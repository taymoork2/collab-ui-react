import { CertificateType } from 'modules/core/sso-certificate/shared/sso-certificate.constants';

export class SsoCertificateTypeController implements ng.IComponentController {
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
    this.$state.go('sso-certificate.sso-certificate-download-metadata', {
      isMultiple: this.certificateTypeValue === CertificateType.MULTIPLE,
    });
  }

  public back(): void {
    this.$state.go('sso-certificate.sso-certificate-check');
  }

  public onCertificateTypeValueChanged(): void {
    this.nextDisabled = false;
  }
}

export class SsoCertificateTypeComponent implements ng.IComponentOptions {
  public controller = SsoCertificateTypeController;
  public template = require('./sso-certificate-type.html');
  public bindings = {
    dismiss: '&',
  };
}
