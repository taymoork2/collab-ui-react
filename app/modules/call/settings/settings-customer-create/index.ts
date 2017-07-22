import { HuronCustomerCreateComponent } from './settings-customer-create.component';

export { HuronCustomerCreateComponent };

export default angular
  .module('call.settings.customer-create', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .component('ucHuronCustomerCreate', new HuronCustomerCreateComponent())
  .name;
