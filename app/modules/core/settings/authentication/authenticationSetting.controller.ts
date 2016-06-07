namespace globalsettings {
  export class AuthenticationSettingController {

    public ssoStatusLoaded = false;
    public ssoEnabled:boolean = false;
    public ssoStatusText:string;

    /* @ngInject */
    constructor(private $state, Orgservice) {
      Orgservice.getAdminOrg(this.getAdminOrgHandler.bind(this));
    }

    private getAdminOrgHandler(data: {success:boolean, ssoEnabled:boolean}){
        if (data.success) {
          this.setSSOStatus(data.ssoEnabled || false);
        }
    }

    private setSSOStatus(ssoEnabled:boolean){
      this.ssoEnabled = ssoEnabled;
      this.ssoStatusLoaded = true;
      this.ssoStatusText = `ssoModal.${this.ssoEnabled?'ssoEnabledStatus':'ssoNotEnabledStatus'}`;
    }

    public modifySSO() {
      this.$state.go('setupwizardmodal', {
        currentTab: 'enterpriseSettings',
        onlyShowSingleTab: true
      });
    }
  }
  angular.module('Core')
    .controller('AuthenticationSettingController', AuthenticationSettingController);
}
