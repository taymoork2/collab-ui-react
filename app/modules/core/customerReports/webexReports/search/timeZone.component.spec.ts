import testModule from './index';
import * as moment from 'moment';

describe('Component: custTimeZone', () => {
  beforeAll(function () {
    this.getNames = ['Africa/Abidjan', 'Asia/Shanghai'];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService');

    initSpies.apply(this);
  });
  function initSpies() {
    spyOn(this.SearchService, 'getOffset').and.returnValue('+08:00');
    spyOn(this.SearchService, 'getNames').and.returnValue(this.getNames);
    spyOn(this.SearchService, 'getGuess').and.returnValue('Asia/Shanghai');
    spyOn(this.SearchService, 'utcDateByTimezone').and.callFake(utdDateByTimezone);
  }

  function utdDateByTimezone(date) {
    const offset = '+08:00';
    return moment.utc(date).utcOffset(offset).format('MMMM Do, YYYY h:mm:ss A');
  }

  function initComponent(this) {
    this.compileComponent('custTimeZone');
    this.$scope.$apply();
  }

  it('Should custTimeZone', function () {

    initComponent.call(this);

    this.controller.onChangeTz('Asia/Shanghai');
    this.controller.onChangeTz('(GMT +00:00) Africa/Abidjan');

    expect(this.controller.selected).toEqual('Asia/Shanghai');

  });

});
