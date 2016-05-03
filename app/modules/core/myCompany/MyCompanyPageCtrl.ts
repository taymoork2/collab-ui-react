namespace myCompanyPage {
  class MyCompanyPageCtrl {

    private _tabs;
    get tabs() {
      return this._tabs;
    }

    /* @ngInject */
    constructor($translate) {
      this._tabs = [{
        title: $translate.instant('my-company.subscription'),
        state: 'my-company.subscriptions'
      }, {
        title: $translate.instant('my-company.info'),
        state: 'my-company.info'
      },{
        title: $translate.instant('my-company.order'),
        state: 'my-company.orders'
      }];
    }
  }

  angular
    .module('Core')
    .controller('MyCompanyPageCtrl', MyCompanyPageCtrl);
}
