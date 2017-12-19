import { IToolkitModalService } from 'modules/core/modal';
import { HcsTestManagerService, HtmSuite, HtmTest, HtmSchedule } from 'modules/hcs/test-manager/shared';
import { CardUtils } from 'modules/core/cards';
import { Notification } from 'modules/core/notifications';
import { IRSuiteMap } from 'modules/hcs/test-manager';
const STATE_LOADING: string = 'STATE_LOADING';
const STATE_SHOW_SUITES: string = 'STATE_SHOW_SUITES';
const STATE_RELOAD: string = 'STATE_RELOAD';
const STATE_NEW_SUITE: string = 'STATE_NEW_SUITE';

export class TaasSuiteViewCtrl implements ng.IComponentController {
  public suites: HtmSuite[] = [];
  public pageState: string = STATE_LOADING;
  public currentSuite: HtmSuite;
  public tests: HtmTest[] = [];
  public backState = 'services-overview';
  public suite: HtmSuite;
  public customerId: '';

  /* @ngInject */
  constructor(
    public HcsTestManagerService: HcsTestManagerService,
    public CardUtils: CardUtils,
    public $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    private Notification: Notification,
    public $q: ng.IQService,
    private Authinfo,
    ) {}

  public $onInit(): void {
    this.HcsTestManagerService.getSuites().then((suites: HtmSuite[]) => {
      this.suites = suites;
      this.customerId = this.Authinfo.getOrgId();
      if (this.suites.length === 0) {
        this.pageState = STATE_NEW_SUITE;
      } else {
        this.pageState = STATE_SHOW_SUITES;
      }
      this.reInstantiateMasonry();
    }).catch(() => this.handleFailures());
  }

  public handleFailures(): void {
    this.showReloadPageIfNeeded();
  }

  public showReloadPageIfNeeded(): void {
    if (this.pageState === STATE_LOADING && this.suites.length === 0) {
      this.pageState = STATE_RELOAD;
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

  public addSuite(): void {
    const suite: HtmSuite = new HtmSuite();
    suite.name = 'Aggie Suite';
    this.HcsTestManagerService.createSuite(suite);
    //this.$state.go('taasTest');
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
    this.$state.go('taasTest', { suite: suite });
  }

  public viewSchedule(): void {
    this.$state.go('taasSchedule');
  }

  public scheduler(suite: HtmSuite, customerId): void {
    this.$state.go('taasServiceManager.scheduler', { suite: suite, customerId: customerId });
  }

  // public copySuite(suite: HtmSuite): void {
  // }

  public deleteSuite(suite: HtmSuite): void {
    this.HcsTestManagerService.deleteSuite(suite);
    this.reload();
  }
}

export class TaasSuiteViewComponent implements ng.IComponentOptions {
  public controller = TaasSuiteViewCtrl;
  public template = require('./taasSuiteView.component.html');
  public bindings = {
    suiteId: '<',
  };
}

