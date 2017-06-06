import cmcDetailsStatus from './../index';
import { ICmcUserStatus } from './../cmc.interface';

describe('Component: cmcDetailsStatus ', () => {

  describe('Controller: ', () => {

    beforeEach(function () {
      this.initModules(cmcDetailsStatus);

      this.injectDependencies(
        '$componentController',
        '$q',
        '$scope',
        'CmcUserService');

      this.controller = this.$componentController('cmcDetailsStatus', {
        CmcUserService: this.CmcUserService,
      }, {
      });
    });

    describe('user status', function () {

      it('shows all users', function (done) {

        let someUsers = createSomeUserStatuses(10);

        spyOn(this.CmcUserService, 'getUsersWithCmcButMissingAware').and.returnValue(
          this.$q.resolve({
            userStatuses: someUsers,
          }),
        );

        this.controller.fetchUserStatuses(10).then( () => {
          expect(this.controller.userStatusesSummaryText).toEqual('Listing all 10 active users.');
          expect(this.controller.userStatuses).toEqual(someUsers);
          done();
        });
        this.$scope.$apply();

      });

      it('shows only first page of many users', function (done) {

        let someUsers = createSomeUserStatuses(10);

        spyOn(this.CmcUserService, 'getUsersWithCmcButMissingAware').and.returnValue(
          this.$q.resolve({
            userStatuses: someUsers,
            paging: {
              next: 'whatever_link',
            },
          }),
        );

        this.controller.fetchUserStatuses(10).then( () => {
          expect(this.controller.userStatusesSummaryText).toEqual('Listing the first 10 active users.');
          expect(this.controller.userStatuses).toEqual(someUsers);
          done();
        });
        this.$scope.$apply();

      });

    });
  });

  function createSomeUserStatuses(noOfUsers: number): Array<ICmcUserStatus> {
    let userStatuses: Array<ICmcUserStatus> = new Array<ICmcUserStatus>();
    _.times(noOfUsers, function (n) {
      userStatuses.push({
        userId: n.toString(),
        state: 'whatever',
      });
    });
    return userStatuses;
  }

});
