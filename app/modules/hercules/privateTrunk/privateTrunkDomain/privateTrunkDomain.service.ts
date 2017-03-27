import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';

export class PrivateTrunkDomainService {
  private domainModal: IToolkitModalServiceInstance |  undefined;
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
  ) {

  }

  public openModal(): void {
    this.dismissModal();
    this.domainModal = this.$modal.open({
      template: '<private-trunk-domain></private-trunk-domain>',
      type: 'small',
    });
  }

  public dismissModal(): void {
    if (this.domainModal) {
      this.domainModal.dismiss();
      this.domainModal = undefined;
    }
  }

}
