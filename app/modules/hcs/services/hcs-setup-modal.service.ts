import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';

export class HcsSetupModalService {
  private modal: IToolkitModalServiceInstance |  undefined;
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) {}

  public openSetupModal(): void {
    this.dismissModal();
    this.modal = this.$modal.open({
      template: '<hcs-setup-modal class="modal-content"></hcs-setup-modal>',
      type: 'full',
      keyboard: false,
    });
  }

  public dismissModal(): void {
    if (this.modal) {
      this.modal.dismiss();
      this.modal = undefined;
    }
  }
}
