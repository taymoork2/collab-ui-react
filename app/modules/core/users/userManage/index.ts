import emailSuppressModuleName from './emailSuppress';
import editAutoAssignTemplateModalModuleName from './edit-auto-assign-template-modal';
import editSummaryAutoAssignTemplateModalModuleName from './edit-summary-auto-assign-template-modal';
import autoAssignTemplateManageOptionsModuleName from './auto-assign-template-manage-options';

export default angular
  .module('core.users.userManage', [
    emailSuppressModuleName,
    editAutoAssignTemplateModalModuleName,
    editSummaryAutoAssignTemplateModalModuleName,
    autoAssignTemplateManageOptionsModuleName,
  ])
  .controller('UserManageOrgController', require('./userManageOrg.controller'))
  .name;
