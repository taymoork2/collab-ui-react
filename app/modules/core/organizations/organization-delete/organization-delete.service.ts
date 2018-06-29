import { IToolkitModalService, IToolkitModalServiceInstance } from 'modules/core/modal';
import { OrgDeleteStatus, IOrgDeleteResponse } from 'modules/core/shared/org-service/org-service.types';
import { WaitingIntervalService } from 'modules/core/shared/waiting-interval/waiting-interval.service';

export class OrganizationDeleteService {
  private deleteModal: IToolkitModalServiceInstance;
  private intervalPromise: ng.IPromise<void>;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private Auth,
    private Authinfo,
    private DirSyncService,
    private FeatureToggleService,
    private Orgservice,
    private WaitingIntervalService: WaitingIntervalService,
  ) {}

  public cancelDeleteVerify() {
    this.WaitingIntervalService.cancel(this.intervalPromise);
  }

  public canOnlineOrgBeDeleted(): ng.IPromise<boolean> {
    return (this.FeatureToggleService.atlasOnlineDeleteOrgGetStatus() as ng.IPromise<boolean>)
      .then(toggle => {
        if (!toggle || _.isEmpty(this.Authinfo.getCustomerAccounts()) || !this.Authinfo.isOnlineOnlyCustomer() || this.Authinfo.isOnlinePaid()) {
          return false;
        }
        const dirSyncPromise = (this.DirSyncService.requiresRefresh() ? this.DirSyncService.refreshStatus() : this.$q.resolve());
        return dirSyncPromise
          .then(() => {
            return !this.DirSyncService.isDirSyncEnabled();
          }).catch(() => {
            return false;
          });
      });
  }

  public deleteOrg(orgId: string, deleteUsers = false): ng.IPromise<string> {
    return this.Orgservice.deleteOrg(orgId, deleteUsers)
      .then((data: IOrgDeleteResponse) => {
        return data.location;
      });
  }

  public getDeleteStatus(statusUrl: string, clientAccessToken: string): ng.IPromise<OrgDeleteStatus> {
    return this.Orgservice.getDeleteStatus(statusUrl, clientAccessToken);
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

  public verifyOrgDelete(statusUrl: string): ng.IPromise<void> {
    return this.Auth.getClientAccessToken()
      .then((clientAccessToken) => {
        return this.$q((resolve, reject) => {
          // Try to get delete status for 30 seconds, else fail status check
          this.intervalPromise = this.WaitingIntervalService
            .interval(() => {
              return this.getDeleteStatus(statusUrl, clientAccessToken)
                .then((status) => {
                  if (status === OrgDeleteStatus.COMPLETE) {
                    this.cancelDeleteVerify();
                    resolve();
                  } else if (status === OrgDeleteStatus.FAILED) {
                    this.cancelDeleteVerify();
                    reject(OrgDeleteStatus.FAILED);
                  }
                })
                .catch(error => {
                  this.cancelDeleteVerify();
                  reject(error);
                });
            }, 1500, 20);

          this.intervalPromise.finally(() => {
            // If status not resolved or rejected by now, assume delete failure
            reject();
          });
        });
      });
  }

}
