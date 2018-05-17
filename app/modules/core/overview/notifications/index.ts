import { OverviewAutoAssignNotificationFactory } from './autoAssign.factory';
import { SubscriptionWithUnsyncedLicensesNotificationService } from './subscriptionWithUnsyncedLicensesNotification.service';
import { SsoCertificateExpirationNotificationService } from './ssoCertificateExpirationNotification.service';
import { PrivacyDataSheetsNotificationService } from './privacyDataSheetsNotification.service';

import autoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';

export default angular.module('core.overview.notifications', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  autoAssignTemplateModuleName,
])
  .factory('OverviewAutoAssignNotificationFactory', OverviewAutoAssignNotificationFactory)
  .service('SubscriptionWithUnsyncedLicensesNotificationService', SubscriptionWithUnsyncedLicensesNotificationService)
  .service('SsoCertificateExpirationNotificationService', SsoCertificateExpirationNotificationService)
  .service('PrivacyDataSheetsNotificationService', PrivacyDataSheetsNotificationService)
  .name;
