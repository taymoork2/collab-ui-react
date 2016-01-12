namespace domainManagement {

  class DomainManageAddCtrl {
    private _domain;
    private _domainManagementService;

    /* @ngInject */
    constructor(private $state, DomainManagementService) {
      this.$state = $state;
      this._domainManagementService = DomainManagementService;
    }

    public add() {
      let ctrl = this;

      this._domainManagementService.addDomain(this._domain).then(
        function () { ctrl.$state.go('domainmanagement');},
        function (err) { console.log('could not add domain (example failure): ' + ctrl._domain + err);}
      )
    }

    public cancel() {
      this.$state.go('domainmanagement');
    }

    get domain() {
      return this._domain;
    }

    set domain(domain){
      this._domain = domain;
    }
  }
  angular
    .module('Core')
    .controller('DomainManageAddCtrl', DomainManageAddCtrl);
}
