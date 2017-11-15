import moduleName from './index';

describe('Component: assignableServices:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Authinfo',
      'Orgservice',
    );
    this.fixtures = {};
    this.fixtures.fakeLicenseUsage = [{
      subscriptionId: 'fake-subscriptionId-2',
    }, {
      subscriptionId: 'fake-subscriptionId-3',
    }, {
      subscriptionId: 'fake-subscriptionId-1',
    }];
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors (view):', () => {
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
    beforeEach(function () {
      spyOn(this.Orgservice, 'getLicensesUsage').and.returnValue(this.$q.resolve(this.fixtures.fakeLicenseUsage));
    });

    it('should initialize "sortedSubscription" property', function () {
      this.compileComponent('assignableServices');
      expect(this.controller.sortedSubscriptions.length).toBe(3);
      expect(_.get(this.controller, 'sortedSubscriptions[0].subscriptionId')).toBe('fake-subscriptionId-1');
      expect(_.get(this.controller, 'sortedSubscriptions[1].subscriptionId')).toBe('fake-subscriptionId-2');
      expect(_.get(this.controller, 'sortedSubscriptions[2].subscriptionId')).toBe('fake-subscriptionId-3');
    });

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
