import { IRInvalidServices, InvalidServices } from 'modules/call/shared/hunt-group-call-park-misconfig/hunt-group-call-park';

interface IHuntGroupCallParkMisconfigResource extends ng.resource.IResourceClass<ng.resource.IResource<IRInvalidServices>> {}

export class HuntGroupCallParkMisconfigService {
  private huntGroupCallParkMisconfigResource: IHuntGroupCallParkMisconfigResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.huntGroupCallParkMisconfigResource = <IHuntGroupCallParkMisconfigResource>this.$resource(`${this.HuronConfig.getCmiV2Url()}/customers/:customerId/features/invalid`, {}, {});
  }

  public getMisconfiguredServices(): ng.IPromise<InvalidServices> {
    return this.huntGroupCallParkMisconfigResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => new InvalidServices(response));
  }
}
