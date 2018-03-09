import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class CheckCertificateController implements ng.IComponentController {
  public dismiss: Function;
  public nextRemoved = false;
  public nextDisabled = true;
  public submitRemoved = true;
  public certificateType = '';

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
  ) {}

  public dismissModal(): void {
    this.dismiss();
  }

  public next(): void {
    this.$state.go('sso-certificate.certificate-type');
  }

  public submit(): void {
    const options = <IToolkitModalSettings>{
      type: 'dialog',
      hideTitle: true,
      message: this.$translate.instant('ssoCertificateModal.noActionConfirmation'),
      dismiss: this.$translate.instant('common.yes'),
      close: this.$translate.instant('common.no'),
    };
    this.ModalService.open(options).result
      .then(() => {
        _.noop();
      }, () => {
        // TO-DO update with the latest certificate
        this.dismiss();
      });
  }

  public onCertificateTypeChanged(type: String): void {
    if (type === 'SIGNING') {
      this.submitRemoved = true;
      this.nextDisabled = false;
      this.nextRemoved = false;
    } else if (type === 'NONE') {
      this.nextRemoved = true;
      this.submitRemoved = false;
    }
  }
}

export class CheckCertificateComponent implements ng.IComponentOptions {
  public controller = CheckCertificateController;
  public template = require('./check-certificate.html');
  public bindings = {
    dismiss: '&',
  };
}
