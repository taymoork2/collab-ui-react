import { MeetingExportService } from './meeting-export.service';
import './_meeting-export.scss';

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

  private downloadAnchor: JQuery;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private MeetingExportService: MeetingExportService,
  ) {
    this.anchorText = this.$translate.instant('webexReports.meetingExport.btnTitle');
    this.tooltipMessage = this.$translate.instant('webexReports.meetingExport.tooltipMessage');
  }

  public $postLink() {
    this.downloadAnchor = $(this.$element.find('a')[0]);
  }

  public $onInit() {
    this.filename = this.filename || this.defaultFileName;
    this.exportJSON = this.beginExportJSON;
  }

  private beginExportJSON(): void {
    if (this.analyticsEventname) {
      this.Analytics.trackEvent(this.analyticsEventname);
    }

    this.downloadAnchor.attr('disabled', 'disabled');
    this.MeetingExportService.generateMeetingReport()
      .then((meetingReport) => {
        this.reportData = meetingReport;
      });
  }

  public restoreToOriginalState(): void {
    this.reportData = '';
    this.downloadAnchor.removeAttr('disabled');
  }
}

export class MeetingExportComponent implements ng.IComponentOptions {
  public template = require('./meeting-export.component.html');
  public controller = MeetingExportController;
  public bindings = {
    filename: '@',
    anchorText: '@',
    analyticsEventname: '@',
  };
}
