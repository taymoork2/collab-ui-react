import { SettingsCtrl } from './settings.controller';

import './_settings.scss';

import authenticationModule from './authentication';
import brandingModule from './branding';
import dirSyncModule from './dirsync';
import privacySectionModule from './privacySection';
import retentionModule from './retention';
import securityModule from './security';
import sipDomainModule from './sipDomain';
import supportSectionModule from './supportSection';

export default angular.module('core.settings', [
  require('angular-cache'),
  require('scripts/app.templates'),
  require('collab-ui-ng').default,
  require('angular-translate'),
  authenticationModule,
  brandingModule,
  dirSyncModule,
  privacySectionModule,
  retentionModule,
  securityModule,
  sipDomainModule,
  supportSectionModule,
])
  .controller('SettingsCtrl', SettingsCtrl)
  .name;
