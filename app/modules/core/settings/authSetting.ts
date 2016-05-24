/// <reference path="Setting.ts"/>
/// <reference path="authentication/authMode.service.ts"/>
namespace globalsettings {

  export class AuthSetting extends Setting {

    public authModeService:AuthModeService;

    constructor(ctrl:SettingsController, authModeService:AuthModeService) {
      super('authentication', ctrl);
      this.subsectionDescription = '';
      this.authModeService = authModeService;
    }

    public configureSSOOptions = [{
      label: this.translate.instant('ssoModal.disableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoNoProvider'
    }, {
      label: this.translate.instant('ssoModal.enableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoProvider'
    }];
  }
}
