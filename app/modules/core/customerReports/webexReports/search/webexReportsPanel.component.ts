import './_search.scss';
import { SearchService } from './searchService';

class WebexReportsPanel implements ng.IComponentController {

  public data: Object;
  public loading = true;
  public overview: Object;
  public conferenceID: Number;

  /* @ngInject */
  public constructor(
    private $state: ng.ui.IStateService,
    private SearchService: SearchService,
    private $translate: ng.translate.ITranslateService,
  ) {
    const wm: any = this.SearchService.getStorage('webexMeeting');
    this.overview = {
      status: wm.status,
      status_: wm.status_,
      meetingName: wm.meetingName,
      meetingType: wm.meetingType,
      meetingNumber: wm.meetingNumber,
      date: this.SearchService.formateDate(wm.conferenceDate),
    };
    this.conferenceID = wm.conferenceID;
  }

  public $onInit() {
    this.getMeeting();
    this.$state.current.data.displayName = this.$translate.instant('common.overview');
  }

  public showDetailMore() {
    this.$state.go('webexReportsPanel.more');
  }

  private getMeeting() {
    this.SearchService.getMeeting(this.conferenceID)
      .then((res) => {
        this.loading = false;
        const data: any  = res;

        data.session.startTime_ = this.SearchService.formateDate(data.session.startTime);
        data.session.createTime_ = this.SearchService.formateDate(data.session.createTime);
        data.session.endTime_ = data.session.endTime ? this.SearchService.formateDate(data.session.endTime) : '';

        data.features_ = _.map(data.features, (val: string, key: string) => {
          const val_ = val ? 'yes' : 'no';
          return { key: this.$translate.instant('webexReports.meetingFeatures.' + key), val: this.$translate.instant('common.' + val_), class: val_ === 'yes' };
        });

        data.connection_ = _.map(data.connection, (val: string, key: string) => {
          return { key: this.$translate.instant('webexReports.connectionFields.' + key), val: this.$translate.instant('common.' + val), class: val === 'yes' };
        });

        this.data = data;
      });
  }
}

export class CustWebexReportsPanelComponent implements ng.IComponentOptions {
  public controller = WebexReportsPanel;
  public templateUrl = 'modules/core/customerReports/webexReports/search/webexReportsPanel.html';
}
