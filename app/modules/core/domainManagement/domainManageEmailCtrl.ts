namespace domainManagement {

  class DomainManageEmailCtrl {
    private _domain;
    private _error;
    private _email;
    private _loggedOnUser;
    private _progress;

    /* @ngInject */
    constructor($stateParams, private $previousState, private DomainManagementService) {

      this._domain = $stateParams.domain;
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._email = this._loggedOnUser.email;
    }

    public cancel() {
      this.$previousState.go();
    }

    public sendEmail() {
      if (this._progress) {
        return;
      } else {
        this._progress = true;
      }
    }

    public validate() {
      if (this.email && this._email.length > 0) {
        if (/^(([^@]+)@)+(([^\.]+\.)+[^\.]{2,})$/.test(this._email)) {
          return {valid: true, empty: false};
        } else {
          return {valid: false, empty: false};
        }
      } else {
        return {valid: false, empty: true};
      }
    }

    get sendEnabled() {
      return this.validate().valid && !this._progress;
    }

    public get email() {
      return this._email;
    }

    public set email(email) {
      this._email = email;
    }

    public get domain(){
      return this._domain;
    }
  }
  angular
    .module('Core')
    .controller('DomainManageEmailCtrl', DomainManageEmailCtrl);
}
