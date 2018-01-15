import { IPrivateTrunkResource, IPrivateTrunkDomain, IPrivateTrunkInfo } from './private-trunk';

interface IValidateSIPDestination {
  unique: boolean;
}

interface IDestinationResource extends ng.resource.IResourceClass<ng.resource.IResource<IPrivateTrunkResource>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface IPrivateTrunk extends ng.resource.IResourceClass<ng.resource.IResource<IPrivateTrunkDomain>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

interface ISipDestinationValidateResource extends ng.resource.IResourceClass<ng.resource.IResource<IValidateSIPDestination>> {
}

export class PrivateTrunkService {
  private privateTrunkResourceService: IDestinationResource;
  private privateTrunkService: IPrivateTrunk;
  private sipDestinationValidateService: ISipDestinationValidateResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.privateTrunkResourceService = <IDestinationResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/privatetrunks/resources/:resourceId', {},
      {
        update: updateAction,
      });

    this.privateTrunkService = <IPrivateTrunk>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/privatetrunks/', {},
      {
        update: updateAction,
      });

    this.sipDestinationValidateService = <ISipDestinationValidateResource>this.$resource(this.HuronConfig.getCmiV2Url() + '/customers/:customerId/validate/sipaddress', {});

  }

  public getPrivateTrunk(): ng.IPromise<IPrivateTrunkInfo> {
    return this.privateTrunkService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .catch(() => {
      return {
        resources: [],
        domains: undefined,
      } as IPrivateTrunkInfo;
    })
    .then((resp) => {
      return _.pick(resp, 'resources', 'domains');
    });
  }

  public setPrivateTrunk(domains: string[]): ng.IPromise<void> {
    return this.privateTrunkService.update({
      customerId: this.Authinfo.getOrgId(),
    }, {
      domains: domains,
    }).$promise;
  }

  public deprovisionPrivateTrunk(): ng.IPromise<any> {
    return this.privateTrunkService.remove({
      customerId: this.Authinfo.getOrgId(),
    }).$promise;
  }

  public createPrivateTrunkResource(privateTrunkResource: IPrivateTrunkResource): ng.IPromise<IPrivateTrunkResource> {
    return this.privateTrunkResourceService.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      name: privateTrunkResource.name,
      address: privateTrunkResource.address,
      port: privateTrunkResource.port,
    }).$promise;
  }

  public listPrivateTrunkResources(): ng.IPromise<IPrivateTrunkResource[]> {
    return this.privateTrunkResourceService.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then(res => {
      return _.pick(res, 'resources');
    });
  }

  public setPrivateTrunkResource(resourceId: string, name: string): ng.IPromise<void> {
    return this.privateTrunkResourceService.update({
      customerId: this.Authinfo.getOrgId(),
      resourceId: resourceId,
    }, {
      name: name,
    }).$promise;
  }

  public removePrivateTrunkResource(resourceId: string): ng.IPromise<any> {
    return this.privateTrunkResourceService.remove({
      customerId: this.Authinfo.getOrgId(),
      resourceId: resourceId,
    }).$promise;
  }

  public removePrivateTrunkResources(): void {
    this.listPrivateTrunkResources().then((res) => {
      if (res) {
        const resources = _.get(res, 'resources');
        _.forEach(resources, dest => {
          this.removePrivateTrunkResource(dest.uuid || '');
        });
      }
    });
  }

  public isValidUniqueSipDestination(sipDestination: string): ng.IPromise<boolean> {
    return this.sipDestinationValidateService.get({
      customerId: this.Authinfo.getOrgId(),
      value: sipDestination,
    }).$promise
    .then(res => _.get(res, 'unique'));
  }

}
