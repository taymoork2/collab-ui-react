import './_search.scss';
import * as moment from 'moment';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';
import { KeyCodes } from 'modules/core/accessibility';

const DATERANGE = 6;
export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class WebexReportsSearch implements ng.IComponentController {
  public gridData;
  public data: any;
  public gridOptions: {};
  public endDate: string;
  public timeZone: string;
  public startDate: string;
  public searchStr: any;
  public errMsg: any = {};
  public dateRange: any = {};
  public storeData: any = {};
  public isLoadingShow = false;
  public isDatePickerShow: boolean = false;

  private flag: boolean = true;
  private today: string;
  private email: string;
  private meetingNumber: string;

  /* @ngInject */
  public constructor(
    private Analytics,
    private $scope: IGridApiScope,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private SearchService: SearchService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.gridData = [];
    this.timeZone = this.SearchService.getGuess('');
    this.errMsg = { search: '', datePicker: '' };
    this.searchStr = this.SearchService.getStorage('searchStr');
  }

  public $onInit(): void {
    this.initDateRange();
    this.setGridOptions();
    this.Analytics.trackEvent(this.SearchService.featureName, {});
    if (this.searchStr) {
      this.startSearch();
    }
  }

  public showDetail(item) {
    this.SearchService.setStorage('webexMeeting', item);
    this.SearchService.setStorage('searchStr', this.searchStr);
    this.$state.go('dgc.tab.meetingdetail', { cid: item.conferenceID });
  }

  public onKeySearch($event: KeyboardEvent) {
    if ($event.which === KeyCodes.ENTER) {
      this.startSearch();
    }
  }

  public onBlur() {
    if (this.searchStr === this.storeData.searchStr) {
      return ;
    }
    this.startSearch();
  }

  public onChangeDate() {
    this.dateRange.end = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    if (this.startDate === this.storeData.startDate && this.endDate === this.storeData.endDate) {
      return ;
    }
    this.errMsg.datePicker = '';
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    if (moment(this.startDate).unix() > moment(this.endDate).unix()) {
      this.errMsg.datePicker = '<i class="icon icon-warning"></i> ' + this.$translate.instant('webexReports.end-date-tooltip');
    }
    this.startSearch();
  }

  public onChangeTz(tz: string): void {
    this.timeZone = tz;
    this.SearchService.setStorage('timeZone', this.timeZone);
    _.forEach(this.gridData, (item) => {
      item.endTime_ = this.SearchService.utcDateByTimezone(item.endTime);
      item.startTime_ = this.SearchService.utcDateByTimezone(item.startTime);
    });
  }

  private initDateRange() {
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
    this.errMsg.search = '';
    this.storeData.searchStr = this.searchStr;

    if ((!emailReg.test(this.searchStr) && !digitaReg.test(this.searchStr)) || this.searchStr === '') {
      this.errMsg.search = '<i class="icon icon-warning"></i> ' + this.$translate.instant('webexReports.searchError');
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

    this.SearchService.getMeetings(data)
      .then((res) => {
        _.forEach(res, (item) => {
          item.status_ = this.SearchService.getStatus(item.status);
          item.Duration = this.SearchService.getDuration(item.duration);
          item.endTime_ = this.SearchService.utcDateByTimezone(item.endTime) ;
          item.startTime_ = this.SearchService.utcDateByTimezone(item.startTime);
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
      headerCellTemplate: `<div class="aaaaa" ng-class="{ \'sortable\': sortable }">
      <div class="ui-grid-cell-contents" col-index="renderIndex">
      <span>Number of <br>Participants</span>
      <span ui-grid-visible="col.sort.direction">
      <i ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\': col.sort.direction == desc, \'ui-grid-icon-blank\': !col.sort.direction }"></i>
      </span></div></div>`,
    }, {
      width: '7%',
      sortable: true,
      field: 'status_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.status'),
      cellTemplate: require('modules/core/customerReports/webexReports/diagnostic/webexMeetingStatus.html'),
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
  public template = require('modules/core/customerReports/webexReports/diagnostic/webexReportsSearch.html');
}
