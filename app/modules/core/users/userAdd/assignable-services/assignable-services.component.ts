class AssignableServicesController implements ng.IComponentController {
  public isCareEnabled = false;
  public isCareAndCDCEnabled = false;
  public isCareAndCVCEnabled = false;

  /* @ngInject */
  constructor(
    private Authinfo,
  ) {}

  public $onInit(): void {
    this.isCareAndCDCEnabled = this.Authinfo.isCareAndCDC();
    this.isCareAndCVCEnabled = this.Authinfo.isCareVoiceAndCVC();
    this.isCareEnabled = this.isCareAndCDCEnabled || this.isCareAndCVCEnabled;
  }
}

export class AssignableServicesComponent implements ng.IComponentOptions {
  public controller = AssignableServicesController;
  public template = require('./assignable-services.html');
  public bindings = {
    subscriptions: '<',
    onUpdate: '&',
    autoAssignTemplateData: '<',
  };
}
