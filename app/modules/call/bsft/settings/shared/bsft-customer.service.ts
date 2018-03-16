import { IBsftSettings, BsftSettings } from './bsft-settings';

interface IBsftCustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<IBsftSettings>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class BsftCustomerService {
  private bsftCustomerResource: IBsftCustomerResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.bsftCustomerResource = <IBsftCustomerResource>this.$resource(`${this.HuronConfig.getRialtoUrl()}/customers/:customerId`, {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getBsftCustomer(customerId: string): IPromise<BsftSettings> {
    return this.bsftCustomerResource.get({
      customerId: customerId,
    }).$promise.then(response => new BsftSettings(response));
  }

  public createBsftCustomer(bsftSettings: BsftSettings) {
    return this.bsftCustomerResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, bsftSettings).$promise;
  }
}
