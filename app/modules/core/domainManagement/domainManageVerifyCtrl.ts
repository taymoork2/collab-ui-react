namespace domainManagement {

  class DomainManageVerifyCtrl {
    private _domain;
    private _domainManagementService;
    private _enable = false;

    /* @ngInject */
    constructor(private $state, private DomainManagementService) {
      this._domain = $state.params.domain;

    }

    get domainName() {
      return this._domain && this._domain.text;
    }

    get enable() {
      return this._enable;
    }

    set enable(enable) {
      this._enable = enable;
    }

    public verify() {
      this.DomainManagementService.verify(this._domain);
    }

  }
  angular
    .module('Core')
    .controller('DomainManageVerifyCtrl', DomainManageVerifyCtrl);
}
