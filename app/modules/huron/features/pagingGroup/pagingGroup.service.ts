import { IPagingGroup } from './pagingGroup';

export class PagingGroupService {

  private pagingGroups: IPagingGroup[] = [];

  /* @ngInject */
  constructor(private $q: ng.IQService) {
  }

  public getListOfPagingGroups(): ng.IPromise<IPagingGroup[]> {
    return this.$q.resolve(this.pagingGroups);
  }

  public savePagingGroup(pg: IPagingGroup) {
    this.pagingGroups.push(pg);
  }
}
