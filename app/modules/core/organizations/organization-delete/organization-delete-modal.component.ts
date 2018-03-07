import { Config } from 'modules/core/config/config';
import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';

class OrganizationDeleteModalController {
  public readonly states = {
    USER_ACTION: 'userAction',
    DELETE_ORG: 'delete',
  };
  public readonly actions = {
    MOVE: 'move',
    DELETE: 'delete',
  };
  public state: string = this.states.USER_ACTION;
  public action: string = this.actions.MOVE;
  public checked: boolean[];
  public deleteLoading = false;
  public orgName: string = this.Authinfo.getOrgName();
  public l10nTitle;
  private href = 'http://www.webex.com';
  public allChecked = false;
  public checkBoxText;
  // TODO support all enterprise use cases
  private checkBoxTextList = {
    onlineSingleUserMove: [
      'singleUserMove',
      'allData',
      'notReversible',
    ],
    onlineSingleUserDelete: [
      'singleUserDelete',
      'allData',
      'notReversible',
    ],
    onlineMultiUserMove: [
      'multiUserMove',
      'allData',
      'notReversible',
    ],
    onlineMultiUserDelete: [
      'multiUserDelete',
      'allData',
      'notReversible',
    ],
    enterprise: [
      'allUsers',
      'allData',
      'allDevices',
      'notReversible',
      'customerPermission',
    ],
  };

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private Analytics,
    private Auth,
    private Authinfo,
    private Config: Config,
    private Notification: Notification,
    private Orgservice,
    private UrlConfig,
  ) {}

  public dismiss: Function;
  private userCount: Number;
  private customerType = this.Authinfo.isOnlineCustomer()
    ? this.Config.customerTypes.online
    : this.Config.customerTypes.enterprise;

  public checkboxesChanged(): void {
    this.allChecked = _.every(this.checked, v => v);
  }

  public continue(): void {
    this.getUserCount().then((count) => {
      this.userCount = count;
      if (this.customerType === this.Config.customerTypes.online) {
        if (this.action === this.actions.MOVE) {
          if (this.userCount === 1) {
            this.checkBoxText = this.checkBoxTextList.onlineSingleUserMove;
          } else {
            this.checkBoxText = this.checkBoxTextList.onlineMultiUserMove;
          }
        } else {
          if (this.userCount === 1) {
            this.checkBoxText = this.checkBoxTextList.onlineSingleUserDelete;
          } else {
            this.checkBoxText = this.checkBoxTextList.onlineMultiUserDelete;
          }
        }
      } else {
        // TODO handle all enterprise cases
        this.checkBoxText = this.checkBoxTextList.enterprise;
      }
      this.checked = _.fill(Array(this.checkBoxText.length), false);
      this.state = this.states.DELETE_ORG;
    });
  }

  public close(): void {
    this.dismiss();
  }

  public back(): void {
    this.state = this.states.USER_ACTION;
  }

  public deleteOrg(): void {
    this.deleteLoading = true;
    const orgId = this.Authinfo.getOrgId();
    this.Orgservice.deleteOrg(orgId, this.action === this.actions.DELETE)
      .then(() => {
        this.customerType = this.Authinfo.isOnlineCustomer()
          ? this.Config.customerTypes.online
          : this.Config.customerTypes.enterprise;
        this.Analytics.trackEvent(this.Analytics.sections.ORGANIZATION.eventNames.DELETE, {
          organizationId: orgId,
          customerType: this.customerType,
        });
        this.dismiss();
        this.openAccountClosedModal();
      }).catch((error) => {
        this.deleteLoading = false;
        this.Notification.errorResponse(error, 'organizationDeleteModal.deleteOrgError', {
          orgName: this.Authinfo.getOrgName(),
        });
      });
  }

  public openAccountClosedModal(): void {
    this.$modal.open({
      template: require('./organization-delete-dismiss.html'),
      controller: () => {
        return {
          getHref: () => {
            return this.href;
          },
          logout: () => {
            this.dismiss();
            this.Auth.logout();
          },
        };
      },
      controllerAs: '$ctrl',
      backdrop: 'static',
      keyboard: false,
      type: 'dialog',
    });
  }

  private getUserCount(): ng.IPromise<number> {
    return this.$http.get(`${this.UrlConfig.getAdminServiceUrl()}organizations/${this.Authinfo.getOrgId()}/users`)
      .then(response => _.get(response.data, 'totalResults', 1));
  }
}

export class OrganizationDeleteComponent implements ng.IComponentOptions {
  public controller = OrganizationDeleteModalController;
  public template = require('./organization-delete-modal.html');

  public bindings = {
    dismiss: '&',
    l10nTitle: '@',
  };
}
