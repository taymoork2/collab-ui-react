import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';

export class OrganizationDeleteService {
  private deleteModal: IToolkitModalServiceInstance;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private Authinfo,
    private DirSyncService,
    private FeatureToggleService,
  ) {}

  public canOnlineOrgBeDeleted(): ng.IPromise<boolean> {
    return (this.FeatureToggleService.atlasOnlineDeleteOrgGetStatus() as ng.IPromise<boolean>)
      .then(toggle => {
        if (!toggle || !this.Authinfo.isOnlineOnlyCustomer() || this.Authinfo.isOnlinePaid()) {
          return false;
        }
        return this.DirSyncService.refreshStatus()
        .then(() => {
          return !this.DirSyncService.isDirSyncEnabled();
        }).catch(() => {
          return false;
        });
      });
  }

  public openOrgDeleteModal(l10nTitle = 'organizationDeleteModal.title.deleteAccount'): void {
    this.dismissOrgDeleteModal();
    this.deleteModal = this.$modal.open({
      template: `<organization-delete-modal dismiss="$dismiss()" l10n-title="${l10nTitle}"></organization-delete-modal>`,
      backdrop: 'static',
      keyboard: false,
    });
  }

  public dismissOrgDeleteModal(): void {
    if (this.deleteModal) {
      this.deleteModal.dismiss();
    }
  }
}

