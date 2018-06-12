import { Config } from 'modules/core/config/config';
import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { OrganizationDeleteService } from 'modules/core/organizations/organization-delete/organization-delete.service';

class OrganizationDeleteModalController {
  public readonly states = {
    USER_ACTION: 'userAction',
    DELETE_ORG: 'delete',
  };
  public readonly actions = {
    MOVE: 'Move',
    DELETE: 'Delete',
  };
  public state: string = this.states.USER_ACTION;
  public action: string = this.actions.MOVE;
  public checked: boolean[];
  public deleteLoading = false;
  public orgName: string = this.Authinfo.getOrgName();
  public orgId: string = this.Authinfo.getOrgId();
  public l10nTitle;
  private href = 'http://www.webex.com';
  public allChecked = false;
  public moveOrDeleteLabel: string;
  public checkBoxText;
  // TODO support all enterprise use cases
  private checkBoxTextList = {
    onlineSingleUserMove: [
      'notReversible',
      'allData',
      'singleUserMove',
    ],
    onlineSingleUserDelete: [
      'notReversible',
      'allData',
    ],
    onlineMultiUserMove: [
      'notReversible',
      'allData',
      'multiUserMove',
    ],
    onlineMultiUserDelete: [
      'notReversible',
      'multiUserDelete',
    ],
    enterprise: [
      'notReversible',
      'allUsers',
      'allDevices',
      'customerPermission',
    ],
  };

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private Auth,
    private Authinfo,
    private Config: Config,
    private Notification: Notification,
    private OrganizationDeleteService: OrganizationDeleteService,
    private UrlConfig,
  ) {}

  public dismiss: Function;
  private userCount: Number;
  private customerType = this.Authinfo.isOnlineCustomer()
    ? this.Config.customerTypes.online
    : this.Config.customerTypes.enterprise;

  public $onInit() {
    this.getUserCount().then((count) => {
      this.userCount = count;
      if (this.userCount === 1) {
        this.moveOrDeleteLabel = this.$translate.instant('organizationDeleteModal.singleMoveOrDelete');
      } else {
        this.moveOrDeleteLabel = this.$translate.instant('organizationDeleteModal.multMoveOrDelete');
      }
    });
  }

  public $onDestroy() {
    this.OrganizationDeleteService.cancelDeleteVerify();
  }

  public checkboxesChanged(): void {
    this.allChecked = _.every(this.checked, v => v);
  }

  public continue(): void {
    if (this.customerType === this.Config.customerTypes.online) {
      if (this.userCount === 1) {
        if (this.action === this.actions.MOVE) {
          this.checkBoxText = this.checkBoxTextList.onlineSingleUserMove;
        } else {
          this.checkBoxText = this.checkBoxTextList.onlineSingleUserDelete;
        }
      } else {
        if (this.action === this.actions.MOVE) {
          this.checkBoxText = this.checkBoxTextList.onlineMultiUserMove;
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
  }

  public close(): void {
    this.dismiss();
  }

  public back(): void {
    this.state = this.states.USER_ACTION;
  }

  public deleteOrg(): void {
    this.deleteLoading = true;
    const deleteUsers = this.action === this.actions.DELETE;

    this.OrganizationDeleteService.deleteOrg(this.orgId, deleteUsers)
      .then(statusUrl => this.OrganizationDeleteService.verifyOrgDelete(statusUrl))
      .then(() => this.deleteOrgSuccess())
      .catch(error => this.notifyDeleteError(error));
  }

  private deleteOrgSuccess(): void {
    this.deleteLoading = false;
    this.customerType = this.Authinfo.isOnlineCustomer()
      ? this.Config.customerTypes.online
      : this.Config.customerTypes.enterprise;
    this.Analytics.trackEvent(this.Analytics.sections.ORGANIZATION.eventNames.DELETE, {
      organizationId: this.orgId,
      customerType: this.customerType,
      deleteType: this.action,
    });
    this.dismiss();
    this.openAccountClosedModal();
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

  private notifyDeleteError(error) {
    this.deleteLoading = false;
    this.Notification.errorResponse(error, 'organizationDeleteModal.deleteOrgError', {
      orgName: this.orgName,
    });
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
