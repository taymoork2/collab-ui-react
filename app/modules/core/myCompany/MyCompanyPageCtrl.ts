namespace myCompanyPage {
  class MyCompanyPageCtrl {

    private _tabs;
    private _title;

    get tabs() {
      return this._tabs;
    }

    get title() {
      return this._title;
    }

    /* @ngInject */
    constructor($translate) {
      this._tabs = [{
        title: $translate.instant('my-company.subscription'),
        state: 'my-company.subscriptions'
      }, {
        title: $translate.instant('my-company.info'),
        state: 'my-company.info'
      }];
    // ,{
    //     title: $translate.instant('my-company.order'),
    //     state: 'my-company.orders'
    //   }];

      this._title = $translate.instant('my-company.pageTitle');
    }

  }

  angular
    .module('Core')
    .controller('MyCompanyPageCtrl', MyCompanyPageCtrl);
}
