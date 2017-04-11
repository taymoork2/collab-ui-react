import { IDialPlan } from 'modules/huron/dialPlans';

interface IDialPlanResource extends ng.resource.IResourceClass<ng.resource.IResource<IDialPlan>> {}

export class DialPlanService {
  private dialPlanResource: IDialPlanResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.dialPlanResource = <IDialPlanResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/dialplans');
  }

  public getDialPlan(): ng.IPromise<IDialPlan> {
    return this.dialPlanResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public getCustomerDialPlanCountryCode(): ng.IPromise<string> {
    return this.getDialPlan().then(dialPlan => {
      return _.trimStart(dialPlan.countryCode, '+');
    });
  }

}
