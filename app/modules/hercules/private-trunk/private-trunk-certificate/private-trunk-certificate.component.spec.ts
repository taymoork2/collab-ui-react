import privateTrunkCertificateModule from './index';

describe('Component: privateTrunkCertificate component', () => {
  const CHK_BOX = 'input#certificateChk';
  const ICON_UPLOAD = '.icon.icon-upload-contain';

  beforeEach(function() {
    this.initModules(privateTrunkCertificateModule);
    this.injectDependencies(
      '$scope',
      '$translate',
      'PrivateTrunkCertificateService',
      '$httpBackend',
    );
  });

  function initComponent() {
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onDeleteCertFn = jasmine.createSpy('onDeleteCertFn');
    this.$scope.onChangeOptionFn = jasmine.createSpy('onChangeOptionFn');

    spyOn(this.PrivateTrunkCertificateService, 'deleteCert');
    spyOn(this.PrivateTrunkCertificateService, 'deleteCerts');

    this.compileComponent('privateTrunkCertificate', {
      isFirstTimeSetup: true,
      formattedCertList: 'formattedCertList',
      isImporting: 'isImporting',
      onChangeFn: 'onChangeFn',
      onChangeOptionFn : 'onChangeOptionFn',
    });
  }

  describe('init', () => {
    beforeEach(initComponent);

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should have both radio buttons for SIP certificate Setup', function() {
      expect(this.view).toContainElement(CHK_BOX);
    });

    it('should verify a default Cisco Certificate option is selected', function() {
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
  });
});
