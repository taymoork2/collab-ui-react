import { HtmSuite, TaskManagerService } from '../shared';
import { Notification } from 'modules/core/notifications';

class AddSuiteController implements ng.IComponentController {
  public addSuiteForm: ng.IFormController;
  public close: Function;
  public dismiss: Function;
  public suiteObject: HtmSuite;
  public showConfirmation: boolean;

  /* @ngInject */
  constructor(
    private Notification: Notification,
    private HcsTestManagerService: TaskManagerService,
    private $state: ng.ui.IStateService,
  ) {}

  public $onInit(): void {
    this.initCustomer();
  }

  public initCustomer(): void {
    this.suiteObject = new HtmSuite();
  }

  public validateAndSave(): void {
    //Call service to validate and save
    this.HcsTestManagerService.createSuite(this.suiteObject).then((response) => {
      this.suiteObject.id = response;
      this.showConfirmation = true;
    })
    .catch(error => this.Notification.errorResponse(error.data.error.message, 'Recevied an Error'));
  }


  public finishAddingCustomer() {
    this.$state.go('test');
  }

}

export class AddSuiteComponent implements ng.IComponentOptions {
  public controller = AddSuiteController;
  public template = require('modules/hcs/test-manager/add-suite/addSuite.component.html');
  public bindings = {
    dismiss: '&',
    close: '&',
  };
}
