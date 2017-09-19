export class CustomerPstnOrdersOverviewComponent implements ng.IComponentOptions {
  public controller = CustomerPstnOrdersOverviewCtrl;
  public template = require('modules/huron/pstn/pstnOrderManagement/customerPstnOrdersOverview/customerPstnOrdersOverview.html');
  public bindings = {
    currentCustomer: '<',
    vendor: '<',
  };
}

export class CustomerPstnOrdersOverviewCtrl implements ng.IComponentController {
  public currentCustomer: {};
  public vendor: string;
}
