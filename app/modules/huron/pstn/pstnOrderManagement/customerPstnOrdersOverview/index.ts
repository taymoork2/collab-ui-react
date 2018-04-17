import { CustomerPstnOrdersOverviewComponent } from './customerPstnOrdersOverview.component';

export default angular
  .module('huron.customer-pstn-orders-overview', [
    require('@collabui/collab-ui-ng').default,
    'huron.orders-overview',
  ])
  .component('ucCustomerPstnOrdersOverview', new CustomerPstnOrdersOverviewComponent())
  .name;
