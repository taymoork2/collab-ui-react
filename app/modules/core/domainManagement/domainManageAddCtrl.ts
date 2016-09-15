namespace domainManagement {
  declare let punycode:any;

  class DomainManageAddCtrl {
    private _loggedOnUser;
    private _domain;
    private _error;
    private _adding = false;

    /* @ngInject */
    constructor($stateParams, private $previousState, private DomainManagementService, private $translate, private LogMetricsService) {
      this._loggedOnUser = $stateParams.loggedOnUser;
    }

    public add() {
      if (!this.addEnabled) {
        return;
      }
      this._adding = true;
      let startAdd = moment();
      this.DomainManagementService.addDomain(this.domainToAdd).then(
        ()=> {
          this.recordMetrics({
            msg: 'ok',
            startLog: startAdd,
            data: {domain: this.domainToAdd, action: 'add'}
          });
          this.$previousState.go();
          this._adding = false;
        },
        err => {
          this.recordMetrics({
            msg: 'ok',
            status: 500,
            startLog: startAdd,
            data: {domain: this.domainToAdd, error: err, action: 'add'}
          });
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

    recordMetrics({msg, status = 200, startLog = moment(), data}) {
      this.LogMetricsService.logMetrics(
        'domainManage add ' + msg,
        this.LogMetricsService.eventType.domainManageAdd,
        this.LogMetricsService.eventAction.buttonClick,
        status,
        startLog,
        1,
        data
      );
    }

    public cancel() {
      this.recordMetrics({
        msg: 'cancel',
        status: 100,
        data: {domain: this.domainToAdd, action: 'cancel'}
      });
      this.$previousState.go();
    }

    get exampleDomain() {
      //If the user is not a partner, and if not already added, suggest the logged on user's domain:
      if (this._loggedOnUser.isLoaded && !this._loggedOnUser.isPartner
        && !_.some(this.DomainManagementService.domainList, {text: this._loggedOnUser.domain})) {
        return this._loggedOnUser.domain;
      } else {
        return null;
      }
    }

    get error() {
      return this._error;
    }

    get domain() {
      return this._domain;
    }

    get intDomain() {
      let encodedDomain = this.encodedDomain;
      let domain = (this.domain || '').toLowerCase();
      return {
        show: encodedDomain !== domain,
        text: this.$translate.instant('domainManagement.add.encodedIDN', {domain: encodedDomain})
      };
    }

    get encodedDomain() {
      return punycode.toASCII((this._domain || '').toLowerCase());
    }

    get domainToAdd() {
      if (this._domain || !this._loggedOnUser.domain || !this._loggedOnUser.isLoaded || this._loggedOnUser.isPartner) {
        return this.encodedDomain;
      }

      return this._loggedOnUser.domain.toLowerCase();
    }

    set domain(domain) {
      if (domain == this._domain) {
        return;
      }

      this._error = null;//reset error
      this._domain = domain;
    }

    //gui valid
    public validate() {
      let domain = this.domainToAdd;

      if (domain.length < 3) {
        return {valid: false, empty: !this._domain, error: 'domainManagement.add.invalidDomain'};
      }

      if (!(/^(([a-z0-9\-]+\.)+[a-z0-9\-]{2,})$/g.test(domain))) {
        return {valid: false, empty: !this._domain, error: 'domainManagement.add.invalidDomain'};
      }

      if (!this._adding && _.some(this.DomainManagementService.domainList, {text: domain})) {
        return {valid: false, empty: !this._domain, error: 'domainManagement.add.invalidDomainAdded'}; //already added!
      }

      return {valid: true, empty: false, error: undefined};
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
