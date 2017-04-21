import { OrderDetailComponent } from './orderDetail.component';

export default angular
  .module('huron.order-detail', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'huron.telephoneNumber',
    require('modules/huron/pstnSetup/pstnSetup.service'),
  ])
  .component('ucOrderDetail', new OrderDetailComponent())
  .name;
