namespace domainManagement {

  class DomainManageInstructionsCtrl {
    private _domain;
    private _error;
    private _email;
    private _loggedOnUser;
    private _progress;

    /* @ngInject */
    constructor($stateParams, private $state, private DomainManagementService) {
      this._domain = $stateParams.domain;
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._email = this._loggedOnUser.email;
    }
    
    public cancel() {
      this.$state.go('domainmanagement');
    }

    public get domain(){
      return this._domain;
    }
  }
  angular
    .module('Core')
    .controller('DomainManageInstructionsCtrl', DomainManageInstructionsCtrl);
}
