namespace domainManagement {

  class DomainManageAddCtrl {
    private _loggedOnUser;
    private _domain;
    private _error;
    private _adding = false;

    /* @ngInject */
    constructor($stateParams, private $previousState, private DomainManagementService) {

      this._loggedOnUser = $stateParams.loggedOnUser;
    }

    public add() {
      if (!this.addEnabled) {
        return;
      }

      this._adding = true;

      this.DomainManagementService.addDomain(this.domainToAdd).then(
        ()=> {
          this.$previousState.go();
          this._adding = false;
        },
        err => {
          this._error = err;
          this._adding = false;
        }
      )
    }

    public keyPressInInputField(keyEvent) {
      if (keyEvent.which === 13) {
        this.add();
      }
    }

    public cancel() {
      this.$previousState.go();
    }

    get exampleDomain() {

      //If the user is not a partner, and if not already added, suggest the logged on user's domain:
      if (this._loggedOnUser.isLoaded && !this._loggedOnUser.isPartner
        && !_.some(this.DomainManagementService.domainList, {text: this._loggedOnUser.domain}))
        return this._loggedOnUser.domain;
      else
        return null;
    }

    get error() {
      return this._error;
    }

    get domain() {
      return this._domain;
    }

    get domainToAdd() {
      if (this._domain || !this._loggedOnUser.domain || !this._loggedOnUser.isLoaded || this._loggedOnUser.isPartner)
        return (this._domain || '').toLowerCase();

      return this._loggedOnUser.domain.toLowerCase();
    }

    set domain(domain) {
      if (domain == this._domain)
        return;

      this._error = null;//reset error
      this._domain = domain;
    }

    //gui valid

    public validate() {
      let domain = this.domainToAdd;

      if (domain.length < 3){
        return {valid: false, empty: !this._domain};
      }

      if (!(/^(([^\.,]+\.)+[^\.,]{2,})$/g.test(domain))) {
        return {valid: false, empty: !this._domain};
      }
      //if (/^(([a-åA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)+([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]){2,}$/g.test(this._domain)) {
      //  return {valid: true, empty: false};
      //}

      if (!this._adding && _.some(this.DomainManagementService.domainList, {text: domain})){
        return {valid: false, empty: !this._domain}; //already added!
      }

      return {valid: true, empty: false};
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
