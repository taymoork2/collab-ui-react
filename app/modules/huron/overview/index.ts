import { UserCallOverviewComponent } from './userCallOverview.component';
import serviceModule from 'modules/huron/lines/services';
import dialingModule from 'modules/huron/dialing';
import voicemailModule from 'modules/huron/voicemail';
import huronUserService from 'modules/huron/users';
import primaryLineModule from 'modules/huron/primaryLine';
import configModuleName from 'modules/core/config/config';

export default angular
  .module('huron', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    configModuleName,
    serviceModule,
    dialingModule,
    voicemailModule,
    huronUserService,
    primaryLineModule,
  ])
  .component('userCallOverview', new UserCallOverviewComponent())
  .name;
