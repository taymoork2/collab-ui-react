import { ManageType } from '../userManage.keys';
import { UserManageService } from '../shared/user-manage.service';

interface IAdminOrgResponse {
  isOnBoardingEmailSuppressed: boolean;
  licenses: [{ licenseId: string }];
}

export class UserManageEmailSuppressController implements ng.IComponentController {

  public dataLoaded = false;
  public isEmailSuppressed = false;
  public isSparkCallEnabled = false;
  private manageType: ManageType;
  private prevState: string;
  private dismiss: Function;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams,
    private Analytics,
    private Orgservice,
    private UserManageService: UserManageService,
  ) {
    this.manageType = _.get<ManageType>(this.$stateParams, 'manageType');
    this.prevState = _.get<string>(this.$stateParams, 'prevState');
  }

  public $onInit(): void {
    const params = {
      basicInfo: true,
    };
    this.Orgservice.getAdminOrgAsPromise(null, params).then((response: ng.IHttpResponse<IAdminOrgResponse>) => {
      // Check isEmailSuppressed status
      const isOnBoardingEmailSuppressed = response.data.isOnBoardingEmailSuppressed || false;
      this.isEmailSuppressed = isOnBoardingEmailSuppressed;

      // Check isSparkCallEnabled status
      this.isSparkCallEnabled = _.some(response.data.licenses, function (license) {
        return _.startsWith(license.licenseId, 'CO_');
      });
      this.dataLoaded = true;
    });
  }

  public cancelModal(): void {
    this.dismiss();
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
  }

  public onBack(): void {
    this.$state.go(this.prevState);
  }

  public onNext(): void {
    this.UserManageService.gotoNextStateForManageTypeAfterEmailSuppress(this.manageType);
  }
}
