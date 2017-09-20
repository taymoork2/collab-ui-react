import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';
import { DomainManagementService } from 'modules/core/domainManagement/domainmanagement.service';

export class PrivateTrunkPrereqService {
  private domainModal: IToolkitModalServiceInstance |  undefined;
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private DomainManagementService: DomainManagementService,
  ) {}

  public openPreReqModal(): void {
    this.dismissModal();
    this.domainModal = this.$modal.open({
      template: '<private-trunk-prereq class="modal-content"></private-trunk-prereq>',
      type: 'full',
    });
  }

  public openSetupModal(): void {
    this.dismissModal();
    this.domainModal = this.$modal.open({
      template: '<private-trunk-setup class="modal-content"></private-trunk-setup>',
      type: 'full',
      keyboard: false,
    });
  }

  public dismissModal(): void {
    if (this.domainModal) {
      this.domainModal.dismiss();
      this.domainModal = undefined;
    }
  }

  public getVerifiedDomains(): ng.IPromise<string[]> {
    return this.DomainManagementService.getVerifiedDomains()
      .then(domains => {
        return _.chain(domains)
          .filter(domain => domain.status === 'claimed' || domain.status === 'verified')
          .map<string>('text')
          .value();
      });
  }
}
