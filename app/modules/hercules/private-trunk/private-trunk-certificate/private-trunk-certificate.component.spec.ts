import privateTrunkCertificateModule from './index';

describe('Component: privateTrunkCertificate component', () => {
  const CHK_BOX = 'input#certificateChk';
  const ICON_UPLOAD = '.icon.icon-upload';

  beforeEach(function() {
    this.initModules(privateTrunkCertificateModule);
    this.injectDependencies(
      '$scope',
      '$translate',
      'PrivateTrunkCertificateService',
      '$httpBackend',
      'FeatureToggleService',
      '$q',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onChangeOptionFn = jasmine.createSpy('onChangeOptionFn');
    spyOn(this.PrivateTrunkCertificateService, 'deleteCert');
    spyOn(this.PrivateTrunkCertificateService, 'deleteCerts');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));

    this.initComponent = (): void => {
      this.compileComponent('privateTrunkCertificate', {
        isFirstTimeSetup: true,
        formattedCertList: 'formattedCertList',
        isImporting: 'isImporting',
        onChangeFn: 'onChangeFn',
        onChangeOptionFn : 'onChangeOptionFn',
      });
    };
    this.initComponent();
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should have checkbox custom certificate Setup', function() {
    expect(this.view).toContainElement(CHK_BOX);
  });

  it('should verify a custom Cisco Certificate is selected', function() {
    expect(this.view).toContainElement(CHK_BOX);
    this.view.find(CHK_BOX).click();
    expect(this.view.find(CHK_BOX)).toBeChecked();
  });

  it('should verify Certificate upload icon is present', function() {
    expect(this.view).toContainElement(CHK_BOX);
    this.view.find(CHK_BOX).click();
    expect(this.view.find(CHK_BOX)).toBeChecked();
    expect(this.view.find(ICON_UPLOAD)).toExist();
  });

  // 2017 name change
  it('name usage should be certDescNew as default', function () {
    this.initComponent();
    expect(this.view.text()).toContain('servicesOverview.cards.privateTrunk.certDescNew');
  });
});
