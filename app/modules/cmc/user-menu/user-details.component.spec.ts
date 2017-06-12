import cmcUserDetails from './../index';
import { IUser } from 'modules/core/auth/user/user';

describe('Component: cmcUserDetails ', () => {

  describe('Controller: ', () => {

    beforeEach(function () {
      this.initModules(cmcUserDetails);

      this.injectDependencies(
        '$componentController',
        '$q',
        '$scope',
        '$translate',
        'CmcService',
        'Notification');

      this.controller = this.$componentController('cmcUserDetails', {
        CmcService: this.CmcService,
        Notification: this.Notification,
      }, { user: {} });
    });

    it('has cmc service menu item', function (done) {
      expect(this.controller.services[0]).toExist();
      expect(this.controller.services[0].state).toEqual('cmc');
      done();
    });

    it('dont allow cmc menu item if org is not prepared for it', function (done) {
      spyOn(this.CmcService, 'allowCmcSettings').and.returnValue(this.$q.resolve(false));

      this.controller.validateOrgAndUserContent(dummyUser());
      this.$scope.$apply();

      expect(this.controller.allowCmcSettings).toBeFalsy();
      done();
    });

    it('allow cmc menu item if org is prepared for it', function (done) {
      spyOn(this.CmcService, 'allowCmcSettings').and.returnValue(this.$q.resolve(true));

      spyOn(this.CmcService, 'preCheckOrg').and.returnValue(
        this.$q.resolve({ status: 'ok' }),
      );
      spyOn(this.CmcService, 'preCheckUser').and.returnValue(
        this.$q.resolve({ status: 'ok' }),
      );

      this.controller.validateOrgAndUserContent(dummyUser());
      this.$scope.$apply();

      expect(this.controller.allowCmcSettings).toBeTruthy();
      done();
    });

    it('show status info in menu if org is in error', function (done) {
      spyOn(this.CmcService, 'allowCmcSettings').and.returnValue(this.$q.resolve(true));

      spyOn(this.CmcService, 'preCheckOrg').and.returnValue(
        this.$q.resolve({
          status: 'error',
          issues: ['org not ready'],
        }),
      );

      spyOn(this.CmcService, 'preCheckUser').and.returnValue(
        this.$q.resolve({ status: 'ok' }),
      );

      this.controller.validateOrgAndUserContent(dummyUser());
      this.$scope.$apply();

      expect(this.controller.allowCmcSettings).toBeTruthy();
      expect(this.controller.orgReady).toBeFalsy();
      expect(this.controller.userReady).toBeTruthy();
      expect(this.controller.issues[0]).toEqual('org not ready');
      expect(this.controller.services[ 0 ].detail).toBe('cmc.userMenu.statusNok');
      expect(this.controller.services[ 0 ].actionAvailable).toBeTruthy();

      done();
    });

    it('show error toaster if org precheck request fails', function (done) {
      spyOn(this.CmcService, 'allowCmcSettings').and.returnValue(this.$q.resolve(true));

      spyOn(this.CmcService, 'preCheckOrg').and.returnValue(
        this.$q.reject({
          data: {
            message: 'ERROR',
          },
        }),
      );

      spyOn(this.Notification, 'error');

      this.controller.validateOrgAndUserContent(dummyUser());
      this.$scope.$apply();

      expect(this.controller.allowCmcSettings).toBeTruthy();
      expect(this.controller.orgReady).toBeFalsy();
      expect(this.Notification.error).toHaveBeenCalled();
      expect(this.controller.userReady).toBeFalsy();

      expect(this.controller.services[ 0 ].detail).toEqual('cmc.userMenu.statusOk');
      expect(this.controller.services[ 0 ].actionAvailable).toBeFalsy();

      done();
    });

    it('show status info in menu if org is ok but user is in error', function (done) {
      spyOn(this.CmcService, 'allowCmcSettings').and.returnValue(this.$q.resolve(true));

      spyOn(this.CmcService, 'preCheckOrg').and.returnValue(
        this.$q.resolve({ status: 'ok' }),
      );
      spyOn(this.CmcService, 'preCheckUser').and.returnValue(
        this.$q.resolve({
          status: 'error',
          issues: ['user not ready'],
        }),
      );

      this.controller.validateOrgAndUserContent(dummyUser());
      this.$scope.$apply();

      expect(this.controller.allowCmcSettings).toBeTruthy();
      expect(this.controller.orgReady).toBeTruthy();
      expect(this.controller.userReady).toBeFalsy();
      expect(this.controller.issues[0]).toEqual('user not ready');

      expect(this.controller.services[ 0 ].detail).toBe('cmc.userMenu.statusNok');
      expect(this.controller.services[ 0 ].actionAvailable).toBeTruthy();

      done();
    });

  });

  function dummyUser(): IUser {
    let user: IUser = <IUser> {
      meta: {
        organizationID: '1234',
      },
    };
    return user;
  }

});
