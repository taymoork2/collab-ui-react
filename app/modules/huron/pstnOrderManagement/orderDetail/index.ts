import { OrderDetailComponent } from './orderDetail.component';

export default angular
  .module('huron.order-detail', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.telephoneNumber',
    require('modules/huron/pstn/pstn.service').default,
  ])
  .component('ucOrderDetail', new OrderDetailComponent())
  .name;
