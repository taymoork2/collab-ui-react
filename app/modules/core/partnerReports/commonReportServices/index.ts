import { CommonGraphService } from './commonGraph.service';
import { CommonReportService } from './commonReport.service';
import { ReportConstants } from './reportConstants.service';
import { ReportPrintService } from './reportPrint.service';
import featureToggleModule from 'modules/core/featureToggle';

export default angular
  .module('reports.reportServices', [
    'core.authinfo',
    'core.notifications',
    'core.urlconfig',
    featureToggleModule,
  ])
  .service('CommonGraphService', CommonGraphService)
  .service('CommonReportService', CommonReportService)
  .service('ReportConstants', ReportConstants)
  .service('ReportPrintService', ReportPrintService)
  .name;
