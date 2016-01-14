namespace domainManagement {

  class DomainManageAddCtrl {
    private _adminDomain;
    private _domain;
    private _error;

    /* @ngInject */
    constructor($stateParams, private $state, private DomainManagementService) {

      this._adminDomain = $stateParams.adminDomain;
    }

    public add() {
      let ctrl = this;

      this.DomainManagementService.addDomain(this._domain).then(
        function () {
          ctrl.$state.go('domainmanagement');
        },
        function (err) {
          ctrl._error = err;
        }
      )
    }

    public cancel() {
      this.$state.go('domainmanagement');
    }

    get exampleDomain() {
      if (this.DomainManagementService.domainList.length == 0)
        return this._adminDomain;
      else
        return null;
    }

    get error() {
      return this._error;
    }

    get domain() {
      return this._domain;
    }

    set domain(domain) {
      if (domain == this._domain)
        return;

      this._error = null;//reset error
      this._domain = domain;
    }

    //gui valid

    public validate() {
      if (this._domain && this._domain.length > 0) {

        if (/^(([^\.]+\.)+[^\.]{2,})$/g.test(this._domain)) {
          return {valid: true, empty: false};
        }
        //if (/^(([a-åA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]){2,}$/g.test(this._domain)) {
        //  return {valid: true, empty: false};
        //}
        else {
          return {valid: false, empty: false};
        }
      }
      else {
        return {valid: false, empty: true};
      }
    }

    get isValid() {
      let validation = this.validate();
      return validation && validation.valid;
    }

    get addEnabled() {
      return this.isValid;
    }
  }
  angular
    .module('Core')
    .controller('DomainManageAddCtrl', DomainManageAddCtrl);
}
