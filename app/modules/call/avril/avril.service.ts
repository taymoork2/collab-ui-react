import { IAvrilSite, AvrilSite, IAvrilCustomer, AvrilCustomer } from 'modules/call/avril';

interface IAvrilSiteResource extends ng.resource.IResourceClass<ng.resource.IResource<IAvrilSite>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IAvrilCustomerResource extends ng.resource.IResourceClass<ng.resource.IResource<IAvrilCustomer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class AvrilService {
  private avrilSiteResource: IAvrilSiteResource;
  private avrilCustomerResource: IAvrilCustomerResource;

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

    this.avrilSiteResource = <IAvrilSiteResource>this.$resource(`${this.HuronConfig.getAvrilUrl()}/customers/:customerId/sites/:siteId`, {},
      {
        update: updateAction,
        save: saveAction,
      });

    this.avrilCustomerResource = <IAvrilCustomerResource>this.$resource(`${this.HuronConfig.getAvrilUrl()}/customers/:customerId`, {},
      {
        update: updateAction,
      });
  }

  public getAvrilSite(uuid: string): ng.IPromise<IAvrilSite> {
    return this.avrilSiteResource.get({
      customerId: this.Authinfo.getOrgId(),
      siteId: uuid,
    }).$promise
    .then(response => new AvrilSite(response));
  }

  public createAvrilSite(avrilSite: IAvrilSite): ng.IPromise<string> {
    let location: string;
    return this.avrilSiteResource.save({
      customerId: this.Authinfo.getOrgId(),
    }, avrilSite,
    (_response, headers) => {
      location = headers('Location');
    }).$promise.then(() => location);
  }

  public updateAvrilSite(avrilSite: IAvrilSite): ng.IPromise<void> {
    return this.avrilSiteResource.update({
      customerId: this.Authinfo.getOrgId(),
      siteId: avrilSite.guid,
    }, avrilSite).$promise;
  }

  public getAvrilCustomer(): ng.IPromise<IAvrilCustomer> {
    return this.avrilCustomerResource.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then(response => new AvrilCustomer(response));
  }

  public updateAvrilCustomer(avrilCustomer: IAvrilCustomer): IPromise<void> {
    return this.avrilCustomerResource.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      features: avrilCustomer.features,
    }).$promise;
  }
}
