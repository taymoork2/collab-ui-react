interface IAdminOrgResponse {
  ssoEnabled: boolean;
  isOnBoardingEmailSuppressed: boolean;
}

export class EmailSettingController {

  public ssoStatusLoaded = false;
  public isEmailSuppressed = false;
  public isEmailSuppressDisabled = false;

  /* @ngInject */
  constructor(
    private Orgservice,
    private Notification,
  ) {
    const params = {
      basicInfo: true,
      disableCache: true,
    };
    this.Orgservice.getAdminOrgAsPromise(null, params).then((response: ng.IHttpResponse<IAdminOrgResponse>) => {
      this.getAdminOrgHandler(response.data);
    }).catch(_.noop);
  }

  private getAdminOrgHandler(data: IAdminOrgResponse) {
    const ssoEnabled = data.ssoEnabled || false;
    const isOnBoardingEmailSuppressed = data.isOnBoardingEmailSuppressed || false;
    this.ssoStatusLoaded = true;
    this.isEmailSuppressed = isOnBoardingEmailSuppressed;
    this.isEmailSuppressDisabled = !ssoEnabled;
  }

  public onChange(toggleValue: boolean) {
    this.Orgservice.setOrgEmailSuppress(toggleValue)
      .catch((response) => {
        this.Notification.errorResponse(response, 'globalSettings.email.setEmailSuppressFailed');
        this.isEmailSuppressed = !toggleValue;
      });
  }
}
