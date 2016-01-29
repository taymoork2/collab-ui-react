namespace domainManagement {

  class DomainManageVerifyCtrl {
    private _domain;
    private _loggedOnUser;
    private _error;

    /* @ngInject */
    constructor(private $state, private DomainManagementService, $translate) {
      this._domain = $state.params.domain;
      this._loggedOnUser = $state.params.loggedOnUser;

      //if any domain is already verified, it is safe to verify more:
      if (DomainManagementService.domainList.length == 0
        || _.all(DomainManagementService.domainList, {status: DomainManagementService.states.pending})){

        //No domains have been verified (list empty or all pending). Only allow logged on user's domain:
        if (this.domainName != this._loggedOnUser.domain)
          this._error = $translate.instant('domainManagement.verify.preventLockoutError', { domain: this._loggedOnUser.domain});
      }
    }

    get domainName() {
      return this._domain && this._domain.text;
    }

    get domain() {
      return this._domain;
    }

    get error() {
      return this._error;
    }

    get operationAllowed() {
      //input validation:
      if (!(this.domainName && this._loggedOnUser && this._loggedOnUser.isLoaded))
        return false;

      if (this._error)
        return false;

      return true;
    }

    public verify() {
      this.DomainManagementService.verifyDomain(this._domain.text).then(res => {
        this.$state.go('domainmanagement');
      }, err => {
        this._error = err;
      });
    }
  }
  angular
    .module('Core')
    .controller('DomainManageVerifyCtrl', DomainManageVerifyCtrl);
}
