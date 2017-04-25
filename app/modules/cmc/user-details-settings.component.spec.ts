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

    it('has entitlement and mobile number', function () {

      spyOn(this.CmcService, 'getData').and.returnValue({
        entitled: true,
        mobileNumber: '1234',
      });

      this.controller.extractCmcData();
      expect(this.controller.entitled).toBe(true);
      expect(this.controller.mobileNumber).toBe('1234');
    });
  });

});
