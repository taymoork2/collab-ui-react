import privateTrunkCertificateModule from './index';

describe('Component: privateTrunkcertificate component', () => {
  const RADIO_OPTION1 = 'input#certificateRadio1';
  const RADIO_OPTION2 = 'input#certificateRadio2';
  const ICON_UPLOAD = '.icon.icon-upload-contain';

  beforeEach(function() {
    this.initModules(privateTrunkCertificateModule);
    this.injectDependencies(
      '$scope',
      '$translate',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onDeleteCertFn = jasmine.createSpy('onDeleteCertFn');
    this.$scope.onChangeOptionFn = jasmine.createSpy('onChangeOptionFn');

    this.$scope.certificateRadio = 'default';
    this.compileComponent('privateTrunkCertificate', {
      formattedCertList: 'formattedCertList',
      isImporting: 'isImporting',
      onChangeFn: 'onChangeFn',
      onDeleteCertFn: 'onDeleteCertFn',
      onChangeOptionFn : 'onChangeOptionFn',
    });
  });

  it('should have both radio buttons for SIP certificate Setup', function() {
    expect(this.view).toContainElement(RADIO_OPTION1);
    expect(this.view).toContainElement(RADIO_OPTION2);
  });

  it('should verify a default Cisco Certificate option is selected', function() {
    expect(this.view).toContainElement(RADIO_OPTION1);
    this.view.find(RADIO_OPTION1).click();
    expect(this.view.find(RADIO_OPTION1)).toBeChecked();
  });

  it('should verify Certificate upload icon is present', function() {
    expect(this.view).toContainElement(RADIO_OPTION2);
    this.view.find(RADIO_OPTION2).click().click();
    expect(this.view.find(RADIO_OPTION2)).toBeChecked();
    expect(this.view.find(ICON_UPLOAD)).toExist();
  });

});
