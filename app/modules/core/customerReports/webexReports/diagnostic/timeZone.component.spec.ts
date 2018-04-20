import testModule from './index';
import * as moment from 'moment-timezone';

describe('Component: dgcTimeZone', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService');
    this.injectDependencies('$scope');
    initSpies.apply(this);
    moment.tz.setDefault('America/Chicago');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
  });
  function initSpies() {

  }

  function initComponent(this) {
    this.compileComponent('dgcTimeZone', { timeZone: 'Africa/Abidjan', onChangeFn: 'onChangeFn(timeZone)' });
    this.$scope.$apply();
  }

  it('Should get correct timeZone', function () { // TODO, will implement it next time
    initComponent.call(this);
    this.controller.onChangeTz('America/Chicago');
    this.controller.onChangeTz('(GMT +00:00) Africa/Abidjan');
  });
});
