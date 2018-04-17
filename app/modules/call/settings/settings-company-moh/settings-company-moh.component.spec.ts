import companyMohModule from './index';

describe('Component: companyMoh', () => {
  const COMPANY_MOH_SELECT = '.csSelect-container[name="mediaOnHoldSelect"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const MEDIA_FILE_1 = 'drbd-1234-g79e-0op3';
  const MEDIA_FILE_2 = 'bjek-3491-fu69-l140';
  const companyMediaOptions = getJSONFixture('huron/json/settings/company-moh.json');

  beforeEach(function () {
    this.initModules(companyMohModule);
    this.injectDependencies(
      '$scope',
      '$modal',
    );

    spyOn(this.$modal, 'open').and.returnValue(true);

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucCompanyMediaOnHold', {
      companyMoh: 'companyMoh',
      companyMohOptions: 'companyMohOptions',
      onChangeFn: 'onChangeFn(companyMoh)',
      openMediaMgrModal: 'openMediaMgrModal()',
    });

    this.$scope.companyMoh = MEDIA_FILE_1;
    this.$scope.companyMohOptions = companyMediaOptions;
    this.$scope.$apply();
  });

  it('should have a select element with options', function() {
    expect(this.view).toContainElement(COMPANY_MOH_SELECT);
    expect(this.view.find(COMPANY_MOH_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('sample-media-1');
    expect(this.view.find(COMPANY_MOH_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('sample-media-2');
    expect(this.view.find(COMPANY_MOH_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('sample-media-3');
  });

  it('should invoke onChangeFn when a format is chosen', function() {
    this.view.find(COMPANY_MOH_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(MEDIA_FILE_2);
  });
});
