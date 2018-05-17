import featureToggleModule from '../../featureToggle';
import notificationModule from '../../notifications';
import { ProximitySettingComponent } from './proximity.component';
import { ProximityModalComponent } from './proximity-modal.component';

require('./_proximity.scss');

export default angular.module('core.settings.proximity', [
  require('angular-cache'),
  require('modules/ediscovery/bytes_filter'),
  require('modules/core/scripts/services/authinfo'),
  require('angular-ui-router'),
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/org.service'),
  require('modules/core/scripts/services/logmetricsservice'),
  require('modules/core/partnerProfile/branding').default,
  require('ng-file-upload'),
  require('modules/csdm/services').default,
  featureToggleModule,
  notificationModule,
])
  .component('proximitySetting', new ProximitySettingComponent())
  .component('proximityModal', new ProximityModalComponent())
  .name;
