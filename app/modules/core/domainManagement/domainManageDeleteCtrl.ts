namespace domainManagement {

  class DomainManageDeleteCtrl {
    private _domainToDelete;
    private _loggedOnUser;

    /* @ngInject */
    constructor($stateParams, private $state, private DomainManagementService) {
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._domainToDelete = $stateParams.domain;
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

    get isValid() {
      return this.domain && this._loggedOnUser && this._loggedOnUser.isLoaded && (this._loggedOnUser.isPartner || (this._loggedOnUser.domain != this._domainToDelete.text));
    }
  }
  angular
    .module('Core')
    .controller('DomainManageDeleteCtrl', DomainManageDeleteCtrl);
}
