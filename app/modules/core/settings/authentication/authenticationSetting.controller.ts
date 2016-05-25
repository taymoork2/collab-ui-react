namespace globalsettings {
  export class AuthenticationSettingController {

    public enableSSO = 0;

    /* @ngInject */
    constructor(private $translate) {
    }

    public configureSSOOptions = [{
      label: this.$translate.instant('ssoModal.disableSSO'),
      value: 0,
      name: 'ssoOptions',
      id: 'ssoNoProvider'
    }, {
      label: this.$translate.instant('ssoModal.enableSSO'),
      value: 1,
      name: 'ssoOptions',
      id: 'ssoProvider'
    }];
  }
  angular.module('Core')
    .controller('AuthenticationSettingController', AuthenticationSettingController);
}
