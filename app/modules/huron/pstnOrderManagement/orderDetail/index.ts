import { OrderDetailComponent } from './orderDetail.component';

export default angular
  .module('huron.order-detail', [
    'atlas.templates',
    'collab.ui',
    'huron.telephoneNumber',
    require('modules/huron/pstnSetup/pstnSetup.service'),
  ])
  .component('ucOrderDetail', new OrderDetailComponent())
  .name;
