import testModule from '../index';

describe('Component: gmTdSites', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$state', '$stateParams', 'gemService', 'Notification', 'TelephonyDomainService');
  });

  beforeEach(function () {
    this.$stateParams.data = {
      customerId: 'ff808081527ccb3f0153116a3531041e',
      currCbg: {
        telephonyDomainSites: [{
          tollType: 'CCA Toll Free',
          phone: '055168885889',
          label: 'p5889',
        }, {
          tollType: 'CCA Toll',
          phone: '055168885888',
          label: 'p5888',
        }],
      },
    };
  });

  function initComponent() {
    this.$state.current.data = {};
    this.compileComponent('gmTdSites', {});
    this.$scope.$apply();
  }

  describe('$onInit', function () {
    it('Should get correct info for gmTdSites component', function () {
      initComponent.call(this);
      expect(this.controller.sites.length).toBe(2);
    });
  });
});
