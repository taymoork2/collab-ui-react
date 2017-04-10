import { OrdersOverviewComponent } from './ordersOverview.component';

export default angular
  .module('huron.orders-overview', [
    'atlas.templates',
    'collab.ui',
    'huron.order-detail',
    'huron.telephoneNumber',
    require('modules/huron/pstnSetup/pstnSetup.service'),
  ])
  .component('ucOrdersOverview', new OrdersOverviewComponent())
  .name;