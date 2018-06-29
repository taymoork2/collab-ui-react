export interface ICustomerConfig {
  routingPrefixLength: string;
  extensionLength: string;
  country: string;
}

interface ICustomerConfigResource extends ng.resource.IResourceClass<ng.resource.IResource<ICustomerConfig>> {}

export class CustomerConfigService {
  private customerConfigResouce: ICustomerConfigResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private HuronConfig,
    private Authinfo,
  ) {

    const saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'CustomerConfig',
      },
    };

    this.customerConfigResouce = <ICustomerConfigResource>this.$resource(`${this.HuronConfig.getCesUrl()}/customers/:customerId/customerConfig`, {},
      {
        save: saveAction,
      });
  }

  public createCompanyLevelCustomerConfig (routingPrefixLength, extensionLength, country) {
    let customerConfigHeader: string;
    return this.customerConfigResouce.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      routingPrefixLength: routingPrefixLength,
      extensionLength: extensionLength,
      country: country,
    },
      (_response, headers) => {
        customerConfigHeader = headers('CustomerConfig');
      }).$promise
      .then(() => customerConfigHeader);
  }
}
