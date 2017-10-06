import emailSuppressModuleName from './emailSuppress';
import editAutoAssignTemplateModuleName from './edit-auto-assign-template';

export default angular
  .module('core.users.userManage', [
    emailSuppressModuleName,
    editAutoAssignTemplateModuleName,
  ])
  .name;
