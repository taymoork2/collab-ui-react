import { LineOverviewComponent } from './lineOverview.component';
import { LineOverviewService } from './lineOverview.service';
import lineService from '../services';
import directoryNumber from '../../directoryNumber';
import callForward from '../../callForward';
import simultaneousCalls from '../../simultaneousCalls';
import callerId from '../../callerId';
import sharedLine from '../../sharedLine';
import siteService from '../../sites';
import memberService from '../../members';
import notifications from 'modules/core/notifications';
import autoAnswer from '../../autoAnswer';

export * from './lineOverview.service';

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
