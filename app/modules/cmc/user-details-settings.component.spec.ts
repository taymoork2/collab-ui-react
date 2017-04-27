import cmcUserDetailsSettings from './index';

describe('Component: cmcUserDetailsSettings ', () => {

  describe('Controller: ', () => {

    beforeEach(function () {
      this.initModules(cmcUserDetailsSettings);

      this.injectDependencies(
        '$componentController',
        'CmcService');

      this.controller = this.$componentController('cmcUserDetailsSettings', {
        CmcService: this.CmcService,
      }, { user: {} });
    });

    it('has entitlement and mobile number', function (done) {

      spyOn(this.CmcService, 'getData').and.returnValue({
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
        spyOn(this.CmcService, 'getData').and.returnValue({
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

});
