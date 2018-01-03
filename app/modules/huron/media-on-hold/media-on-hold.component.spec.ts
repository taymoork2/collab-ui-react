import mediaOnHold from './index';

describe('Component: mediaOnHold', () => {
  const MEDIA_ON_HOLD_SELECT = '.csSelect-container[name="lineMohSelect"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const MEDIA_FILE_1 = 'drbd-1234-g79e-0op3';
  const MEDIA_FILE_2 = 'bjek-3491-fu69-l140';

  beforeEach(function () {
    this.initModules(mediaOnHold);
    this.injectDependencies(
      '$scope',
      '$modal',
    );

    this.lineMediaOptions = getJSONFixture('huron/json/settings/company-moh.json');

    spyOn(this.$modal, 'open').and.returnValue(true);

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucMediaOnHold', {
      lineMoh: 'lineMoh',
      lineMohOptions: 'lineMohOptions',
      onChangeFn: 'onChangeFn(lineMoh)',
      openMediaMgrModal: 'openMediaMgrModal()',
    });

    this.$scope.companyMoh = MEDIA_FILE_1;
    this.$scope.lineMohOptions = this.lineMediaOptions;
    this.$scope.$apply();
  });

  it('should have a select element with options', function() {
    expect(this.view).toContainElement(MEDIA_ON_HOLD_SELECT);
    expect(this.view.find(MEDIA_ON_HOLD_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('sample-media-1');
    expect(this.view.find(MEDIA_ON_HOLD_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('sample-media-2');
    expect(this.view.find(MEDIA_ON_HOLD_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('sample-media-3');
  });

  it('should invoke onChangeFn when a format is chosen', function() {
    this.view.find(MEDIA_ON_HOLD_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(MEDIA_FILE_2);
  });
});
