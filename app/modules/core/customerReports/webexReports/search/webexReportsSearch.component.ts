import './_search.scss';
import { SearchService } from './searchService';
import { Notification } from 'modules/core/notifications';

const DATERANGE = 7;
export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class WebexReportsSearch implements ng.IComponentController {
  public gridOptions: {};
  public endDate: string;
  public startDate: string;
  public searchStr: string;

  public errMsg: any = {};
  public dateRange: any = {};
  public storeData: any = {};
  public isLoadingShow = false;
  public isDatePickerShow: boolean = false;

  private gridData: {};
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
    this.errMsg.search = '';
    this.errMsg.datePicker = '';
  }

  public $onInit(): void {
    this.initDateRange();
    this.setGridOptions();
  }

  public showDetail(item) {
    this.SearchService.setStorage('webexMeeting', item);
    this.$state.go('webexReportsPanel', {}, { reload: true });
  }

  public onKeySearch($event) {
    const keycode = window.event ? $event.keyCode : $event.which;
    if (keycode === 13) {
      this.onGetSearch();
    }
  }

  public onBlur() {
    if (this.searchStr === this.storeData.searchStr) {
      return ;
    }
    this.onGetSearch();
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
      return ;
    }
    this.errMsg.datePicker = '';
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    this.onGetSearch();
  }

  private initDateRange() {
    this.today = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract('days', DATERANGE).format('YYYY-MM-DD');

    this.endDate = this.today;
    this.dateRange.start = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    this.dateRange.end = this.dateRange.start;
  }

  private onGetSearch(): void {
    const digitaReg = /^([\d]{8,10}|[\d\s]{10,12})$/;
    const emailReg = /^([\w\d.-])+@([\w\d-])+(.[\w\d-]){2,}/;
    this.errMsg.search = '';
    if (this.searchStr === '') {
      this.gridData = [];
      return ;
    }

    if (!emailReg.test(this.searchStr) && !digitaReg.test(this.searchStr)) {
      this.errMsg.search = this.$translate.instant('webexReports.searchError');
      this.gridData = [];
      return;
    }

    if (emailReg.test(this.searchStr)) {
      this.email = this.searchStr;
      this.meetingNumber = '';
    }

    if (digitaReg.test(this.searchStr) ) {
      this.email = '';
      this.meetingNumber = this.searchStr;
    }
    this.storeData.searchStr = this.searchStr;
    this.getMeetings();
  }

  private getMeetings(): void {
    const endDate = this.isDatePickerShow ? this.endDate : '';
    const startDate = this.isDatePickerShow ? this.startDate : '';

    const data = {
      endDate : endDate,
      email: this.email,
      startDate: startDate,
      meetingNumber: this.meetingNumber,
    };
    this.gridData = [];
    this.isLoadingShow = true;

    this.SearchService.getMeetings(data)
      .then((res) => {
        _.forEach(res, (item) => {
          item.startTime = moment(item.startTime).format('MMMM Do, YYYY h:mm:ss A');
          item.status_ = this.SearchService.getStatus(item.status);
          item.endTime = item.endTime ?  moment(item.endTime).format('MMMM Do, YYYY h:mm:ss A') : '';
        });
        this.gridData = res;
        this.isLoadingShow = false;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
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
      width: '18%',
      sortable: true,
      field: 'status_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.status'),
      cellTemplate: this.$templateCache.get('modules/core/customerReports/webexReports/search/webexMeetingStatus.html'),
    }, {
      width: '24%',
      cellTooltip: true,
      field: 'meetingName',
      displayName: this.$translate.instant('webexReports.searchGridHeader.meetingName'),
    }, {
      width: '22%',
      cellTooltip: true,
      field: 'conferenceID',
      displayName: this.$translate.instant('webexReports.searchGridHeader.conferenceID'),
    }, {
      field: 'endTime',
      cellTooltip: true,
      displayName: this.$translate.instant('webexReports.searchGridHeader.endTime'),
    }];
    this.gridOptions = {
      rowHeight: 44,
      data: '$ctrl.gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      onRegisterApi: (gridApi) => {
        this.$scope.gridApi = gridApi;
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
