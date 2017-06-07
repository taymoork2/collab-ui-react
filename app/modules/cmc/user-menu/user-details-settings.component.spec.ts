import cmcUserDetailsSettings from './../index';
import { CmcUserData } from './../cmcUserData';
import { IUser } from 'modules/core/auth/user/user';

describe('Component: cmcUserDetailsSettings ', () => {

  const SAVE_BUTTON = '.btn-save';
  const CANCEL_BUTTON = 'button[translate="common.cancel"]';
  const TITLE_ROW = '.section-title-row';
  const MOBILE_FIELD = 'input[name="mobile"]';
  const INVALID_MSG = '.cmc-invalid';

  describe('View: ', () => {

    beforeEach(function () {
      this.initModules(cmcUserDetailsSettings);
      this.injectDependencies(
        'CmcService',
        '$scope',
        '$q',
      );

      spyOn(this.CmcService, 'getUserData').and.returnValue(<CmcUserData>{
        entitled: true,
        mobileNumber: '+471234',
      });
      spyOn(this.CmcService, 'preCheckOrg').and.returnValue(this.$q.resolve({
        status: 'ok',
      }));
      spyOn(this.CmcService, 'preCheckUser').and.returnValue(this.$q.resolve({
        status: 'ok',
      }));
    });

    function initComponent() {
      this.$scope.userObj = dummyUser();
      this.compileComponent('cmcUserDetailsSettings', {
        user: 'userObj',
      });
    }

    it ('has two content sections', function() {
      initComponent.call(this);
      this.controller.$onInit();

      // Has to title sections
      let element = this.view.find(TITLE_ROW);
      expect(element.get(0)).toExist();
      expect(element.get(1)).toExist();
    });

    it ('shows save/cancel buttons if data has a valid change', function() {
      initComponent.call(this);
      this.controller.$onInit();

      let element = this.view.find(SAVE_BUTTON);
      expect(element.get(0)).not.toExist();
      element = this.view.find(CANCEL_BUTTON);
      expect(element.get(0)).not.toExist();

      element = this.view.find(MOBILE_FIELD);
      expect(element.val()).toEqual('+471234');
      element.val('+479999').change();
      this.$scope.$apply();

      element = this.view.find(MOBILE_FIELD);
      expect(element.val()).toEqual('+479999');

      element = this.view.find(SAVE_BUTTON);
      expect(element.get(0)).toExist();
      element = this.view.find(CANCEL_BUTTON);
      expect(element.get(0)).toExist();

      element = this.view.find(INVALID_MSG);
      expect(element.get(0)).not.toExist();

      element = this.view.find(CANCEL_BUTTON);
      element.get(0).click();
      this.$scope.$apply();

      element = this.view.find(SAVE_BUTTON);
      expect(element.get(0)).not.toExist();
      element = this.view.find(CANCEL_BUTTON);
      expect(element.get(0)).not.toExist();

      element = this.view.find(MOBILE_FIELD);
      expect(element.val()).toEqual('+471234');
    });

    it ('does not show save button if data has a invalid change', function() {
      initComponent.call(this);
      this.controller.$onInit();

      let element = this.view.find(SAVE_BUTTON);
      expect(element.get(0)).not.toExist();

      element = this.view.find(MOBILE_FIELD);
      expect(element.val()).toEqual('+471234');
      element.val('invalid number').change();
      this.$scope.$apply();

      element = this.view.find(MOBILE_FIELD);
      expect(element.val()).toEqual('invalid number');

      element = this.view.find(SAVE_BUTTON);
      expect(element.get(0)).not.toExist();

      element = this.view.find(INVALID_MSG);
      expect(element.get(0)).toExist();
    });
  });

  describe('Controller: ', () => {

    beforeEach(function () {
      this.initModules(cmcUserDetailsSettings);

      this.injectDependencies(
        '$componentController',
        'CmcService',
        '$q');

      this.controller = this.$componentController('cmcUserDetailsSettings', {
        CmcService: this.CmcService,
      }, {
        user: dummyUser(),
      });
    });

    it('handles error from user save', function(done) {
      spyOn(this.CmcService, 'setUserData').and.returnValue(
        this.$q.reject({
          data: {
            message: 'ERROR',
          },
        }),
      );
      spyOn(this.CmcService, 'getUserData').and.returnValue({
        entitled: false,
        mobileNumber: '111',
      });
      this.controller.$onInit();
      this.controller.mobileNumber = '222';
      this.controller.entitled = true;
      this.controller.save();
      expect(this.controller.oldCmcUserData.mobileNumber).toEqual('111');
      expect(this.controller.oldCmcUserData.entitled).toBeFalsy();
      done();
    });

    it('has entitlement and mobile number', function (done) {

      spyOn(this.CmcService, 'getUserData').and.returnValue({
        entitled: true,
        mobileNumber: '1234',
      });

      this.controller.$onInit();
      expect(this.controller.entitled).toBe(true);
      expect(this.controller.mobileNumber).toBe('1234');
      done();
    });

    describe('validation', () => {

      beforeEach(function () {
        spyOn(this.CmcService, 'getUserData').and.returnValue({
          entitled: true,
          mobileNumber: '+471234',
        });
      });

      it('handles changing e164 number as valid change', function (done) {
        this.controller.$onInit();
        this.controller.mobileNumber = '+479999';
        this.controller.dataChanged();
        expect(this.controller.validDataChange).toBeTruthy();
        done();
      });

      it('does not handle wrong e.164 as valid data change', function (done) {
        this.controller.$onInit();
        this.controller.mobileNumber = 'notvalid';
        this.controller.dataChanged();
        expect(this.controller.validDataChange).toBeFalsy();
        done();
      });
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
