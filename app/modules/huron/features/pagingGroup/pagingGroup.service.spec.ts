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

});
