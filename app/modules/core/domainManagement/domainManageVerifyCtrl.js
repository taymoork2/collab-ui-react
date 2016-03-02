var domainManagement;
(function (domainManagement) {
    var DomainManageVerifyCtrl = (function () {
        function DomainManageVerifyCtrl($state, $previousState, DomainManagementService, $translate, LogMetricsService) {
            var _this = this;
            this.$state = $state;
            this.$previousState = $previousState;
            this.DomainManagementService = DomainManagementService;
            this.LogMetricsService = LogMetricsService;
            this._domain = $state.params.domain;
            this._loggedOnUser = $state.params.loggedOnUser;
            this._loadTime = moment();
            if (this._domain && this._domain.text && !this._domain.token) {
                DomainManagementService.getToken(this._domain.text).then(function (res) {
                    _this._domain.token = res;
                });
            }
        }
        Object.defineProperty(DomainManageVerifyCtrl.prototype, "domainName", {
            get: function () {
                return this._domain && this._domain.text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomainManageVerifyCtrl.prototype, "domain", {
            get: function () {
                return this._domain;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomainManageVerifyCtrl.prototype, "error", {
            get: function () {
                return this._error;
            },
            set: function (error) {
                this._error = error;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomainManageVerifyCtrl.prototype, "showWarning", {
            get: function () {
                return this.DomainManagementService.enforceUsersInVerifiedAndClaimedDomains;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DomainManageVerifyCtrl.prototype, "operationAllowed", {
            get: function () {
                if (!this.domain.token)
                    return false;
                return !this._error;
            },
            enumerable: true,
            configurable: true
        });
        DomainManageVerifyCtrl.prototype.verify = function () {
            var _this = this;
            var start = moment();
            this.DomainManagementService.verifyDomain(this._domain.text).then(function (res) {
                _this.recordMetrics({
                    msg: 'ok',
                    startLog: start,
                    data: { domain: _this._domain.text, action: 'verify' }
                });
                _this.$previousState.go();
            }, function (err) {
                _this.recordMetrics({
                    msg: 'error',
                    status: 500,
                    startLog: start,
                    data: { domain: _this._domain.text, error: err, action: 'verify' }
                });
                _this._error = err;
            });
        };
        DomainManageVerifyCtrl.prototype.cancel = function () {
            this.recordMetrics({
                msg: 'cancel',
                status: 100,
                data: { domain: this._domain.text, action: 'cancel' }
            });
            this.$previousState.go();
        };
        DomainManageVerifyCtrl.prototype.learnMore = function () {
            this.recordMetrics({
                msg: 'read more',
                startLog: this._loadTime,
                data: { domain: this._domain.text, action: 'manual' }
            });
        };
        DomainManageVerifyCtrl.prototype.recordMetrics = function (_a) {
            var msg = _a.msg, _b = _a.status, status = _b === void 0 ? 200 : _b, _c = _a.startLog, startLog = _c === void 0 ? moment() : _c, data = _a.data;
            this.LogMetricsService.logMetrics('domainManage verify ' + msg, this.LogMetricsService.eventType.domainManageVerify, this.LogMetricsService.eventAction.buttonClick, status, startLog, 1, data);
        };
        return DomainManageVerifyCtrl;
    }());
    angular
        .module('Core')
        .controller('DomainManageVerifyCtrl', DomainManageVerifyCtrl);
})(domainManagement || (domainManagement = {}));
