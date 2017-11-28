import moduleName from './index';

describe('Component: assignableServices:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
      'Authinfo',
    );
  });

  describe('primary behaviors (view):', () => {
    it('should render an "assignable-services-row" for each subscription passed through input binding', function () {
      this.$scope.fakeSubscriptions = [{
        subscriptionId: 'fake-subscriptionId-2',
      }, {
        subscriptionId: 'fake-subscriptionId-3',
      }, {
        subscriptionId: 'fake-subscriptionId-1',
      }];
      this.compileComponent('assignableServices', {
        subscriptions: 'fakeSubscriptions',
      });
      expect(this.view.find('assignable-services-row[subscription="subscription"]').length).toBe(3);
    });

    it('should have three or four columns depending on "isCareEnabled"', function () {
      spyOn(this.Authinfo, 'isCareAndCDC').and.returnValue(false);
      spyOn(this.Authinfo, 'isCareVoiceAndCVC').and.returnValue(false);
      this.compileComponent('assignableServices');
      expect(this.view.find('.license-wrapper .column-title').length).toBe(3);

      this.Authinfo.isCareAndCDC.and.returnValue(true);
      this.compileComponent('assignableServices');
      expect(this.view.find('.license-wrapper .column-title').length).toBe(4);

      this.Authinfo.isCareAndCDC.and.returnValue(false);
      this.Authinfo.isCareVoiceAndCVC.and.returnValue(true);
      this.compileComponent('assignableServices');
      expect(this.view.find('.license-wrapper .column-title').length).toBe(4);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should initialize "isCare*" properties', function () {
      spyOn(this.Authinfo, 'isCareAndCDC').and.returnValue(false);
      spyOn(this.Authinfo, 'isCareVoiceAndCVC').and.returnValue(false);
      this.compileComponent('assignableServices');
      expect(this.controller.isCareAndCDCEnabled).toBe(false);
      expect(this.controller.isCareAndCVCEnabled).toBe(false);
      expect(this.controller.isCareEnabled).toBe(false);

      this.Authinfo.isCareAndCDC.and.returnValue(true);
      this.compileComponent('assignableServices');
      expect(this.controller.isCareAndCDCEnabled).toBe(true);
      expect(this.controller.isCareEnabled).toBe(true);

      this.Authinfo.isCareAndCDC.and.returnValue(false);
      this.Authinfo.isCareVoiceAndCVC.and.returnValue(true);
      this.compileComponent('assignableServices');
      expect(this.controller.isCareAndCVCEnabled).toBe(true);
      expect(this.controller.isCareEnabled).toBe(true);
    });
  });
});
