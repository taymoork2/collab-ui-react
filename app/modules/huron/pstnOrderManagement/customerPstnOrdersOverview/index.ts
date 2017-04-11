import { CustomerPstnOrdersOverviewComponent } from './customerPstnOrdersOverview.component';

export default angular
  .module('huron.customer-pstn-orders-overview', [
    'atlas.templates',
    'collab.ui',
    'huron.orders-overview',
  ])
  .component('ucCustomerPstnOrdersOverview', new CustomerPstnOrdersOverviewComponent())
  .name;
