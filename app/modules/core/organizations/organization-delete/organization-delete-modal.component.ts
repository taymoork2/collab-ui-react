import { Config } from 'modules/core/config/config';
import { Notification } from 'modules/core/notifications';

class OrganizationDeleteModalController {
  public deleteLoading = false;
  public orgName: string = this.Authinfo.getOrgName();
  public closeButtonText: string = this.$translate.instant('organizationDeleteModal.goBack');
  public states = {
    DELETING: 'deleting',
    COMPLETE: 'complete',
  };
  public state = this.states.DELETING;
  public href = 'www.webex.com';

  /* @ngInject */
  constructor(
    private $translate,
    private Analytics,
    private Auth,
    private Authinfo,
    private Config: Config,
    private Notification: Notification,
    private Orgservice,
  ) {}

  public dismiss: Function;
  public title: string;
  public body: string;

  public close(): void {
    if (this.state === this.states.DELETING) {
      this.dismiss();
    } else if (this.state === this.states.COMPLETE) {
      this.Auth.logout();
    }
  }

  public deleteOrg(): void {
    this.deleteLoading = true;
    const orgId = this.Authinfo.getOrgId();
    this.Orgservice.deleteOrg(orgId)
      .then(() => {
        const customerType = this.Authinfo.isOnlineCustomer() ? this.Config.customerTypes.online : this.Config.customerTypes.enterprise;
        this.Analytics.trackEvent(this.Analytics.sections.ORGANIZATION.eventNames.DELETE, {
          organizationId: orgId,
          customerType: customerType,
        });
        this.title = this.$translate.instant('organizationDeleteModal.accountClosedTitle');
        this.closeButtonText = this.$translate.instant('common.dismiss');
        this.state = this.states.COMPLETE;
      }).catch((error) => {
        this.deleteLoading = false;
        this.Notification.errorResponse(error, 'organizationDeleteModal.deleteOrgError', {
          orgName: this.Authinfo.getOrgName(),
        });
      });
  }
}

export class OrganizationDeleteComponent implements ng.IComponentOptions {
  public controller = OrganizationDeleteModalController;
  public template = require('./organization-delete-modal.html');

  public bindings = {
    dismiss: '&',
    title: '@',
    body: '@',
  };
}
