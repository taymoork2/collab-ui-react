import { IBsftSettings, BsftSettings, IBsftCustomerStatus, IBsftCustomerLogin, BsftCustomerStatus, ITelephoneNumber } from './bsft-settings';

interface IBsftCustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<IBsftSettings>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IBsftCustomerLoginResource extends ng.resource.IResourceClass<ng.resource.IResource<IBsftCustomerLogin>> {}

interface IBsftNumberResource extends ng.resource.IResourceClass<ng.resource.IResource<ITelephoneNumber[]>> {}

export class BsftCustomerService {
  private bsftCustomerResource: IBsftCustomerResource;
  private bsftCustomerLoginResource: IBsftCustomerLoginResource;
  private bsftNumberResource: IBsftNumberResource;

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
    this.bsftCustomerLoginResource = <IBsftCustomerLoginResource>this.$resource(`${this.HuronConfig.getMinervaUrl()}/demo/rialto/customers/:customerId/login`, {}, {});
    this.bsftNumberResource = <IBsftNumberResource>this.$resource(`${this.HuronConfig.getRialtoUrl()}/numbers`, {}, {});
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
    }).catch(() => new BsftCustomerStatus());
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

  public getBsftNumbers(areaCode) {
    return this.bsftNumberResource.query({
      countryCode: '1',
      npa: areaCode,
      assigned: false,
    }).$promise.then((numbers) => {
      return numbers;
    }).catch(error => {
      return error;
    });
  }
}
