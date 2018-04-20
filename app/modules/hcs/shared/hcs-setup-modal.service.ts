import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';

export enum HcsSetupModalSelect {
  FirstTimeSetup = 0,
  AgentInstallFileSetup = 1,
  SftpServerSetup = 2,
  SoftwareProfileSetup = 3,
}

export class HcsSetupModalService {
  private modal: IToolkitModalServiceInstance |  undefined;
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) {}

  public openSetupModal(isFirstTimeSetup: boolean, currentStepIndex: HcsSetupModalSelect): void {
    this.dismissModal();
    this.modal = this.$modal.open({
      template: `<hcs-setup-modal class="modal-content" is-first-time-setup="${isFirstTimeSetup}" current-step-index="${currentStepIndex}"></hcs-setup-modal>`,
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
