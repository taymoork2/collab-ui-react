import { AdminListComponent } from './adminList.component';

export default angular
  .module('core.customers.customerSubscriptions.adminList', [
    require('scripts/app.templates'),
    require('angular-translate'),
  ])
  .component('crAdminList', new AdminListComponent())
  .name;
