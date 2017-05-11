import { OrdersOverviewComponent } from './ordersOverview.component';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.orders-overview', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.order-detail',
    require('modules/huron/pstn/pstn.service').default,
    phoneNumberModule,
  ])
  .component('ucOrdersOverview', new OrdersOverviewComponent())
  .name;
