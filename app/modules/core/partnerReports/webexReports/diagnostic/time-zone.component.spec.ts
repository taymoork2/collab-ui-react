import * as moment from 'moment-timezone';
import moduleName from './index';

describe('Component: DgcPartnerTimeZone', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', 'PartnerSearchService');
    this.injectDependencies('$scope');
    initSpies.apply(this);
    moment.tz.setDefault('America/Chicago');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });
  function initSpies() {

  }

  function initComponent(this) {
    this.compileComponent('dgcPartnerTimeZone', { timeZone: 'Africa/Abidjan', onChangeFn: 'onChangeFn(timeZone)' });
  }

  it('should get correct timeZone', function () {
    initComponent.call(this);
    this.controller.onChangeTz('America/Chicago');
    this.controller.onChangeTz('(GMT +00:00) Africa/Abidjan');
  });
});
