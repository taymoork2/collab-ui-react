import { OrderDetailComponent } from './orderDetail.component';
import phoneNumberServiceModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.order-detail', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('modules/huron/pstn/pstn.service').default,
    phoneNumberServiceModule,
  ])
  .component('ucOrderDetail', new OrderDetailComponent())
  .name;
