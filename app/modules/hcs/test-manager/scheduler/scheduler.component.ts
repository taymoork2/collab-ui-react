//import { IToolkitModalService } from 'modules/core/modal';
import { TaskManagerService, HtmSuite, HtmSchedule } from 'modules/hcs/test-manager/shared';
import { DateObj } from 'modules/hcs/test-manager/scheduler';
import { Notification } from 'modules/core/notifications';
import { IRSuiteMap } from 'modules/hcs/test-manager';

class SchedulerController implements ng.IComponentController {
  public suite: HtmSuite;
  public customerId: '';
  public schedules: HtmSchedule[] = [];
  public close: Function;
  public dismiss: Function;
  public schedule: HtmSchedule;
  public showConfirmation: boolean;
  public onChangeFn: Function;
  public scheduleType: string;
  public scheduleForm: ng.IFormController;
  public dateObj: DateObj;

  public runDate: string;
  public runTime: string;
  public time: string;

  /* @ngInject */
  constructor(
    //private $translate: ng.translate.ITranslateService,
    public HcsTestManagerService: TaskManagerService,
    public Notification: Notification,
    public $stateParams: ng.ui.IStateParamsService,
    public $state: ng.ui.IStateService,
    public $q: ng.IQService,
    public $log: ng.ILogService,
  ) {}

  public $onInit() {
    this.suite = this.$stateParams.suite;
    this.customerId = this.$stateParams.customerId;
  }

  public onChangeDate() {
    let thisDate;
    let thisTime;
    thisDate = this.runDate.split('-');
    thisTime = this.runTime.split(':');
    this.time = thisTime[1] + ' ' + thisTime[0] + ' ' + thisDate[1] + ' ' +  thisDate[2] + ' *';
  }

  public setScheduleForNow() {
    this.schedule.schedule = '* * * * *';
  }

  public setScheduleForTime() {}

  public validateAndSave(): void {
    const schedule = new HtmSchedule;
    if (this.suite.id) {
      schedule.testSuiteMap.push({
        testsuiteId: this.suite.id,
        index: 1,
      } as IRSuiteMap);
      schedule.name = this.suite.name;
      schedule.schedule = this.time;
      this.dismiss();
    }
    this.HcsTestManagerService.createSchedule(schedule).then(() => {
      this.showConfirmation = true;
    })
    .catch(error => this.Notification.errorResponse(error.data.error.message, 'Recieved an Error'));
  }
}


export class SchedulerComponent implements ng.IComponentOptions {
  public controller = SchedulerController;
  public template = require('modules/hcs/test-manager/scheduler/scheduler.component.html');
  public bindings = {
    suite: '<',
    customerId: '<',
    dismiss: '&',
    close: '&',
  };
}
