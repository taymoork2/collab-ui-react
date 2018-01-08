import { IToolkitModalService } from 'modules/core/modal';
import { HcsTestManagerService, HtmBuildingBlocks, HtmSuite, HtmTest, HtmSchedule } from 'modules/hcs/test-manager/shared';
import { CardUtils } from 'modules/core/cards';
import { State } from 'modules/hcs/test-manager/taskManager.const';

export class TaasTestViewComponent implements ng.IComponentOptions {
  public controller = TaasTestViewCtrl;
  public template = require('./taasTestView.component.html');
  public bindings: {
    suite: '<',
  };
}

export class TaasTestViewCtrl implements ng.IComponentController {
  public readonly STATE_NEW = State.New;
  public readonly STATE_LOADING = State.Loading;
  public readonly STATE_RELOAD = State.Reload;
  public readonly STATE_SHOW = State.Show;
  public tests: HtmTest[] = [];
  public pageState: State = State.Loading;
  public currentTest: HtmTest;
  public suite: HtmSuite;
  public backState= 'taasSuites';
  public schedules: HtmSchedule[] =  [];
  public loadedTest: HtmTest[];
  public blocks: HtmBuildingBlocks[] = [];

  /* @ngInject */
  constructor(
    public HcsTestManagerService: HcsTestManagerService,
    public CardUtils: CardUtils,
    public $stateParams: ng.ui.IStateParamsService,
    public $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    public $q: ng.IQService,
    public $log: ng.ILogService,
    ) {}

  public $onInit(): void {
    this.suite = this.$stateParams.suite;

    this.HcsTestManagerService.getTests(this.suite).then((tests: HtmTest[]) => {
      this.tests = tests;
      if (_.isEmpty(this.tests)) {
        this.pageState = State.New;
      } else {
        this.pageState = State.Show;
        for (let i: number = 0; i < this.tests.length; i++) {
          this.HcsTestManagerService.getTest(this.suite, this.tests[i]);
        }
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());

    this.HcsTestManagerService.getSchedules().then((schedules: HtmSchedule[]) => {
      this.schedules = schedules;
    });
    this.HcsTestManagerService.getBlocks().then((blocks: HtmBuildingBlocks[]) => {
      this.blocks = blocks;
    });
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === State.Loading && this.tests.length === 0) {
      this.pageState = State.Reload;
    }
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public reload(): void {
    this.$state.go(this.$state.current, {}, {
      reload: true,
    });
  }

  public addTest(): void {
    const test: HtmTest = new HtmTest();
    test.name = 'Paul\'s Test';
    test.index = 1;
    this.HcsTestManagerService.createTest(this.suite, test).then(id => this.$log.info(id));
  }

  public runSuiteAction(test): void {
    const schedule = new HtmSchedule;
    if (test.id) {
      schedule.testSuiteMap = test.id;
      schedule.isImmediate = true;
      schedule.name = test.name;
    }
    this.HcsTestManagerService.createSchedule(schedule);
  }
}
