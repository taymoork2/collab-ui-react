var myCompanyPage;
(function (myCompanyPage) {
    var MyCompanyPageCtrl = (function () {
        function MyCompanyPageCtrl($translate) {
            this._tabs = [{
                    title: $translate.instant('my-company.subscription'),
                    state: 'my-company.subscriptions'
                }, {
                    title: $translate.instant('my-company.info'),
                    state: 'my-company.info'
                }, {
                    title: $translate.instant('my-company.order'),
                    state: 'my-company.orders'
                }];
        }
        Object.defineProperty(MyCompanyPageCtrl.prototype, "tabs", {
            get: function () {
                return this._tabs;
            },
            enumerable: true,
            configurable: true
        });
        return MyCompanyPageCtrl;
    }());
    angular
        .module('Core')
        .controller('MyCompanyPageCtrl', MyCompanyPageCtrl);
})(myCompanyPage || (myCompanyPage = {}));
