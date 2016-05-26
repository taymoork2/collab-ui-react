namespace globalsettings {
  export class AuthModeService {

    public enableSSO = 0;

    constructor(private $translate) {

    }
  }
  angular.module('Core')
    .service('AuthModeService', AuthModeService);
}
