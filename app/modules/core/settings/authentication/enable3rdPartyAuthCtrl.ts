namespace globalsettings {

  class Enable3rdPartyAuthCtrl {

    private _error;
    private _loadTime;

    /* @ngInject */
    constructor(private AuthModeService:AuthModeService, private $previousState, $translate, private LogMetricsService) {
      this._loadTime = moment();
    }

    get error() {
      return this._error;
    }

    set error(error) {
      this._error = error;
    }

    get operationAllowed() {
      return true;
    }

    public enable() {

      this.AuthModeService.enableSSO = 1;
      this.$previousState.go();

     /* let start = moment();
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
      });*/
    }

    public cancel() {
      this.$previousState.go();
    }

    public learnMore() {
    }
  }
  angular
    .module('Core')
    .controller('Enable3rdPartyAuthCtrl', Enable3rdPartyAuthCtrl);
}
