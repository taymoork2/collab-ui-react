import './_search.scss';
import * as moment from 'moment';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

const DATERANGE = 6;
export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class WebexReportsSearch implements ng.IComponentController {
  public gridData;
  public data: any;
  public gridOptions: {};
  public endDate: string;
  public startDate: string;
  public searchStr: string;
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
    private $scope: IGridApiScope,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private SearchService: SearchService,
    private $templateCache: ng.ITemplateCacheService,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.gridData = [];
    this.errMsg = { search: '', datePicker: '' };
  }

  public $onInit(): void {
    this.initDateRange();
    this.setGridOptions();
    this.$scope.$emit('selectEnable', false);
  }

  public showDetail(item) {
    this.SearchService.setStorage('webexMeeting', item);
    this.$state.go('webexReportsPanel', {}, { reload: true });
  }

  public onKeySearch() {
    this.startSearch();
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
    this.errMsg.datePicker = '';
    if (this.startDate === this.storeData.startDate && this.endDate === this.storeData.endDate) {
      return ;
    }
    if (moment(this.startDate).unix() > moment(this.endDate).unix()) {
      this.errMsg.datePicker = this.$translate.instant('webexReports.end-date-tooltip');
      this.storeData.endDate = this.endDate;
      this.storeData.startDate = this.startDate;
      this.gridData = [];
      this.flag = false;
      return ;
    }
    this.errMsg.datePicker = '';
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    this.startSearch();
  }

  private initDateRange() {
    this.today = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract('days', DATERANGE).format('YYYY-MM-DD');

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
    this.errMsg.search = '';
    this.storeData.searchStr = this.searchStr;
    if (this.searchStr === '') {
      this.gridData = [];
      return ;
    }

    if (!emailReg.test(this.searchStr) && !digitaReg.test(this.searchStr)) {
      this.errMsg.search = this.$translate.instant('webexReports.searchError');
      this.gridData = [];
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
          item.startTime = moment(item.startTime).format('MMMM Do, YYYY h:mm:ss A');
          item.endTime = item.endTime ?  moment(item.endTime).format('MMMM Do, YYYY h:mm:ss A') : '';
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
      width: '20%',
      sortable: true,
      cellTooltip: true,
      field: 'startTime',
      displayName: this.$translate.instant('webexReports.searchGridHeader.startTime'),
    }, {
      width: '12%',
      sortable: true,
      field: 'status_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.status'),
      cellTemplate: this.$templateCache.get('modules/core/customerReports/webexReports/search/webexMeetingStatus.html'),
    }, {
      cellTooltip: true,
      field: 'meetingName',
      displayName: this.$translate.instant('webexReports.searchGridHeader.meetingName'),
    }, {
      width: '16%',
      cellTooltip: true,
      field: 'conferenceID',
      displayName: this.$translate.instant('webexReports.searchGridHeader.conferenceID'),
    }, {
      width: '20%',
      field: 'endTime',
      cellTooltip: true,
      displayName: this.$translate.instant('webexReports.searchGridHeader.endTime'),
    }];
    this.gridOptions = {
      rowHeight: 44,
      data: '$ctrl.gridData',
      multiSelect: false,
      appScopeProvider: this,
      columnDefs: columnDefs,
      enableRowSelection: true,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      enableVerticalScrollbar: false,
      enableHorizontalScrollbar: false,
      onRegisterApi: (gridApi) => {
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.showDetail(row.entity);
        });
      },
    };
  }
}

export class CustWebexReportsSearchComponent implements ng.IComponentOptions {
  public controller = WebexReportsSearch;
  public templateUrl = 'modules/core/customerReports/webexReports/search/webexReportsSearch.html';
}
