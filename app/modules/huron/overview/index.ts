import { UserCallOverviewComponent } from './userCallOverview.component';
import serviceModule from 'modules/huron/lines/services';
import dialingModule from 'modules/huron/dialing';
import voicemailModule from 'modules/huron/voicemail';
import huronUserService from 'modules/huron/users';
import FeatureToggleService from 'modules/core/featureToggle';
import primaryLineModule from 'modules/huron/primaryLine';

export default angular
  .module('huron', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    serviceModule,
    dialingModule,
    voicemailModule,
    huronUserService,
    FeatureToggleService,
    primaryLineModule,
  ])
  .component('userCallOverview', new UserCallOverviewComponent())
  .name;
