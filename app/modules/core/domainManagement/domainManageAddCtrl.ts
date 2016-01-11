namespace domainManagement {

  class DomainManageAddCtrl {
    private _domain;

    /* @ngInject */
    constructor(private $state) {
      this.$state = $state;
      let ctrl = this;
    }

    public add() {
      this.$state.go('domainmanagement');
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
