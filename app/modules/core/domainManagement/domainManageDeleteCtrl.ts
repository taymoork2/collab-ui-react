namespace domainManagement {

  class DomainManageDeleteCtrl {
    private _domainToDelete;
    private _loggedOnUser;
    private _error;

    /* @ngInject */
    constructor($stateParams, $translate, private $state, private $previousState, private DomainManagementService, private LogMetricsService) {
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._domainToDelete = $stateParams.domain;

      if (!this._loggedOnUser.isPartner && (this._domainToDelete.status != DomainManagementService.states.pending && this._loggedOnUser.domain == this._domainToDelete.text)) {
        this._error = $translate.instant('domainManagement.delete.preventLockoutError');
      }
    }

    public deleteDomain() {
      let start = moment();
      if (this._domainToDelete.status === this.DomainManagementService.states.verified) {
        this.DomainManagementService.unverifyDomain(this._domainToDelete.text).then(
          () => {
            this.recordMetrics('ok', 200, start, {domain: this._domainToDelete.text, action: 'unverify'});
            this.$previousState.go();
          },
          err => {
            this.recordMetrics('ok', 500, start, {domain: this._domainToDelete.text, action: 'unverify', error: err});
            this._error = err;
          }
        );
      } else {
        this.DomainManagementService.unclaimDomain(this._domainToDelete.text).then(
          () => {
            this.recordMetrics('ok', 200, start, {domain: this._domainToDelete.text, action: 'unclaim'});
            this.$previousState.go();
          },
          err => {
            this.recordMetrics('ok', 500, start, {domain: this._domainToDelete.text, action: 'unclaim', error: err});
            this._error = err;
          }
        );
      }
    }

    public cancel() {
      this.recordMetrics('cancel', 100, moment(), {domain: this._domainToDelete.text, action: 'cancel'});
      this.$previousState.go();
    }

    get domain() {
      return this._domainToDelete && this._domainToDelete.text;
    }

    get domainIsPending() {
      return this._domainToDelete && this._domainToDelete.status == this.DomainManagementService.states.pending;
    }

    get error() {
      return this._error;
    }

    get isValid() {
      return this.domain && this._loggedOnUser && this._loggedOnUser.isLoaded && !this._error;
    }

    recordMetrics(log, status, start, data) {
      this.LogMetricsService.logMetrics(
        'domainManage remove ' + log,
        this.LogMetricsService.eventType.domainManageRemove,
        this.LogMetricsService.eventAction.buttonClick,
        status,
        start,
        1,
        data
      );
    }
  }

  angular
    .module('Core')
    .controller('DomainManageDeleteCtrl', DomainManageDeleteCtrl);
}
