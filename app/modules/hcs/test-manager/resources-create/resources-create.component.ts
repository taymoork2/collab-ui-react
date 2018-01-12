import { TaskManagerService, HtmResource } from '../shared';
import { Notification } from 'modules/core/notifications';

export class ResourcesCreateComponent implements ng.IComponentOptions {
  public controller = ResourcesCreateController;
  public template = require('./resources-create.component.html');
  public bindings = {
    dismiss: '&',
    close: '&',
  };
}

class ResourcesCreateController implements ng.IComponentController {
  public resources: HtmResource[] = [];
  public close: Function;
  public dismiss: Function;
  public resourceLabel: string;
  public deviceType: string;
  public ipPhoneSelect: boolean;
  public ipParamName: string;
  public ipParamIpAddress: string;
  public ipParamUserName: string;
  public ipParamPassword: string;
  public camelotParamName: string;
  public camelotParamTftpAddress: string;
  public camelotParamContainer: string;

  /* @ngInject */
  constructor(
    public HcsTestManagerService: TaskManagerService,
    public Notification: Notification,
    public $stateParams: ng.ui.IStateParamsService,
    public $state: ng.ui.IStateService,
    public $q: ng.IQService,
    public $log: ng.ILogService,
  ) {}

  public $onInit(): void {}

  public createResource(): void {
    const resource = new HtmResource;
    resource.name = this.resourceLabel;
    if (this.deviceType === 'ipPhone') {
      resource.type = 'IPPhone';
    } else if (this.deviceType === 'camelot') {
      resource.type = 'Camelot';
    }
    this.dismiss();
  }

}
