import { HtmSuite } from 'modules/hcs/test-manager/shared/hcs-test-manager.const';
import { HcsTestManagerService } from 'modules/hcs/test-manager/shared/hcs-test-manager.service';
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
    private HcsTestManagerService: HcsTestManagerService,
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
    // this.HcsTestManagerService.getSuite(testId)
    // .then((response) => {
    //   if (response.length > 0) {
    //     this.dismiss();
    //   } else {
    //     this.$state.go('test');
    //   }
    // })
    // .catch(error => this.Notification.errorResponse(error, 'Error geting suite values'));
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
