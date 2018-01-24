import { IToolkitModalService } from 'modules/core/modal';
import { CardUtils } from 'modules/core/cards';
import { Notification } from 'modules/core/notifications';
import { IRSuiteMap } from 'modules/hcs/task-manager';
import {
  TaskManagerService, HtmSuite, HtmTest, HtmSchedule, State,
} from '../shared';

export class SuiteViewComponent implements ng.IComponentOptions {
  public controller = SuiteViewCtrl;
  public template = require('./suite-view.component.html');
  public bindings = {
    suiteId: '<',
  };
}
export class SuiteViewCtrl implements ng.IComponentController {
  public readonly STATE_NEW = State.New;
  public readonly STATE_LOADING = State.Loading;
  public readonly STATE_RELOAD = State.Reload;
  public readonly STATE_SHOW = State.Show;
  public suites: HtmSuite[] = [];
  public pageState: State = State.Loading;
  public currentSuite: HtmSuite;
  public tests: HtmTest[] = [];
  public backState = 'services-overview';
  public suite: HtmSuite;
  public customerId: '';

  /* @ngInject */
  constructor(
    public HcsTestManagerService: TaskManagerService,
    public CardUtils: CardUtils,
    public $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    public $q: ng.IQService,

    private Notification: Notification,
    private Authinfo,
    ) {}

  public $onInit(): void {
    this.HcsTestManagerService.getSuites().then((suites: HtmSuite[]) => {
      this.suites = suites;
      this.customerId = this.Authinfo.getOrgId();
      if (this.suites.length === 0) {
        this.pageState = State.New;
      } else {
        this.pageState = State.Show;
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === State.Loading && this.suites.length === 0) {
      this.pageState = State.Reload;
    }
  }


  /* This function does an in-page search for the string typed in search box*/
  public searchData(searchStr: string): void {
    this.HcsTestManagerService.getSuites().then((result) => {
      this.suites = this.HcsTestManagerService.filterSuites(result, searchStr);
    });
    this.reInstantiateMasonry();
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }

  public createSuite(): void {
    this.$state.go('taasServiceManager.suiteCreate');
  }

  // Run selected Test Suite.
  public runSuiteAction(suite): void {
    const schedule: HtmSchedule = new HtmSchedule;
    if (suite.id) {
      schedule.testSuiteMap = [{ id: suite.id }] as IRSuiteMap[];
      schedule.isImmediate = true;
      schedule.name = suite.name;
    }
    this.HcsTestManagerService.createSchedule(schedule);
    this.Notification.success('hcs.taas.suite.successRun', undefined, 'hcs.taas.suite.successTitle');
  }

  public resources(): void {
    this.$state.go('taasResource');
  }

  public editSuite(suite: HtmSuite): void {
    this.$state.go('taasTaskView', { suite: suite });
  }

  public viewSchedule(): void {
    this.$state.go('taasSchedule');
  }

  public viewResults(): void {
    this.$state.go('taasResults');
  }

  public scheduler(suite: HtmSuite, customerId): void {
    this.$state.go('taasServiceManager.scheduler', { suite: suite, customerId: customerId });
  }

  // TODO: public copySuite(suite: HtmSuite): void {
  // }

  public deleteSuite(suite: HtmSuite): void {
    this.HcsTestManagerService.deleteSuite(suite).then(() => {
      this.reload();
    });
  }
  // TODO (shacasey): Create a validate for deleting a Suite

}
