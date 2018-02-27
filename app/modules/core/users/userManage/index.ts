require('./_user-manage.scss');

import * as analyticsModuleName from 'modules/core/analytics';
import autoAssignTemplateManageOptionsModuleName from './auto-assign-template-manage-options';
import emailSuppressModuleName from './emailSuppress';
import editAutoAssignTemplateModalModuleName from './edit-auto-assign-template-modal';
import editSummaryAutoAssignTemplateModalModuleName from './edit-summary-auto-assign-template-modal';
import featureToggleModuleName from 'modules/core/featureToggle';
import multiDirSyncModuleName from 'modules/core/multi-dirsync';
import * as orgServiceModuleName from 'modules/core/scripts/services/org.service';
import userAddModuleName from 'modules/core/users/userAdd';
import * as userCsvServiceModuleName from 'modules/core/users/userCsv/userCsv.service';
import onboardSummaryForAutoAssignModalModuleName from './onboard-summary-for-auto-assign-modal';
import manageUsersSharedModuleName from './shared';
import dirSyncModuleName from './dir-sync';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import crActionCardsModuleName from 'modules/core/users/shared/cr-action-cards';
import convertModuleName from './convert';

export default angular
  .module('core.users.userManage', [
    require('angular-ui-router'),
    require('@collabui/collab-ui-ng').default,
    analyticsModuleName,
    autoAssignTemplateManageOptionsModuleName,
    emailSuppressModuleName,
    editAutoAssignTemplateModalModuleName,
    editSummaryAutoAssignTemplateModalModuleName,
    featureToggleModuleName,
    multiDirSyncModuleName,
    orgServiceModuleName,
    userAddModuleName,
    userCsvServiceModuleName,
    onboardSummaryForAutoAssignModalModuleName,
    manageUsersSharedModuleName,
    dirSyncModuleName,
    usersSharedAutoAssignTemplateModuleName,
    crActionCardsModuleName,
    convertModuleName,
  ])
  .controller('UserManageOrgController', require('./userManageOrg.controller'))
  .name;
