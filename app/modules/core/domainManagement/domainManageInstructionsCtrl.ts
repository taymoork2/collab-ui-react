namespace domainManagement {

  class DomainManageInstructionsCtrl {
    private _domain;
    private _email;
    private _loggedOnUser;
    private _loadTime;

    /* @ngInject */
    constructor($stateParams, private $previousState, private DomainManagementService, private LogMetricsService) {
      this._domain = $stateParams.domain;
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._email = this._loggedOnUser.email;
      this._loadTime = moment();
      this.recordMetrics({
        msg: 'open',
        done: false,
        data: {domain: this.domain.text, action: 'open'}
      });

      if (this._domain && this._domain.text && !this._domain.token) {
        DomainManagementService.getToken(this._domain.text).then((res) => {
          this._domain.token = res;
        })
      }
    }

    public cancel() {
      this.recordMetrics({
        msg: 'close',
        done: true,
        startLog: this._loadTime,
        data: {domain: this.domain.text, action: 'close'}
      });
      this.$previousState.go();
    }

    public get domain() {
      return this._domain;
    }

    public learnMore() {
      this.recordMetrics({
        msg: 'read more',
        done: true,
        startLog: this._loadTime,
        data: {domain: this.domain.text, action: 'manual'}
      });
    }

    recordMetrics({msg, done, status = 200, startLog = moment(), data}) {
      this.LogMetricsService.logMetrics(
        'domainManage instructions ' + msg,
        this.LogMetricsService.eventType.domainManageInstructions,
        done ? this.LogMetricsService.eventAction.buttonClick : this.LogMetricsService.eventAction.pageLoad,
        status,
        startLog,
        1,
        data
      );
    }
  }
  angular
    .module('Core')
    .controller('DomainManageInstructionsCtrl', DomainManageInstructionsCtrl);
}
