namespace domainManagement {

  class DomainManageInstructionsCtrl {
    private _domain;
    private _email;
    private _loggedOnUser;
    private _loadTime;

    /* @ngInject */
    constructor($stateParams, private $previousState, private LogMetricsService) {
      this._domain = $stateParams.domain;
      this._loggedOnUser = $stateParams.loggedOnUser;
      this._email = this._loggedOnUser.email;
      this._loadTime = moment();
      this.recordMetrics('open', false, 200, moment(), {domain: this.domain.text, action: 'open'});
    }

    public cancel() {
      this.recordMetrics('close', true, 200, this._loadTime, {domain: this.domain.text, action: 'close'});
      this.$previousState.go();
    }

    public get domain() {
      return this._domain;
    }

    public learnMore() {
      this.recordMetrics('read more', true, 200, this._loadTime, {domain: this.domain.text, action: 'manual'});
    }

    recordMetrics(log, done, status, start, data) {
      this.LogMetricsService.logMetrics(
        'domainManage instructions ' + log,
        this.LogMetricsService.eventType.domainManageInstructions,
        done ? this.LogMetricsService.eventAction.buttonClick : this.LogMetricsService.eventAction.pageLoad,
        status,
        start,
        1,
        data
      );
    }
  }
  angular
    .module('Core')
    .controller('DomainManageInstructionsCtrl', DomainManageInstructionsCtrl);
}
