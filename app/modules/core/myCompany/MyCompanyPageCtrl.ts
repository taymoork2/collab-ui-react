require('./_myCompany.scss');

namespace myCompanyPage {
  class MyCompanyPageCtrl {

    private _tabs: Object[];
    private _title: string;

    get tabs() {
      return this._tabs;
    }

    get title() {
      return this._title;
    }

    /* @ngInject */
    constructor(
      private $translate: ng.translate.ITranslateService,
      private Authinfo,
    ) {
      this._tabs = [{
        title: this.$translate.instant('my-company.subscription'),
        state: 'my-company.subscriptions',
      }, {
        title: this.$translate.instant('my-company.info'),
        state: 'my-company.info',
      }];

      this._title = this.$translate.instant('my-company.pageTitle');
      const customers = this.Authinfo.getCustomerAccounts();
      const result = _.some(customers, { customerType: 'Online' });
      if (result) {
        this._tabs.push({
          title: this.$translate.instant('my-company.order'),
          state: 'my-company.orders',
        });
      }
    }
  }

  angular
    .module('Core')
    .controller('MyCompanyPageCtrl', MyCompanyPageCtrl);
}
