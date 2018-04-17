import { LineOverviewComponent } from './lineOverview.component';
import { LineOverviewService } from './lineOverview.service';
import lineService from 'modules/huron/lines/services';
import directoryNumber from 'modules/huron/directoryNumber';
import callForward from 'modules/huron/callForward';
import mediaOnHold from 'modules/huron/media-on-hold';
import simultaneousCalls from 'modules/huron/simultaneousCalls';
import lineLabel from 'modules/huron/lineLabel';
import callerId from 'modules/huron/callerId';
import sharedLine from 'modules/huron/sharedLine';
import siteService from 'modules/huron/sites';
import memberService from 'modules/huron/members';
import notifications from 'modules/core/notifications';
import autoAnswer from 'modules/huron/autoAnswer';
import voicemailModule from 'modules/huron/voicemail';
import huronUserService  from 'modules/huron/users';
export * from 'modules/huron/lines/lineOverview/lineOverview.service';

export default angular
  .module('huron.line-overview', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    lineLabel,
    directoryNumber,
    callForward,
    simultaneousCalls,
    lineService,
    callerId,
    mediaOnHold,
    sharedLine,
    require('modules/core/config/config').default,
    notifications,
    siteService,
    memberService,
    autoAnswer,
    huronUserService,
    voicemailModule,
  ])
  .component('ucLineOverview', new LineOverviewComponent())
  .service('LineOverviewService', LineOverviewService)
  .name;
