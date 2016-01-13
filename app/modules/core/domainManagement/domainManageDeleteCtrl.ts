namespace domainManagement {

  class DomainManageDeleteCtrl {
    private _domainToDelete;
    private _adminDomain;

    /* @ngInject */
    constructor($stateParams, private $state, private DomainManagementService) {

        this._adminDomain = $stateParams.adminDomain;
        this._domainToDelete = $stateParams.domain ;
    }

    public delete() {
      let ctrl = this;

      this.DomainManagementService.deleteDomain(this._domainToDelete).then(
        function () { ctrl.$state.go('domainmanagement');},
        function (err) { console.log('could not add domain (example failure): ' + ctrl._domainToDelete.text + err);}
      )
    }

    public cancel() {
      this.$state.go('domainmanagement');
    }

    get domain() {
      return this._domainToDelete && this._domainToDelete.text;
    }

    get isValid() {
      return this._domainToDelete && this._domainToDelete.text && (this._adminDomain != this._domainToDelete.text);
    }
  }
  angular
    .module('Core')
    .controller('DomainManageDeleteCtrl', DomainManageDeleteCtrl);
}
