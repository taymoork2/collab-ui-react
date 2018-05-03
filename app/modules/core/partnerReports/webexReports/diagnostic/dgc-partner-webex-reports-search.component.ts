import * as moment from 'moment';
import { KeyCodes } from 'modules/core/accessibility';
import { Notification } from 'modules/core/notifications';
import { IMeetingDetail } from './partner-search.interfaces';
import { SearchStorage } from './partner-meeting.enum';
import { CustomerSearchService } from './customer-search.service';
import { PartnerSearchService } from './partner-search.service';
import { ProPackService } from 'modules/core/proPack/proPack.service';
import { WebexReportsUtilService } from './webex-reports-util.service';

interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

interface IDateRange {
  start?: {
    lastEnableDate: string,
    firstEnableDate: string,
  };
  end?: {
    lastEnableDate: string,
    firstEnableDate: string,
  };
}

enum LimitDays {
  OneWeek = 7,
  OneMonth = 30,
}

class DgcPartnerWebexReportsSearchController implements ng.IComponentController {
  public gridData: IMeetingDetail[];
  public gridOptions: uiGrid.IGridOptions = {};
  public endDate: string;
  public timeZone: string;
  public startDate: string;
  public searchStr: string;
  public errMsg: { search?: string, datePicker?: string, datePickerAriaLabel?: string, ariaLabel?: string } = {};
  public dateRange: IDateRange = {};
  public storeData: { searchStr?: string, startDate?: string, endDate?: string } = {};
  public isLoadingShow = false;
  public isDatePickerShow = false;

  private today: string;
  private email: string;
  private meetingNumber: string;
  public isPartnerRole = true;
  private dataService: (PartnerSearchService | CustomerSearchService);

  /* @ngInject */
  public constructor(
    private $scope: IGridApiScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private Notification: Notification,
    private CustomerSearchService: CustomerSearchService,
    private FeatureToggleService,
    private PartnerSearchService: PartnerSearchService,
    private ProPackService: ProPackService,
    private WebexReportsUtilService: WebexReportsUtilService,
  ) {
    this.gridData = [];
    this.timeZone = this.WebexReportsUtilService.getTzGuess('');
    this.errMsg = { search: '', datePicker: '' };
    this.searchStr = this.WebexReportsUtilService.getStorage(SearchStorage.SEARCH_STRING);

    this.dataService = this.PartnerSearchService;
    if (this.$state.current.name === 'reports.webex-metrics.diagnostics' || this.$state.current.name === 'support.meeting') {
      this.isPartnerRole = false;
      this.dataService = this.CustomerSearchService;
    }
    this.WebexReportsUtilService.setStorage(SearchStorage.PARTNER_ROLE, this.isPartnerRole);
  }

  public $onInit(): void {
    this.setGridOptions();
    if (this.isPartnerRole) {
      this.initPartnerRoleData();
    } else {
      this.initCustomerRoleData();
    }
  }

  private initCustomerRoleData(): void {
    this.ProPackService.hasProPackEnabled().then((isProPackEnabled: boolean): void => {
      if (isProPackEnabled) {
        this.initCustomerRoleMeetingList();
      } else {
        this.$state.go('login');
      }
    });
  }

  private initPartnerRoleData(): void {
    this.FeatureToggleService.diagnosticPartnerF8193TroubleshootingGetStatus()
      .then((isSupport: boolean) => {
        if (isSupport) {
          this.initPartnerRoleMeetingList();
        } else {
          this.FeatureToggleService.atlasPartnerWebexReportsGetStatus()
            .then((isPartnerWebexEnabled: boolean): void => {
              if (!isPartnerWebexEnabled) {
                this.$state.go('login');
              } else {
                this.initPartnerRoleMeetingList();
              }
            });
        }
      });
  }

  private initCustomerRoleMeetingList () {
    this.FeatureToggleService.diagnosticF8234QueryRangeGetStatus()
      .then((isSupport: boolean) => {
        this.initDateRange(isSupport);
        this.Analytics.trackEvent(this.dataService.featureName, {});
        if (this.searchStr) {
          this.startSearch();
        }
      });
  }

  private initPartnerRoleMeetingList () {
    this.FeatureToggleService.diagnosticPartnerF8234QueryRangeGetStatus()
      .then((isSupport: boolean) => {
        this.initDateRange(isSupport);
        this.Analytics.trackEvent(this.dataService.featureName, {});
        if (this.searchStr) {
          this.startSearch();
        }
      });
  }

  public showDetail(item: IMeetingDetail): void {
    this.WebexReportsUtilService.setStorage(SearchStorage.WEBEX_MEETING, item);
    this.WebexReportsUtilService.setStorage(SearchStorage.SEARCH_STRING, this.searchStr);

    if (this.isPartnerRole) {
      this.$state.go('partnerreports.dgc.meetingdetail', { cid: item.conferenceID });
    } else {
      this.$state.go('dgc.tab.meetingdetail', { cid: item.conferenceID });
    }
  }

  public onKeySearch($event: KeyboardEvent): void {
    if ($event.which === KeyCodes.ENTER) {
      this.startSearch();
    }
  }

  public onBlur(): void {
    if (this.searchStr === this.storeData.searchStr) {
      return;
    }
    this.startSearch();
  }

