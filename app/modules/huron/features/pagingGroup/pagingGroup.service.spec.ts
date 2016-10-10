import { IPagingGroup } from './pagingGroup';
import { INumber } from './pgSetupAssistant/pgNumber/pgNumber.service';

describe('Service: PagingGroupService', () => {

  let pagingGroups: IPagingGroup[] = [];

  beforeEach(function () {
    this.initModules('huron.paging-group');
    this.injectDependencies(
      '$q',
      '$scope',
      'PagingGroupService'
    );
  });

  it('getListOfPagingGroups: should get a paging group list', function () {
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

  it('savePagingGroup: should add a paging group to the list', function () {
    let pg: IPagingGroup = <IPagingGroup> {
      name: 'PG 1',
      number: <INumber> {
        directoryNumber: '',
        number: '5004',
        type: 'internal',
        uuid: '1234',
      },
      uuid: 'PG 1',
    };
    this.PagingGroupService.savePagingGroup(pg);
    expect(this.PagingGroupService.pagingGroups.length).toEqual(1);
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    pagingGroups.push(pg);
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

  it('deletePagingGroup: should delete a paging group from the list', function () {
    this.PagingGroupService.deletePagingGroup('PG 1');
    expect(this.PagingGroupService.pagingGroups.length).toEqual(0);
    let pagingGroupsActual = undefined;
    this.PagingGroupService.getListOfPagingGroups().then(function(response) {
      pagingGroupsActual = response;
    });
    this.$scope.$digest();
    let index = _.findIndex(pagingGroups, { uuid: 'PG 1' });
    pagingGroups.splice(index, 1);
    expect(pagingGroupsActual).toEqual(pagingGroups);
  });

});
