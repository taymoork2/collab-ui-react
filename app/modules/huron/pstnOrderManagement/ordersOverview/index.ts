import { OrdersOverviewComponent } from './ordersOverview.component';

export default angular
  .module('huron.orders-overview', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.order-detail',
    'huron.telephoneNumber',
    require('modules/huron/pstnSetup/pstnSetup.service'),
  ])
  .component('ucOrdersOverview', new OrdersOverviewComponent())
  .name;
