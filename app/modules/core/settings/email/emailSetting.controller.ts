export class EmailSettingController {

  public ssoStatusLoaded: boolean = false;
  public isEmailSuppressed: boolean = false;
  public isEmailSuppressDisabled: boolean = false;

  /* @ngInject */
  constructor(
    private Orgservice,
    private Notification,
  ) {
    const params = {
      basicInfo: true,
      disableCache: true,
    };
    this.Orgservice.getAdminOrg(this.getAdminOrgHandler.bind(this), null, params);
    this.Orgservice.getAdminOrgAsPromise().then((response: ng.IHttpResponse<{ success: boolean, ssoEnabled: boolean, isOnBoardingEmailSuppressed: boolean }>) => {
      this.getAdminOrgHandler(response.data);
    });
  }

  private getAdminOrgHandler(data: { success: boolean, ssoEnabled: boolean, isOnBoardingEmailSuppressed: boolean }) {
    if (data.success) {
      const ssoEnabled: boolean = data.ssoEnabled || false;
      const isOnBoardingEmailSuppressed: boolean = data.isOnBoardingEmailSuppressed || false;
      this.ssoStatusLoaded = true;
      this.isEmailSuppressed = isOnBoardingEmailSuppressed;
      this.isEmailSuppressDisabled = !ssoEnabled;
    }
  }

  public onChange(toggleValue: boolean) {
    this.Orgservice.setOrgEmailSuppress(toggleValue)
      .catch((response) => {
        this.Notification.errorResponse(response, 'globalSettings.email.setEmailSuppressFailed');
        this.isEmailSuppressed = !toggleValue;
      });
  }
}
