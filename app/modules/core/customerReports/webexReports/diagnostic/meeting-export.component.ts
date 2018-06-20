import { Analytics } from 'modules/core/analytics';
import { MeetingExportService } from './meeting-export.service';
import { WebexReportsUtilService } from 'modules/core/partnerReports/webexReports/diagnostic/webex-reports-util.service';

export enum SERVICE_TYPE {
  PARTNER = 'PARTNER',
}
class MeetingExportController implements ng.IComponentController {

  public type: string;
  public filename: string;
  public anchorText: string;
  public analyticsEventname: string;

  public tooltipMessage: string;
  public downloading = false;
  public downloadingMessage = '';
  public exportJSON: Function;
  public defaultFileName = 'exported_file.json';
  public reportData: string;
  public serviceType: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Analytics: Analytics,
    private MeetingExportService: MeetingExportService,
    private WebexReportsUtilService: WebexReportsUtilService,
  ) {
    this.anchorText = this.$translate.instant('webexReports.meetingExport.btnTitle');
    this.tooltipMessage = this.$translate.instant('webexReports.meetingExport.tooltipMessage');
  }

  public $onInit() {
    this.filename = this.filename || this.defaultFileName;
    this.exportJSON = this.beginExportJSON;
  }

  private beginExportJSON(): void {
    if (this.analyticsEventname) {
      this.Analytics.trackEvent(this.analyticsEventname);
    }

    this.downloading = true;
    this.MeetingExportService.generateMeetingReport(this.WebexReportsUtilService)
      .then((meetingReport) => {
        this.reportData = meetingReport;
      });
  }

  public restoreToOriginalState(): void {
    this.reportData = '';
    this.downloading = false;
  }
}

export class MeetingExportComponent implements ng.IComponentOptions {
  public template = require('./meeting-export.component.html');
  public controller = MeetingExportController;
  public bindings = {
    filename: '@',
    anchorText: '@',
    analyticsEventname: '@',
    serviceType: '@',
  };
}
