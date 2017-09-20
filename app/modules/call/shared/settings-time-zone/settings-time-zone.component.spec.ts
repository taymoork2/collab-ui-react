import timeZoneModule from './index';

describe('Component: timeZone', () => {
  const TIME_ZONE_SELECT = '.csSelect-container[name="timeZone"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const TZ_ANCHORAGE = 'America/Anchorage';
  const TZ_LA = 'America/Los_Angeles';
  const timeZoneOptions = getJSONFixture('huron/json/settings/timeZones.json');

  beforeEach(function() {
    this.initModules(timeZoneModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucTimeZone', {
      timeZone: 'timeZone',
      timeZoneOptions: 'timeZoneOptions',
      onChangeFn: 'onChangeFn(timeZone)',
    });

    this.$scope.timeZone = TZ_ANCHORAGE;
    this.$scope.timeZoneOptions = timeZoneOptions;
    this.$scope.$apply();
  });

  it('should have a select box with options', function() {
    expect(this.view).toContainElement(TIME_ZONE_SELECT);
    expect(this.view.find(TIME_ZONE_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('America/Anchorage');
    expect(this.view.find(TIME_ZONE_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('America/Los_Angeles');
  });

  it('should invoke onChangeFn when a time zone is chosen', function() {
    this.view.find(TIME_ZONE_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(TZ_LA);
  });

});
