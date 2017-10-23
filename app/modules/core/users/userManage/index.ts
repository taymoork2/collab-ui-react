import emailSuppressModuleName from './emailSuppress';
import editAutoAssignTemplateModalModuleName from './edit-auto-assign-template-modal';

export default angular
  .module('core.users.userManage', [
    emailSuppressModuleName,
    editAutoAssignTemplateModalModuleName,
  ])
  .name;
