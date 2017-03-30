import { CommonGraphService } from './commonGraph.service';
import { CommonReportService } from './commonReport.service';
import { ReportConstants } from './reportConstants.service';
import { ReportPrintService } from './reportPrint.service';

export default angular
  .module('reports.reportServices', [
    'core.authinfo',
    'core.chartColors',
    'core.notifications',
    'core.urlconfig',
  ])
  .service('CommonGraphService', CommonGraphService)
  .service('CommonReportService', CommonReportService)
  .service('ReportConstants', ReportConstants)
  .service('ReportPrintService', ReportPrintService)
  .name;
