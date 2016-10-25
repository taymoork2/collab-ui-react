import { IPagingGroup } from 'modules/huron/features/pagingGroup/pagingGroup';

interface IPagingGroupResource extends ng.resource.IResourceClass<ng.resource.IResource<IPagingGroup>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<IPagingGroup>>;
}

export class PagingGroupService {

  private pgRes: IPagingGroupResource;

  /* @ngInject */
  constructor(private $resource: ng.resource.IResourceService,
              private HuronConfig,
              private Authinfo) {
    this.pgRes = <IPagingGroupResource>this.$resource(this.HuronConfig.getPgUrl() + '/customers/:customerId/pagingGroups/:groupId', {},
      {
        update: {
          method: 'PUT',
        },
      });
  }

  public getListOfPagingGroups(): ng.IPromise<IPagingGroup[]> {
    return this.pgRes.get({
      customerId: this.Authinfo.getOrgId(),
    }).$promise.then((response) => _.get(response, 'pagingGroups'));
  }

  public getPagingGroup(groupId: string): ng.IPromise<IPagingGroup> {
    return this.pgRes.get({
      customerId: this.Authinfo.getOrgId(),
      groupId: groupId,
    }).$promise;
  }

  public savePagingGroup(pg: IPagingGroup) {
    return this.pgRes.save({
      customerId: this.Authinfo.getOrgId(),
    }, pg).$promise;
  }

  public updatePagingGroup(pg: IPagingGroup) {
    return this.pgRes.update({
        customerId: this.Authinfo.getOrgId(),
        groupId: pg.groupId,
      }, pg).$promise;
  }

  public deletePagingGroup(groupId: string) {
    return this.pgRes.delete({
      customerId: this.Authinfo.getOrgId(),
      groupId: groupId,
    }).$promise;
  }
}
