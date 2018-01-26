import hybridContextContainer from './hybrid-context-container.component';

describe('Component: Hybrid Context Container',  () => {

  beforeEach(function () {
    this.initModules('Core', 'Context', hybridContextContainer);
    this.injectDependencies(
      '$scope',
      '$translate',
      'Authinfo',
    );
    spyOn(this.$translate, 'instant').and.callThrough();
    this.$scope.backState = '';
  });

  it('should set backState correctly when unspecified', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
    this.compileComponent('context-container', { backState: '' });
    expect(this.controller.backState).toEqual('services-overview');
  });

  it('should set backState correctly when specified', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
    this.compileComponent('context-container', { backState: 'some-back-state' });
    expect(this.controller.backState).toEqual('services-overview');
  });

  it('should setup tabs properly for customer admin', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(false);
    this.compileComponent('context-container', { backState: '' });
    expect(this.controller.tabs.length).toEqual(3);
  });

  it('should setup tabs properly for a partner admin', function () {
    spyOn(this.Authinfo, 'isCustomerLaunchedFromPartner').and.returnValue(true);
    this.compileComponent('context-container', { backState: '' });
    expect(this.controller.tabs.length).toEqual(1);
  });
});
