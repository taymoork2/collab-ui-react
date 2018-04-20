export class AuthenticationSettingController {

  public ssoStatusLoaded = false;
  public ssoEnabled: boolean = false;
  public ssoStatus: string;
  public ssoStatusText: string;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $q: ng.IQService,
    private Orgservice,
  ) {
    const params = {
      basicInfo: true,
      disableCache: true,
    };
    this.$q.resolve(this.Orgservice.getAdminOrg(this.getAdminOrgHandler.bind(this), null, params)).catch(_.noop);
  }

  private getAdminOrgHandler(data: { success: boolean, ssoEnabled: boolean }) {
    if (data.success) {
      this.setSSOStatus(data.ssoEnabled || false);
    }
  }

  private setSSOStatus(ssoEnabled: boolean) {
    this.ssoEnabled = ssoEnabled;
    this.ssoStatus = ssoEnabled ? 'success' : 'disabled';
    this.ssoStatusLoaded = true;
    this.ssoStatusText = `common.${this.ssoEnabled ? 'enabled' : 'disabled'}`;
  }

  public modifySSO() {
    this.$state.go('setupwizardmodal', {
      currentTab: 'enterpriseSettings',
      currentStep: 'init',
      onlyShowSingleTab: true,
      showStandardModal: true,
    });
  }
}
