import cards from 'modules/core/cards/index';
import featureToggle from 'modules/core/featureToggle/index';
import notifications from 'modules/core/notifications/index';
import reportServices from 'modules/core/partnerReports/commonReportServices/index';
import reportCard from 'modules/core/partnerReports/reportCard/index';
import reportFilter from 'modules/core/partnerReports/reportFilter/index';
import reportSlider from 'modules/core/partnerReports/reportSlider/index';

import { DummySparkDataService } from './dummySparkData.service';
import { SparkGraphService } from './sparkGraph.service';
import { SparkLineReportService } from './sparkLineReport.service';
import { SparkReportService } from './sparkReport.service';
import { SparkReportCtrl } from './sparkReports.controller';

export default angular
  .module('reports.sparkReports', [
    cards,
    featureToggle,
    notifications,
    reportCard,
    reportFilter,
    reportServices,
    reportSlider,
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    require('modules/core/config/chartColors'),
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .controller('SparkReportCtrl', SparkReportCtrl)
  .service('DummySparkDataService', DummySparkDataService)
  .service('SparkGraphService', SparkGraphService)
  .service('SparkLineReportService', SparkLineReportService)
  .service('SparkReportService', SparkReportService)
  .name;
