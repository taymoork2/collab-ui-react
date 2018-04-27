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
import externalCommunicationModule from './externalCommunication';
import fileSharingControlModule from './fileSharingControl';
import sipDomainModule from './sipDomain';
import supportSectionModule from './supportSection';
import webexVersionModule from './webex/webexVersion';
import webexSiteManagement from './webex/webexSiteManagement';
import sparkAssistantModule from './spark-assistant';

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
  webexVersionModule,
  webexSiteManagement,
  sparkAssistantModule,
  multiDirSyncModule,
])
  .controller('SettingsCtrl', SettingsCtrl)
  .name;
