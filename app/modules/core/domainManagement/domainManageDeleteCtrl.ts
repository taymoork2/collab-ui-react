namespace domainManagement {

  class DomainManageDeleteCtrl {
    private _domainToDelete;
    private _loggedOnUser;
    private _error;
    private _moreThanOneVerifiedDomainLeft;

    /* @ngInject */
    constructor($stateParams, $translate, private $state, private $previousState, private DomainManagementService, private LogMetricsService) {
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._domainToDelete = $stateParams.domain;
      this._moreThanOneVerifiedDomainLeft = DomainManagementService.domainList && (_.filter(DomainManagementService.domainList, (d:any)=> {return (d.status == DomainManagementService.states.verified || d.status == DomainManagementService.states.claimed)}).length > 1);

      if (!this._loggedOnUser.isPartner //Partners do not get lockout warnings
          //Domain is not just pending (which is ok to delete) or claimed (which will just unclaim)
        && (this._domainToDelete.status == DomainManagementService.states.verified
          //Enforcement is turned on:
        && DomainManagementService.enforceUsersInVerifiedAndClaimedDomains
          //Logged on user deleting his own domain:
        && this._loggedOnUser.domain == this._domainToDelete.text
          //Not last verified/claimed domain (which is ok to delete, as doing so will reset the enforceUsersInVerifiedAndClaimedDomains flag in CI:
        && this._moreThanOneVerifiedDomainLeft)) {
          this._error = $translate.instant('domainManagement.delete.preventLockoutError');
      }
    }

    public deleteDomain() {
      let start = moment();
      if (this._domainToDelete.status === this.DomainManagementService.states.verified || this._domainToDelete.status === this.DomainManagementService.states.pending) {
        this.DomainManagementService.unverifyDomain(this._domainToDelete.text).then(
          () => {
            this.recordMetrics({
              msg: 'ok',
              startLog: start,
              data: {domain: this._domainToDelete.text, action: 'unverify'}
            });
            this.$previousState.go();
          },
          err => {
            this.recordMetrics({
              msg: 'error',
              status: 500,
              startLog: start,
              data: {domain: this._domainToDelete.text, action: 'unverify', error: err}
            });
            this._error = err;
          }
        );
      } else {
        this.DomainManagementService.unclaimDomain(this._domainToDelete.text).then(
          () => {
            this.recordMetrics({
              msg: 'ok',
              startLog: start,
              data: {domain: this._domainToDelete.text, action: 'unclaim'}
            });
            this.$previousState.go();
          },
          err => {
            this.recordMetrics({
              msg: 'error',
              status: 500,
              startLog: start,
              data: {domain: this._domainToDelete.text, action: 'unclaim', error: err}
            });
            this._error = err;
          }
        );
      }
    }

    public cancel() {
      this.recordMetrics({
        msg: 'cancel',
        status: 100,
        data: {domain: this._domainToDelete.text, action: 'cancel'}
      });
      this.$previousState.go();
    }

    get domain() {
      return this._domainToDelete && this._domainToDelete.text;
    }

    get showWarning() {
      return this._domainToDelete && this.DomainManagementService.enforceUsersInVerifiedAndClaimedDomains &&
        this._domainToDelete.status != this.DomainManagementService.states.pending && this._moreThanOneVerifiedDomainLeft;
    }

    get error() {
      return this._error;
    }

    get isValid() {
      return this.domain && this._loggedOnUser && this._loggedOnUser.isLoaded && !this._error;
    }

    recordMetrics({msg, status = 200, startLog = moment(), data}) {
      this.LogMetricsService.logMetrics(
        'domainManage remove ' + msg,
        this.LogMetricsService.eventType.domainManageRemove,
        this.LogMetricsService.eventAction.buttonClick,
        status,
        startLog,
        1,
        data
      );
    }
  }

  angular
    .module('Core')
    .controller('DomainManageDeleteCtrl', DomainManageDeleteCtrl);
}
