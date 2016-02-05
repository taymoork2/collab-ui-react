namespace domainManagement {

  class DomainManageInstructionsCtrl {
    private _domain;
    private _email;
    private _loggedOnUser;

    /* @ngInject */
    constructor($stateParams, private $previousState) {
      this._domain = $stateParams.domain;
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._email = this._loggedOnUser.email;
    }

    public cancel() {
      this.$previousState.go();
    }

    public get domain(){
      return this._domain;
    }
  }
  angular
    .module('Core')
    .controller('DomainManageInstructionsCtrl', DomainManageInstructionsCtrl);
}
