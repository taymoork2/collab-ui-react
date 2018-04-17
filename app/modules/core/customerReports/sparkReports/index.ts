import cards from 'modules/core/cards/index';
import featureToggle from 'modules/core/featureToggle/index';
import notifications from 'modules/core/notifications/index';
import reportServices from 'modules/core/partnerReports/commonReportServices/index';
import reportCard from 'modules/core/partnerReports/reportCard/index';
import reportFilter from 'modules/core/partnerReports/reportFilter/index';
import reportSlider from 'modules/core/partnerReports/reportSlider/index';
import learnMoreBanner from 'modules/bmmp/learn-more-banner/index';

import { DummySparkDataService } from './dummySparkData.service';
import { SparkGraphService } from './sparkGraph.service';
import { SparkLineReportService } from './sparkLineReport.service';
import { SparkReportService } from './sparkReport.service';
import { SparkReportCtrl } from './sparkReports.controller';

export default angular
  .module('reports.sparkReports', [
    cards,
    featureToggle,
    learnMoreBanner,
    notifications,
    reportCard,
    reportFilter,
    reportServices,
    reportSlider,
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/config/urlConfig'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .controller('SparkReportCtrl', SparkReportCtrl)
  .service('DummySparkDataService', DummySparkDataService)
  .service('SparkGraphService', SparkGraphService)
  .service('SparkLineReportService', SparkLineReportService)
  .service('SparkReportService', SparkReportService)
  .name;
