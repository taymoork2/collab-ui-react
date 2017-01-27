import { LineOverviewComponent } from 'modules/huron/lines/lineOverview/lineOverview.component';
import { LineOverviewService } from 'modules/huron/lines/lineOverview/lineOverview.service';
import lineService from 'modules/huron/lines/services';
import directoryNumber from 'modules/huron/directoryNumber';
import callForward from 'modules/huron/callForward';
import simultaneousCalls from 'modules/huron/simultaneousCalls';
import callerId from 'modules/huron/callerId';
import sharedLine from 'modules/huron/sharedLine';
import siteService from 'modules/huron/sites';
import memberService from 'modules/huron/members';
import notifications from 'modules/core/notifications';
import autoAnswer from 'modules/huron/autoAnswer';

export * from 'modules/huron/lines/lineOverview/lineOverview.service';

export default angular
  .module('huron.line-overview', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    directoryNumber,
    callForward,
    simultaneousCalls,
    lineService,
    callerId,
    sharedLine,
    require('modules/core/config/config'),
    notifications,
    siteService,
    memberService,
    autoAnswer,
  ])
  .component('ucLineOverview', new LineOverviewComponent())
  .service('LineOverviewService', LineOverviewService)
  .name;
