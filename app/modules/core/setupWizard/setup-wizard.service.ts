export class SetupWizardService {

  /* @ngInject */
  constructor(
    private $q,
  ) { }

  private callbacks: Function[] = [];

  public addProvisioningCallbacks(func: Function) {
    this.callbacks.push(func);
  }

  public processCallbacks() {
    const promises = _.map(this.callbacks, (callback) => {
      return this.$q.resolve(callback());
    });

    return this.$q.all(_.uniq(promises));
  }

}

export default angular
  .module('core.setup-wizard-service', [])
  .service('SetupWizardService', SetupWizardService)
  .name;
