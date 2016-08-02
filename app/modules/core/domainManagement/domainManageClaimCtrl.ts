namespace domainManagement {

  class DomainManageClaimCtrl {
    private _domain;
    private _loggedOnUser;
    private _error;

    /* @ngInject */
    constructor(private $state, private $previousState, private DomainManagementService) {
      this._domain = $state.params.domain;
      this._loggedOnUser = $state.params.loggedOnUser;
    }

    get domainName() {
      return this._domain && this._domain.text;
    }

    get error() {
      return this._error;
    }

    get operationAllowed() {
      //input validation:
      if (!(this.domainName && this._loggedOnUser && this._loggedOnUser.isLoaded)) {
        return false;
      }

      return !this._error;
    }

    public claim() {
      this.DomainManagementService.claimDomain(this._domain.text).then(res => {
          this.$previousState.go();
        },
        err => {
          this._error = err;
        });
    }

    public cancel() {
      this.$previousState.go();
    }
  }
  angular
    .module('Core')
    .controller('DomainManageClaimCtrl', DomainManageClaimCtrl);
}
