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
      template: '<hcs-setup-modal class="modal-content" is-first-time-setup="true"></hcs-setup-modal>',
      type: 'full',
      keyboard: false,
    });
  }

  public openAgentInstallFileModal(): void {
    this.dismissModal();
    this.modal = this.$modal.open({
      template: '<hcs-setup-modal class="modal-content" is-first-time-setup="false" current-step-index="1"></hcs-setup-modal>',
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
