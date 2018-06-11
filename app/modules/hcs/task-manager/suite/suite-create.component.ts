import { HtmSuite, TaskManagerService } from '../shared';
import { Notification } from 'modules/core/notifications';


export class SuiteCreateComponent implements ng.IComponentOptions {
  public controller = SuiteCreateController;
  public template = require('./suite-create.component.html');
  public bindings = {
    dismiss: '&',
    close: '&',
  };
}

class SuiteCreateController implements ng.IComponentController {
  public suites: HtmSuite [] = [];
  public suiteCreateForm: ng.IFormController;
  public close: Function;
  public dismiss: Function;
  public suiteObject: HtmSuite;
  public suiteName: string;
  /* @ngInject */
  constructor(
    public $state: ng.ui.IStateService,
    private Notification: Notification,
    private HcsTestManagerService: TaskManagerService,
  ) {}

  public $onInit(): void {
    this.initCustomer();
  }

  public initCustomer(): void {
    this.suiteObject = new HtmSuite();
  }

  public validateAndContinue(): void {
    //Call service to validate and save
    const suite = new HtmSuite;
    suite.name = this.suiteName;
    this.HcsTestManagerService.createSuite(suite).then((suiteId: string) => {
      suite.id = suiteId;
      this.$state.go('taasTaskView', { suite: suite });
    })
      .catch(error => this.Notification.errorResponse(error.data.error.message, 'Recevied an Error'));
  }

}

