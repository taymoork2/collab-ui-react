import { IBsftSettings, BsftSettings, IBsftCustomerStatus, IBsftCustomerLogin } from './bsft-settings';

interface IBsftCustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<IBsftSettings>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IBsftCustomerLoginResource extends ng.resource.IResourceClass<ng.resource.IResource<IBsftCustomerLogin>> {}

export class BsftCustomerService {
  private bsftCustomerResource: IBsftCustomerResource;
  private bsftCustomerLoginResource: IBsftCustomerLoginResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
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
    this.bsftCustomerLoginResource = <IBsftCustomerLoginResource>this.$resource(`${this.HuronConfig.getRialtoUrl()}/customers/:customerId/login`, {}, {});
  }

  public getBsftCustomer(customerId: string): IPromise<BsftSettings> {
    return this.bsftCustomerResource.get({
      customerId: customerId,
    }).$promise.then(response => new BsftSettings(response));
  }

  public createBsftCustomer(bsftSettings: BsftSettings) {
    return this.bsftCustomerResource.save({}, bsftSettings).$promise;
  }

  public getBsftCustomerStatus(customerId: string): IPromise<IBsftCustomerStatus> {
    return this.bsftCustomerResource.get({
      customerId: customerId,
    }).$promise.then(response => {
      return {
        rialtoCustomerId: _.get(response, 'rialtoCustomerId'),
        rialtoSiteId: _.get(response, 'rialtoSiteId'),
        completed: _.get(response, 'completed'),
        failed: _.get(response, 'failed'),
        errorMessage: _.get(response, 'errorMessage'),
      } as IBsftCustomerStatus;
    });
  }

  public getBsftCustomerLogin(customerId: string): IPromise<IBsftCustomerLogin> {
    return this.bsftCustomerLoginResource.get({
      customerId: customerId,
    }).$promise.then(response => {
      return {
        crossLaunchUrl: _.get(response, 'crossLaunchUrl'),
      } as IBsftCustomerLogin;
    });
  }
}
