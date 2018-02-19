import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';

export class OrganizationDeleteService {
  private deleteModal: IToolkitModalServiceInstance;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private FeatureToggleService,
  ) {}

  public canOnlineOrgBeDeleted(): ng.IPromise<boolean> {
    return (this.FeatureToggleService.atlasOnlineDeleteOrgGetStatus() as ng.IPromise<boolean>)
      .then(toggle => {
        if (!toggle) {
          return false;
        }
        return this.Authinfo.isOnlineOnlyCustomer() && !this.Authinfo.isOnlinePaid();
      });
  }

  public openOrgDeleteModal(title = this.$translate.instant('organizationDeleteModal.confirmTitle'),
                            body = this.$translate.instant('organizationDeleteModal.confirmBody')): void {
    this.dismissOrgDeleteModal();
    this.deleteModal = this.$modal.open({
      template: `<organization-delete-modal dismiss="$dismiss()" title="${title}" body="${body}"></organization-delete-modal>`,
      backdrop: 'static',
      keyboard: false,
      type: 'dialog',
    });
  }

  public dismissOrgDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.dismiss();
    }
  }
}

