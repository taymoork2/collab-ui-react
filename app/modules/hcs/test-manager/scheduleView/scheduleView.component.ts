import { IToolkitModalService } from 'modules/core/modal';
import { HcsTestManagerService, HtmSchedule } from '../shared';
import { Notification } from 'modules/core/notifications';

export class TaasScheduleViewComponent implements ng.IComponentOptions {
  public controller = TaasScheduleViewCtrl;
  public template = require('./scheduleView.component.html');
}

export class TaasScheduleViewCtrl implements ng.IComponentController {
  public readonly STATE_NEW: string     = 'NEW';
  public readonly STATE_LOADING: string = 'LOADING';
  public readonly STATE_SHOW: string    = 'SHOW';
  public readonly STATE_RELOAD: string  = 'RELOAD';

  public gridOptions;
  public gridColumns;
  public pageState: string = this.STATE_LOADING;
  public backState = 'taasSuites';
  public schedule: HtmSchedule[] = [];
  private scheduleListData;

  /* @ngInject */
  constructor(
    private HcsTestManagerService: HcsTestManagerService,
    private Notification: Notification,
    private $state: ng.ui.IStateService,
    private $log: ng.ILogService,
    public $modal: IToolkitModalService,
    public $translate: ng.translate.ITranslateService,
    public $q: ng.IQService,
    ) {}

  public $onInit(): void {
    this.scheduleListData = [];
    this.initUIGrid();
    this.HcsTestManagerService.getSchedules()
    .then(schedules => {
      if (schedules.length === 0) {
        this.pageState = this.STATE_NEW;
      } else {
        this.pageState = this.STATE_SHOW;
        for (const i of schedules) {
          const cronVal = i.schedule;
          let cronValArray = [] as string[];
          cronValArray = cronVal.split(' ');
          let min = cronValArray[0];
          if (min.length < 2) {
            min = '0' + min;
          }
          let hour = cronValArray[1];
          if (hour.length < 2) {
            hour = '0' + hour;
          }
          const day = cronValArray[3];
          let month = cronValArray[2];
          month = this.convertMonth(month);
          if (day === '*') {
            i.schedule = 'Daily at ' + hour + ':' + min;
          } else {
            i.schedule = month + ' ' + day + ', at ' + hour + ':' + min;
          }
        }
        this.scheduleListData = schedules;
        this.gridOptions.data = schedules;
      }
    }).catch(() => this.handleFailures());
  }

  public initUIGrid() {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'name',
        displayName: 'scheduleName',
        width: '30%',
        sort: {
          direction: 'asc',
        },
      }, {
        field: 'schedule',
        displayName: 'scheduledDate',
        width: '15%',
        headerCellClass: 'align-center',
      }, {
        field: 'scheduleEntities',
        displayName: 'scheduledSuite',
        width: '45%',
        headerCellClass: 'align-center',
      },  {
        field: 'action',
        displayName: 'actionHeader',
        width: '10%',
        cellTemplate: require('./templates/actions.tpl.html'),
        enableSorting: false,
      },
    ];
    // post-processing of columnDefs array
    _.forEach(columnDefs, (o) => {
      o.displayName = this.$translate.instant('hcs.taas.scheduleView.' + o.displayName);
    });

    this.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: this,
      rowHeight: 56,
      onRegisterApi: function (gridApi) {
        this.gridApi = gridApi;
      },
      multiFields: {
      },
      columnDefs: this.gridColumns,
    };

    this.gridColumns = columnDefs;
    this.gridOptions.columnDefs = columnDefs;
    this.gridOptions.data = this.scheduleListData;
  }


  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === this.STATE_LOADING) {
      this.pageState = this.STATE_RELOAD;
    }
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }

  public createSchedule(): void {
    this.$log.info('');
  }

  public runSchedule(scheduled: HtmSchedule): void {
    const schedule = new HtmSchedule;
    if (scheduled.id) {
      schedule.testSuiteMap = scheduled.testSuiteMap;
      schedule.isImmediate = true;
      schedule.name = scheduled.name + '_COPY';
    }
    this.HcsTestManagerService.createSchedule(schedule),
    this.Notification.success('hcs.taas.suite.successRun', undefined, 'hcs.taas.suite.successTitle');
  }

  public convertMonth(month: string): string {
    switch (month) {
      case '1': { month = 'January'; break; }
      case '2': { month = 'February'; break; }
      case '3': { month = 'March'; break; }
      case '4': { month = 'April'; break; }
      case '5': { month = 'May'; break; }
      case '6': { month = 'June'; break; }
      case '7': { month = 'July'; break; }
      case '8': { month = 'August'; break; }
      case '9': { month = 'September'; break; }
      case '10': { month = 'October'; break; }
      case '11': { month = 'November'; break; }
      case '12': { month = 'December'; break; }
    }
    return month;
  }

}
