import * as moment from 'moment-timezone';
import moduleName from './index';

describe('Component: DgcPartnerTimeZone', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies('$q', '$scope', 'PartnerSearchService');
    moment.tz.setDefault('America/Chicago');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });

  function initComponent(this) {
    this.compileComponent('dgcPartnerTimeZone', { timeZone: 'Africa/Abidjan', onChangeFn: 'onChangeFn(timeZone)' });
  }

  it('should get correct timeZone', function () {
    initComponent.call(this);
    const arr = this.controller.getTimeZone('(GMT +00:00) Africa/Abidjan');
    expect(arr[1]).toBe('Africa/Abidjan');
  });

  it('should return true if a string matches a proper GMT timezone format', function () {
    initComponent.call(this);
    expect(this.controller.hasGmtPrefix('(GMT +00:00) Africa/Abidjan')).toBe(true);
    expect(this.controller.hasGmtPrefix('GMT ++10:99 c1x/ab')).toBe(false);
  });
});
