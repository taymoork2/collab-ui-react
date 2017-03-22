export class HybridServicesFlag {
  constructor(public readonly name: string, public readonly raised: boolean) {
  }
}

interface IResource extends
  ng.resource.IResourceClass<ng.resource.IResource<HybridServicesFlag>> {

  patch: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
  multiGet: ng.resource.IResourceMethod<ng.resource.IResource<{items: HybridServicesFlag[]}>>;
}

export class HybridServicesFlagService {
  private readonly resource: IResource;

  /* @ngInject */
  constructor($resource: ng.resource.IResourceService,
              UrlConfig: any,
  ) {
    this.resource = <IResource>$resource(
      `${UrlConfig.getFlagServiceUrl()}/organizations/:orgId/flags/:flagName`,
      {},
      {
        patch: { method: 'PATCH' },
        multiGet: { method: 'GET' },
      });
  }

  public readFlag(orgId: string, flagName: string): ng.IPromise<HybridServicesFlag> {
    return this.resource
      .get({
        orgId: orgId,
        flagName: flagName,
      })
      .$promise
      .then(f => new HybridServicesFlag(f.name, f.raised));
  }

  public readFlags(orgId: string, flagNames: string[]): ng.IPromise<HybridServicesFlag[]> {
    return this.resource
      .multiGet({
        orgId: orgId,
        name: flagNames,
      })
      .$promise
      .then(f => _.map(f.items, (item) => new HybridServicesFlag(item.name, item.raised)));
  }

  private setFlag(orgId: string, flagName: string, raised: boolean): ng.IPromise<void>  {
    return this.resource
      .patch({
        orgId: orgId,
        flagName: flagName,
      },
      new HybridServicesFlag(flagName, raised))
      .$promise;
  }

  public raiseFlag(orgId: string, flagName: string): ng.IPromise<void> {
    return this.setFlag(orgId, flagName, true);
  }

  public lowerFlag(orgId: string, flagName: string): ng.IPromise<void> {
    return this.setFlag(orgId, flagName, false);
  }
}

angular
  .module('Hercules')
  .service('HybridServicesFlagService', HybridServicesFlagService);
