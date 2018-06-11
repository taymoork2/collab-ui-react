import { Analytics } from 'modules/core/analytics';
import { MeetingExportService } from './meeting-export.service';
import { PartnerSearchService } from 'modules/core/partnerReports/webexReports/diagnostic/partner-search.service';
import { SearchService } from './searchService';

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
    private PartnerSearchService: PartnerSearchService,
    private SearchService: SearchService,
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
    const dataStoreService = this.getDataStoreService(this.serviceType);
    this.MeetingExportService.generateMeetingReport(dataStoreService)
      .then((meetingReport) => {
        this.reportData = meetingReport;
      });
  }

  private getDataStoreService(serviceType: string): PartnerSearchService | SearchService {
    return (serviceType === SERVICE_TYPE.PARTNER) ? this.PartnerSearchService : this.SearchService;
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
