import * as moment from 'moment';
import { IAnyDict, IMeetingDetail } from './partner-search.interfaces';
import { KeyCodes } from 'modules/core/accessibility';
import { Notification } from 'modules/core/notifications';
import { PartnerSearchService } from './partner-search.service';

const DATERANGE = 6;
export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class WebexReportsSearch implements ng.IComponentController {
  public gridData;
  public gridOptions: {};
  public endDate: string;
  public timeZone: string;
  public startDate: string;
  public searchStr: any;
  public errMsg: any = {};
  public dateRange: IAnyDict = {};
  public storeData: IAnyDict = {};
  public isLoadingShow = false;
  public isDatePickerShow = false;

  private flag = true;
  private today: string;
  private email: string;
  private meetingNumber: string;

  /* @ngInject */
  public constructor(
    private $log: ng.ILogService,
    private $scope: IGridApiScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private FeatureToggleService,
    private Notification: Notification,
    private PartnerSearchService: PartnerSearchService,
  ) {
    this.gridData = [];
    this.timeZone = this.PartnerSearchService.getGuess('');
    this.errMsg = { search: '', datePicker: '' };
    this.searchStr = this.PartnerSearchService.getStorage('searchStr');
  }

  public $onInit(): void {
    this.FeatureToggleService.atlasPartnerWebexReportsGetStatus()
      .then((isPartnerWebexEnabled: boolean): void => {
        if (!isPartnerWebexEnabled) {
          this.$log.log('webex report for partner webex disabled');
          this.$state.go('login');
        } else {
          this.initDateRange();
          this.setGridOptions();
          this.Analytics.trackEvent(this.PartnerSearchService.featureName, {});
          if (this.searchStr) {
            this.startSearch();
          }
        }
      });
  }

  public showDetail(item: IAnyDict): void {
    this.PartnerSearchService.setStorage('webexMeeting', item);
    this.PartnerSearchService.setStorage('searchStr', this.searchStr);
    this.$state.go('partnerreports.dgc.meetingdetail', { cid: item.conferenceID });
  }

  public onKeySearch($event: KeyboardEvent): void {
    if ($event.which === KeyCodes.ENTER) {
      this.startSearch();
    }
  }

  public onBlur(): void {
    if (this.searchStr === this.storeData.searchStr) {
      return ;
    }
    this.startSearch();
  }

  public onChangeDate(): void {
    this.dateRange.end = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    if (this.startDate === this.storeData.startDate && this.endDate === this.storeData.endDate) {
      return ;
    }
    this.errMsg.datePickerAriaLabel = '';
    this.errMsg.datePicker = '';
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    if (moment(this.startDate).unix() > moment(this.endDate).unix()) {
      this.errMsg.datePickerAriaLabel = this.$translate.instant('webexReports.end-date-tooltip');
      this.errMsg.datePicker = `<i class="icon icon-warning"></i> ${this.errMsg.datePickerAriaLabel}`;
    }
    this.startSearch();
  }

  public onChangeTz(tz: string): void {
    this.timeZone = tz;
    this.PartnerSearchService.setStorage('timeZone', this.timeZone);
    _.forEach(this.gridData, (item) => {
      item.endTime_ = this.PartnerSearchService.utcDateByTimezone(item.endTime);
      item.startTime_ = this.PartnerSearchService.utcDateByTimezone(item.startTime);
    });
  }

  private initDateRange(): void {
    this.today = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract(DATERANGE, 'days').format('YYYY-MM-DD');

    this.endDate = this.today;
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    this.dateRange.start = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    this.dateRange.end = this.dateRange.start;
  }

  private startSearch(): void {
    const digitaReg = /^([\d]{8,10}|([\d]{1,4}[\s]?){3})$/;
    const emailReg = /^[\w\d]([\w\d.-])+@([\w\d-])+\.([\w\d-]){2,}/;

    this.flag = false;
    this.gridData = [];
    this.errMsg.ariaLabel = '';
    this.errMsg.search = '';
    this.storeData.searchStr = this.searchStr;

    if ((!emailReg.test(this.searchStr) && !digitaReg.test(this.searchStr)) || this.searchStr === '') {
      this.errMsg.ariaLabel = this.$translate.instant('webexReports.searchError');
      this.errMsg.search = `<i class="icon icon-warning"></i> ${this.errMsg.ariaLabel}`;
      return ;
    }

    if (moment(this.startDate).unix() > moment(this.endDate).unix()) {
      return ;
    }

    this.flag = true;
    if (emailReg.test(this.searchStr)) {
      this.email = this.searchStr;
      this.meetingNumber = '';
    }

    if (digitaReg.test(this.searchStr) ) {
      this.email = '';
      this.meetingNumber = this.searchStr;
    }
    this.setGridData();
  }

  private setGridData(): void {
    const endDate = this.isDatePickerShow ? moment(this.endDate + ' ' + moment().format('HH:mm:ss')).utc().format('YYYY-MM-DD') : '';
    const startDate = this.isDatePickerShow ? moment(this.startDate + ' ' + moment().format('HH:mm:ss')).utc().format('YYYY-MM-DD') : '';
    const data = {
      endDate : endDate,
      email: this.email,
      startDate: startDate,
      meetingNumber: this.meetingNumber.replace(/\s/g, ''),
    };
    this.gridData = [];
    this.isLoadingShow = true;

    this.PartnerSearchService.getMeetings(data)
      .then((res: IMeetingDetail[]) => {
        _.forEach(res, (item: any) => {
          item.status_ = this.PartnerSearchService.getStatus(item.status);
          item.Duration = this.PartnerSearchService.getDuration(item.duration);
          item.endTime_ = this.PartnerSearchService.utcDateByTimezone(item.endTime) ;
          item.startTime_ = this.PartnerSearchService.utcDateByTimezone(item.startTime);
        });
        this.isLoadingShow = false;
        this.gridData = this.flag ? res : [];
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        this.isLoadingShow = false;
      });
  }

  private setGridOptions(): void {
    const columnDefs = [{
      width: '13%',
      cellTooltip: true,
      field: 'conferenceID',
      displayName: this.$translate.instant('webexReports.searchGridHeader.conferenceID'),
    }, {
      width: '14%',
      field: 'meetingNumber',
      displayName: this.$translate.instant('webexReports.meetingNumber'),
    }, {
      cellTooltip: true,
      field: 'meetingName',
      displayName: this.$translate.instant('webexReports.searchGridHeader.meetingName'),
    }, {
      width: '16%',
      sortable: true,
      cellTooltip: true,
      field: 'startTime_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.startTime'),
    }, {
      width: '9%',
      field: 'Duration',
      cellClass: 'text-right',
      displayName: this.$translate.instant('webexReports.duration'),
    }, {
      width: '12%',
      field: 'hostName',
      displayName: this.$translate.instant('webexReports.hostName'),
    }, {
      width: '8%',
      cellClass: 'text-center',
      field: 'numberOfParticipants',
      headerCellTemplate: require('modules/core/partnerReports/webexReports/diagnostic/number-participants-cell-template.html'),
    }, {
      width: '7%',
      sortable: true,
      field: 'status_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.status'),
      cellTemplate: require('modules/core/partnerReports/webexReports/diagnostic/webex-meeting-status.html'),
    }];

    this.gridOptions = {
      rowHeight: 45,
      data: '$ctrl.gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableRowSelection: true,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      enableVerticalScrollbar: 0,
      enableHorizontalScrollbar: 0,
      onRegisterApi: (gridApi) => {
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.showDetail(row.entity);
        });
      },
    };
  }
}

export class DgcWebexReportsSearchComponent implements ng.IComponentOptions {
  public controller = WebexReportsSearch;
  public template = require('modules/core/partnerReports/webexReports/diagnostic/webex-reports-search.html');
}
