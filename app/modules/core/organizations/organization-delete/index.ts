require('./organization-delete.scss');

import { OrganizationDeleteComponent } from './organization-delete-modal.component';
import { OrganizationDeleteService } from './organization-delete.service';

import * as analyticsModuleName from 'modules/core/analytics';
import * as authModuleName from 'modules/core/auth/auth';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import featureToggleServiceModule from 'modules/core/featureToggle';
import notificationsModuleName from 'modules/core/notifications';
import * as orgServiceModuleName from 'modules/core/scripts/services/org.service';
import waitingIntervalModuleName from 'modules/core/shared/waiting-interval';

export default angular
  .module('core.organizations.organizationDelete', [
    require('@collabui/collab-ui-ng').default,
    require('angular-resource'),
    analyticsModuleName,
    authModuleName,
    authinfoModuleName,
    featureToggleServiceModule,
    notificationsModuleName,
    orgServiceModuleName,
    waitingIntervalModuleName,
  ])
  .component('organizationDeleteModal', new OrganizationDeleteComponent())
  .service('OrganizationDeleteService', OrganizationDeleteService)
  .name;
