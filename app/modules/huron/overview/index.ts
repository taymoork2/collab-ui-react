import { UserCallOverviewComponent } from './userCallOverview.component';
import serviceModule from 'modules/huron/lines/services';
import dialingModule from 'modules/huron/dialing';
import voicemailModule from 'modules/huron/voicemail';
import huronUserService from 'modules/huron/users';

export default angular
  .module('huron', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    serviceModule,
    dialingModule,
    voicemailModule,
    huronUserService,
  ])
  .component('userCallOverview', new UserCallOverviewComponent())
  .name;
