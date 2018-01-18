import { ManageType } from '../userManage.keys';

interface IAdminOrgResponse {
  isOnBoardingEmailSuppressed: boolean;
  licenses: [{ licenseId: string }];
}

export class UserManageEmailSuppressController implements ng.IComponentController {

  public dataLoaded = false;
  public isEmailSuppressed = false;
  public isSparkCallEnabled = false;
  private manageType: string;
  private prevState: string;
  private dismiss: Function;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $stateParams,
    private Analytics,
    private Orgservice,
  ) {
    this.manageType = _.get<string>(this.$stateParams, 'manageType');
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
    switch (this.manageType) {
      case ManageType.MANUAL:
        this.Analytics.trackAddUsers(this.Analytics.eventNames.NEXT, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
        this.$state.go('users.add.manual');
        break;

      case ManageType.BULK:
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.CSV_UPLOAD, this.Analytics.sections.ADD_USERS.uploadMethods.CSV);
        this.$state.go('users.csv');
        break;

      case ManageType.ADVANCED_NO_DS:
        this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.INSTALL_CONNECTOR, this.Analytics.sections.ADD_USERS.uploadMethods.SYNC);
        this.$state.go('users.manage.advanced.add.ob.installConnector');
        break;

      case ManageType.CONVERT:
        this.$state.go('users.convert', {
          manageUsers: true,
        });
        break;

      case ManageType.ADVANCED_DS:
        this.$state.go('users.manage.advanced.add.ob.syncStatus');
        break;
    }
  }
}
