namespace domainManagement {

  class DomainManageDeleteCtrl {
    private _domainToDelete;
    private _loggedOnUser;
    private _error;

    /* @ngInject */
    constructor($stateParams, private $state, private DomainManagementService) {
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._domainToDelete = $stateParams.domain;

      if (!this._loggedOnUser.isPartner && (this._domainToDelete.status != DomainManagementService.states.pending && this._loggedOnUser.domain == this._domainToDelete.text)){
        this._error = 'You cannot delete your own domain. This will lock you out.';
      }
    }

    public delete() {
      this.DomainManagementService.deleteDomain(this._domainToDelete).then(
        () => {
          this.$state.go('domainmanagement');
        },
        err => {
          console.log('could not add domain (example failure): ' + this._domainToDelete.text + err);
        }
      )
    }

    public cancel() {
      this.$state.go('domainmanagement');
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
