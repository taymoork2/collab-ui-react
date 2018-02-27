import { OrganizationDeleteComponent } from './organization-delete-modal.component';
import { OrganizationDeleteService } from './organization-delete.service';

import * as analyticsModuleName from 'modules/core/analytics';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import featureToggleServiceModule from 'modules/core/featureToggle';
import notificationsModuleName from 'modules/core/notifications';
const authModuleName = require('modules/core/auth/auth');

require('./organization-delete.scss');

export default angular
  .module('core.organizations.organizationDelete', [
    require('@collabui/collab-ui-ng').default,
    require('angular-resource'),
    analyticsModuleName,
    authModuleName,
    authinfoModuleName,
    featureToggleServiceModule,
    notificationsModuleName,
  ])
  .component('organizationDeleteModal', new OrganizationDeleteComponent())
  .service('OrganizationDeleteService', OrganizationDeleteService)
  .name;
