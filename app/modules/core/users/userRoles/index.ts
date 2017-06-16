//TODO Change module name to "core.user.userRoles"

let UserRoleService = require('./userRole.service');
let UserRolesCtrl = require('./userRolesCtrl');

import './_user-roles.scss';

export default angular
  .module('Core')
  .service('UserRoleService', UserRoleService)
  .controller('UserRolesCtrl', UserRolesCtrl)
  .name;
