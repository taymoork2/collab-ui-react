import { SettingsCtrl } from './settings.controller';

import './_settings.scss';

import authenticationModule from './authentication';
import emailModule from './email';
import brandingModule from './branding';
import domainsModule from './domain';
import dirSyncModule from './dirsync';
import multiDirSyncModule from 'modules/core/multi-dirsync';
import privacySectionModule from './privacySection';
import retentionModule from './retention';
import securityModule from './security';
import externalCommunicationModule from './external-communication';
import fileSharingControlModule from './fileSharingControl';
import sipDomainModule from './sipDomain';
import supportSectionModule from './supportSection';
import webexModule from './webex';
import sparkAssistantModule from './spark-assistant';
import proximityModule from './proximity';

export default angular.module('core.settings', [
  require('angular-cache'),
  require('@collabui/collab-ui-ng').default,
  require('angular-translate'),
  authenticationModule,
  emailModule,
  brandingModule,
  dirSyncModule,
  privacySectionModule,
  retentionModule,
  securityModule,
  externalCommunicationModule,
  fileSharingControlModule,
  domainsModule,
  sipDomainModule,
  supportSectionModule,
  webexModule,
  sparkAssistantModule,
  multiDirSyncModule,
  proximityModule,
])
  .controller('SettingsCtrl', SettingsCtrl)
  .name;
