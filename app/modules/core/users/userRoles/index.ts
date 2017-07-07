//TODO Change module name to "core.user.userRoles"

const UserRoleService = require('./userRole.service');
const UserRolesCtrl = require('./userRolesCtrl');

import './_user-roles.scss';

export default angular
  .module('Core')
  .service('UserRoleService', UserRoleService)
  .controller('UserRolesCtrl', UserRolesCtrl)
  .name;