  public onChangeDate(): void {
    this.dateRange.end = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    if (this.startDate === this.storeData.startDate && this.endDate === this.storeData.endDate) {
      return;
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
    this.WebexReportsUtilService.setStorage(SearchStorage.TIME_ZONE, this.timeZone);
    this.gridData = _.map(this.gridData, (row: IMeetingDetail) => {
      row.endTime_ = this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(row.endTime);
      row.startTime_ = this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(row.startTime);
      return row;
    });
  }

  public onClickClearIcon(): void {
    this.searchStr = '';
    this.storeData.searchStr = '';
    this.gridData = [];
  }

  private initDateRange(isSupportQueryRange: boolean): void {
    const calendarLimitDays = isSupportQueryRange ? LimitDays.OneMonth : LimitDays.OneWeek;
    this.today = moment().format('YYYY-MM-DD');
    this.startDate = moment().subtract(calendarLimitDays - 1, 'days').format('YYYY-MM-DD');
    this.endDate = this.today;
    this.storeData.endDate = this.endDate;
    this.storeData.startDate = this.startDate;
    this.dateRange.start = {
      lastEnableDate: this.endDate,
      firstEnableDate: this.startDate,
    };
    this.dateRange.end = this.dateRange.start;
  }

  private isValidEmail(testStr: string): boolean {
    const USER_COMPONENT = '^[\\w\\d]([\\w\\d.-])+';
    const DOMAIN_PREFIX = '([\\w\\d-])+';
    const DOT = '\\.';
    const DOMAIN_SUFFIX = '([\\w\\d-]){2,}';
    const emailRegex = new RegExp(`${USER_COMPONENT}@${DOMAIN_PREFIX}${DOT}${DOMAIN_SUFFIX}`);
    return emailRegex.test(testStr);
  }

  private isValidDigitCode(testStr: string): boolean {
    const DIGITS_8_TO_10 = '^[\\d]{8,10}';
    const DIGITS_1_TO_4 = '[\\d]{1,4}';
    const OPTIONAL_SPACE = '[\\s]?';
    const ACCEPTABLE_CODE_OPTION_1 = `${DIGITS_8_TO_10}`;
    const ACCEPTABLE_CODE_OPTION_2 = `(${DIGITS_1_TO_4}${OPTIONAL_SPACE}){3}`;
    const digitalCodeRegex = new RegExp(`^(${ACCEPTABLE_CODE_OPTION_1}|${ACCEPTABLE_CODE_OPTION_2})$`);
    return digitalCodeRegex.test(testStr);
  }

  private startSearch(): void {
    this.gridData = [];
    this.errMsg.ariaLabel = '';
    this.errMsg.search = '';
    this.storeData.searchStr = this.searchStr;
    const isValidEmail = this.isValidEmail(this.searchStr);
    const isValidDigital = this.isValidDigitCode(this.searchStr);
    if (!isValidEmail && !isValidDigital) {
      this.errMsg.ariaLabel = this.$translate.instant('webexReports.searchError');
      this.errMsg.search = `<i class="icon icon-warning"></i> ${this.errMsg.ariaLabel}`;
      return;
    }

    if (moment(this.startDate).unix() > moment(this.endDate).unix()) {
      return;
    }

    if (isValidEmail) {
      this.email = this.searchStr;
      this.meetingNumber = '';
    }

    if (isValidDigital) {
      this.email = '';
      this.meetingNumber = this.searchStr;
    }
    this.setGridData();
  }

  private setGridData(): void {
    const endDate = this.isDatePickerShow ? moment(this.endDate + ' ' + moment().format('HH:mm:ss')).utc().format('YYYY-MM-DD') : this.today;
    const startDate = this.isDatePickerShow ? moment(this.startDate + ' ' + moment().format('HH:mm:ss')).utc().format('YYYY-MM-DD') : this.startDate;
    const data = {
      endDate: endDate,
      email: this.email,
      startDate: startDate,
      meetingNumber: this.meetingNumber.replace(/\s/g, ''),
    };
    this.gridData = [];
    this.isLoadingShow = true;

    this.dataService.getMeetings(data)
      .then((res: IMeetingDetail[]) => {
        const meetingList = _.map(res, (meeting: IMeetingDetail) => {
          meeting.status_ = this.WebexReportsUtilService.getMeetingStatus(meeting.status);
          meeting.duration_ = this.WebexReportsUtilService.getDuration(meeting.duration);
          meeting.endTime_ = this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(meeting.endTime);
          meeting.startTime_ = this.WebexReportsUtilService.dateToTimezoneAdjustedUtc(meeting.startTime);
          return meeting;
        });
        this.gridData = meetingList;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      })
      .finally(() => {
        this.isLoadingShow = false;
      });
  }

  private setGridOptions(): void {
    const columnDefs: uiGrid.IColumnDef[] = [{
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
      cellTooltip: true,
      field: 'startTime_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.startTime'),
    }, {
      width: '9%',
      field: 'duration_',
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
      headerCellTemplate: require('./number-participants-cell-template.html'),
    }, {
      width: '7%',
      field: 'status_',
      displayName: this.$translate.instant('webexReports.searchGridHeader.status'),
      cellTemplate: require('./webex-meeting-status.html'),
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
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row: {entity: IMeetingDetail}) => {
          this.showDetail(row.entity);
        });
      },
    };
  }
}

export class DgcPartnerWebexReportsSearchComponent implements ng.IComponentOptions {
  public controller = DgcPartnerWebexReportsSearchController;
  public template = require('./dgc-partner-webex-reports-search.html');
}
