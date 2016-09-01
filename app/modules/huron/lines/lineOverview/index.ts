import { LineOverviewComponent } from './lineOverview.component';
import { LineOverviewService } from './lineOverview.service'
import { default as serviceModule } from '../services';
import directoryNumber from '../../directoryNumber';
import callForward from '../../callForward';
import simultaneousCalls from '../../simultaneousCalls';
import callerId from '../../callerId';
import sharedLine from '../../sharedLine';

export * from './lineOverview.service';

export default angular
  .module('huron.line-overview', [
    directoryNumber,
    callForward,
    simultaneousCalls,
    serviceModule,
    callerId,
    sharedLine,
    require('modules/core/config/config'),
  ])
  .component('lineOverview', new LineOverviewComponent())
  .service('LineOverviewService', LineOverviewService)
  .name;
