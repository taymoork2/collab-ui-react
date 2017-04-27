import { OrdersOverviewComponent } from './ordersOverview.component';

export default angular
  .module('huron.orders-overview', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.order-detail',
    'huron.telephoneNumber',
    require('modules/huron/pstn/pstn.service').default,
  ])
  .component('ucOrdersOverview', new OrdersOverviewComponent())
  .name;
