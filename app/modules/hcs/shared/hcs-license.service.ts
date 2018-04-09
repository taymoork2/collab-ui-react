import { IHcsCustomerLicense } from './hcs-license';

interface IHcsCustomerLicenseResource extends ng.resource.IResourceClass<ng.resource.IResource<IHcsCustomerLicense>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IHcsCustomerLicense>>;
}

export class HcsLicenseService {
  private hcsCustomerLicenseResource: IHcsCustomerLicenseResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    const BASE_URL = this.UrlConfig.getHcsLicenseServiceUrl();
    this.hcsCustomerLicenseResource = <IHcsCustomerLicenseResource>this.$resource(BASE_URL + 'reports/organizations/:partnerId/customers/:customerId', {});
  }

  public getCustomerLicenseReport(customerId: string): ng.IPromise<IHcsCustomerLicense> {
    return this.hcsCustomerLicenseResource.get({
      partnerId: this.Authinfo.getOrgId(),
      customerId: customerId,
    }).$promise;
  }

  public listCustomerLicenseReports(): ng.IPromise<any[]> {
    return this.hcsCustomerLicenseResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }
}
