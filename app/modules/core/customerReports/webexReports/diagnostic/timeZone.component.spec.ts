import testModule from './index';
import * as moment from 'moment-timezone';

describe('Component: dgcTimeZone', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService');

    initSpies.apply(this);
    moment.tz.setDefault('America/Chicago');
  });
  function initSpies() {

  }

  function initComponent(this) {
    this.compileComponent('dgcTimeZone');
    this.$scope.$apply();
  }

  it('Should dgcTimeZone', function () {

    initComponent.call(this);

    this.controller.onChangeTz('Asia/Shanghai');
    this.controller.onChangeTz('(GMT +00:00) Africa/Abidjan');

    expect(this.controller.selected).toEqual('Asia/Shanghai');
  });
});
