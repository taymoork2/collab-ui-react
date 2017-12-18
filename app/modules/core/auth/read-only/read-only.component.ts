import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class ReadonlyController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
    private Authinfo,
  ) {
  }

  public $onInit(): void {
    if (this.Authinfo.isReadOnlyAdmin() || this.Authinfo.isPartnerReadOnlyAdmin()) {
      const options = <IToolkitModalSettings>{
        type: 'dialog',
        title: this.$translate.instant('readOnlyModal.title'),
        message: this.$translate.instant('readOnlyModal.message'),
        close: this.$translate.instant('common.ok'),
        hideDismiss: true,
      };
      this.ModalService.open(options);
    }
  }
}

export class ReadonlyComponent implements ng.IComponentOptions {
  public controller = ReadonlyController;
}
