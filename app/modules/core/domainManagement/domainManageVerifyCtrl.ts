namespace domainManagement {

  class DomainManageVerifyCtrl {
    private _domain;
    private _loggedOnUser;
    private _error;
    private _loadTime;

    /* @ngInject */
    constructor(private $state, private $previousState, private DomainManagementService, private LogMetricsService) {
      this._domain = $state.params.domain;
      this._loggedOnUser = $state.params.loggedOnUser;
      this._loadTime = moment();

      if (this._domain && this._domain.text && !this._domain.token) {
        DomainManagementService.getToken(this._domain.text).then((res) => {
          this._domain.token = res;
        })
      }
    }

    get domainName() {
      return this._domain && this._domain.text;
    }

    get domain() {
      return this._domain;
    }

    get error() {
      return this._error;
    }

    get showWarning() {
      return this.DomainManagementService.enforceUsersInVerifiedAndClaimedDomains;
    }

    set error(error) {
      this._error = error;
    }

    get operationAllowed() {
      if (!this.domain.token)
        return false;

      return !this._error;
    }

    public verify() {
      let start = moment();
      this.DomainManagementService.verifyDomain(this._domain.text).then(res => {
        this.recordMetrics({
          msg: 'ok',
          startLog: start,
          data: {domain: this._domain.text, action: 'verify'}
        });
        this.$previousState.go();
      }, err => {
        this.recordMetrics({
          msg: 'error',
          status: 500,
          startLog: start,
          data: {domain: this._domain.text, error: err, action: 'verify'}
        });
        this._error = err;
      });
    }

    public cancel() {
      this.recordMetrics({
        msg: 'cancel',
        status: 100,
        data: {domain: this._domain.text, action: 'cancel'}
      });
      this.$previousState.go();
    }

    public learnMore() {
      this.recordMetrics({
        msg: 'read more',
        startLog: this._loadTime,
        data: {domain: this._domain.text, action: 'manual'}
      });
    }

    recordMetrics({msg, status = 200, startLog = moment(), data}) {
      this.LogMetricsService.logMetrics(
        'domainManage verify ' + msg,
        this.LogMetricsService.eventType.domainManageVerify,
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
    .controller('DomainManageVerifyCtrl', DomainManageVerifyCtrl);
}
