import { RolesAndSecurityMenuItemComponent } from './roles-and-security-menu-item.component';

import './_roles-and-security-menu-item.scss';

export default angular
  .module('Core')
  .component('rolesAndSecurityMenuItem', new RolesAndSecurityMenuItemComponent())
  .name;
