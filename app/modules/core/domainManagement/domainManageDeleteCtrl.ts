namespace domainManagement {

  class DomainManageDeleteCtrl {
    private _domainToDelete;
    private _loggedOnUser;
    private _error;

    /* @ngInject */
    constructor($stateParams, $translate, private $state, private $previousState, private DomainManagementService) {
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._domainToDelete = $stateParams.domain;

      if (!this._loggedOnUser.isPartner && (this._domainToDelete.status != DomainManagementService.states.pending && this._loggedOnUser.domain == this._domainToDelete.text)) {
        this._error = $translate.instant('domainManagement.delete.preventLockoutError');
      }

      if (this.isValid && this._domainToDelete.status === DomainManagementService.states.pending) {
        //Just delete it without confirmation!
        this.deleteDomain();
      }
    }

    public deleteDomain() {
      if (this._domainToDelete.status === this.DomainManagementService.states.verified) {
        this.DomainManagementService.unverifyDomain(this._domainToDelete.text).then(
          () => {
            this.$previousState.go();
          },
          err => {
            this._error = err;
          }
        );
      } else {
        this.DomainManagementService.unclaimDomain(this._domainToDelete.text).then(
          () => {
            this.$previousState.go();
          },
          err => {
            this._error = err;
          }
        );
      }
    }

    public cancel() {
      this.$previousState.go();
    }

    get domain() {
      return this._domainToDelete && this._domainToDelete.text;
    }

    get error() {
      return this._error;
    }

    get isValid() {
      return this.domain && this._loggedOnUser && this._loggedOnUser.isLoaded && !this._error;
    }
  }

  angular
    .module('Core')
    .controller('DomainManageDeleteCtrl', DomainManageDeleteCtrl);
}
