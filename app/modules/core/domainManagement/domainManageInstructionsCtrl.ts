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
      this.recordMetrics('open', false, 200, moment(), {});
    }

    public cancel() {
      this.recordMetrics('close', false, 200, this._loadTime, null);
      this.$previousState.go();
    }

    public get domain() {
      return this._domain;
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
