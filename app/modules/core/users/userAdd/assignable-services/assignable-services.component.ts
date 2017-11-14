class AssignableServicesController implements ng.IComponentController {
  public isCareEnabled = false;
  public isCareAndCDCEnabled = false;
  public isCareAndCVCEnabled = false;
  public sortedSubscriptions: any[];

  /* @ngInject */
  constructor (
    private Authinfo,
    private Orgservice,
  ) {}

  public $onInit(): void {
    this.isCareAndCDCEnabled = this.Authinfo.isCareAndCDC();
    this.isCareAndCVCEnabled = this.Authinfo.isCareVoiceAndCVC();
    this.isCareEnabled = this.isCareAndCDCEnabled || this.isCareAndCVCEnabled;

    this.Orgservice.getLicensesUsage()
      .then((subscriptions) => {
        this.sortedSubscriptions = _.sortBy(subscriptions, 'subscriptionId');
      });
  }
}

export class AssignableServicesComponent implements ng.IComponentOptions {
  public controller = AssignableServicesController;
  public template = require('./assignable-services.html');
  public bindings = {};
}
