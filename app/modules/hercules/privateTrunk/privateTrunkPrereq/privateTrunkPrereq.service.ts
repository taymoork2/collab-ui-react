import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';
import { DomainManagementService } from 'modules/core/domainManagement/domainmanagement.service';

export class PrivateTrunkPrereqService {
  private domainModal: IToolkitModalServiceInstance |  undefined;
  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private DomainManagementService: DomainManagementService,
  ) {

  }

  public openModal(): void {
    this.dismissModal();
    this.domainModal = this.$modal.open({
      template: '<private-trunk-prereq></private-trunk-prereq>',
      type: 'small',
    });
  }

  public openSetupModal(): void {
    this.dismissModal();
    this.domainModal = this.$modal.open({
      template: '<private-trunk-setup class="modal-content"></private-trunk-setup>',
      type: 'small',
    });
  }

  public dismissModal(): void {
    if (this.domainModal) {
      this.domainModal.dismiss();
      this.domainModal = undefined;
    }
  }

  public getVerifiedDomains(): ng.IPromise<Array<any>> {
    return this.DomainManagementService.getVerifiedDomains().then(domains => {
      return _.chain(domains)
        .filter({ status : 'pending' })
        .map('text')
        .value();
    });
  }

}
