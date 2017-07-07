export class SetupWizardService {

  /* @ngInject */
  constructor(
    private $q,
    private Authinfo,
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

  public isOrderSimplificationToggled(userEmail: string) {
    if (!userEmail) {
      userEmail = this.Authinfo.getUserName();
    }
    // Currently we are differentiating trial migration orders for WebEx meeting sites setup by a prefix/suffix of 'ordersimp' in the users email.
    return _.toLower(userEmail.split('+')[1]) === 'ordersimp@gmail.com' || _.toLower(userEmail.split('+')[0]) === 'ordersimp' || _.toLower(userEmail.split('-')[0]) === 'ordersimp';
  }

}

export default angular
  .module('core.setup-wizard-service', [])
  .service('SetupWizardService', SetupWizardService)
  .name;
