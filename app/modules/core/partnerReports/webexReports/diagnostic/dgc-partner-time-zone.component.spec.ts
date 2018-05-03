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
    expect(arr).toBe('Africa/Abidjan');
  });

  it('should return true if a string has GMT prefix', function () {
    initComponent.call(this);
    expect(this.controller.hasGmtPrefix('(GMT +00:00) xxx')).toBe(true);
    expect(this.controller.hasGmtPrefix('GMT ++10:99 xxx')).toBe(false);
  });

  it('should return true if a string has timeZone suffix', function () {
    initComponent.call(this);
    expect(this.controller.hasTimeZoneSuffix('xxx Africa/Abidjan')).toBe(true);
    expect(this.controller.hasTimeZoneSuffix('xxx c1x/ab')).toBe(false);
  });
});
