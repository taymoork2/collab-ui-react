import privateTrunkDestinationModule from './index';

describe('Component: privateTrunkDestination component', () => {
  const RADIO_OPTION1 = 'input#destinationRadio1';
  const RADIO_OPTION2 = 'input#destinationRadio2';
  const INPUT_ADDRESS = 'input#destination0';
  const INPUT_NAME = 'input#name0';
  const INPUT_ADDRESS1 = 'input#destination1';
  const INPUT_NAME1 = 'input#name1';
  const ADD_DESTINATION = '#addDestination';
  const HYBRID_ADDRESS = '#hybridAddress';
  const HYBRID_NAME = 'input#hybridName';
  const EXIT_ICON = '.icon.icon-exit-outline';

  beforeEach(function() {
    this.initModules(privateTrunkDestinationModule);
    this.injectDependencies(
      '$scope',
      '$translate',
      'Authinfo',
      'USSService',
      '$q',
      'PrivateTrunkService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(this.USSService, 'getOrg').and.returnValue(this.$q.resolve({ uuid: '123', sipDomain: 'test.com', lastSyncTime: '2017-04-10T16:19:53.430Z' }));
    spyOn(this.PrivateTrunkService, 'isValidUniqueSipDestination').and.returnValue(this.$q.resolve(true));
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.destinationRadio = 'new';
    this.compileComponent('privateTrunkDestination', {
      isFirstTimeSetup: true,
      privateTrunkResource: 'privateTrunkResource',
      onChangeFn: 'onChangeFn(selected)',
    });
  });

  it('should have both radio buttons for SIP Destination Setup', function() {
    expect(this.view).toContainElement(RADIO_OPTION1);
    expect(this.view).toContainElement(RADIO_OPTION2);
  });

  it('should verify a New SIP Destination is set', function() {

    expect(this.view).toContainElement(RADIO_OPTION1);
    this.view.find(RADIO_OPTION1).click();
    expect(this.view.find(RADIO_OPTION1)).toBeChecked();
    expect(this.view).toContainElement(INPUT_ADDRESS);
    expect(this.view).toContainElement(INPUT_NAME);
    this.view.find(INPUT_ADDRESS).val('destination').change();
    this.view.find(INPUT_NAME).val('name').change().blur();
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('should verify second SIP destination is set', function() {
    let destination = 'sipConnector.org';
    let name = 'SIP Connector Remote';

    expect(this.view).toContainElement(RADIO_OPTION1);
    this.view.find(RADIO_OPTION1).click().click();
    expect(this.view.find(RADIO_OPTION1)).toBeChecked();
    this.view.find(INPUT_ADDRESS).val(destination).change().blur();
    this.view.find(INPUT_NAME).val(name).change().blur();
    this.view.find(ADD_DESTINATION).click();
    this.view.find(INPUT_ADDRESS1).val(destination).change().blur();
    this.view.find(INPUT_NAME1).val(name).change().blur();
    expect(this.view).toContainElement(INPUT_ADDRESS1);
    expect(this.view).toContainElement(EXIT_ICON);
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('should set only the name of existing hybrid destination', function() {
    let name = 'SIP Connector Remote';
    expect(this.view).toContainElement(RADIO_OPTION2);
    this.view.find(RADIO_OPTION2).click().click();
    expect(this.view.find(RADIO_OPTION2)).toBeChecked();
    expect(this.view.find(HYBRID_ADDRESS)).toExist();
    this.view.find(HYBRID_NAME).val(name).change();
    expect(this.view).toContainElement(HYBRID_NAME);
    expect(this.$scope.onChangeFn).toHaveBeenCalled();
  });

  it('invalidate SIP destination address having invalid char-@', function() {
    ['!', '$', '%', '%%^', 'sip!!!.com'].forEach(domain => {
      expect(this.controller.invalidCharactersValidation(domain)).toBeFalsy();
    });
  });

  it('invalidate SIP destination address having  char _', function() {
    let testAddress = 'ABC_test-123.com';
    expect(this.controller.invalidCharactersValidation(testAddress)).toBeFalsy();
  });

  it('validate SIP destination address having valid chars', function() {
    let testAddress = 'ABC-test-123.com';
    expect(this.controller.invalidCharactersValidation(testAddress)).toBeTruthy();
  });

  it('invalidate SIP destination port', function() {
    let testAddress = 'ABC-test-123.com:65536';
    expect(this.controller.portValidation(testAddress)).toBeFalsy();
  });

  it('validate SIP destination port', function() {
    let testAddress = 'ABC-test-123.com:5061';
    expect(this.controller.portValidation(testAddress)).toBeTruthy();
  });

  it('validate SIP destination port', function() {
    let testAddress = 'ABC-test-123.com:5061';
    expect(this.controller.uniqueDomainValidation(testAddress)).toBeTruthy();
  });

  it('invalidate SIP destination IP address input', function() {
    let testAddress = '10.89.123.1:5061';
    expect(this.controller.invalidCharactersValidation(testAddress)).toBeFalsy();
  });

  it('validate SIP destination domain with numeric input', function() {
    let testAddress = 'aa10.aa.com:5061';
    expect(this.controller.invalidCharactersValidation(testAddress)).toBeTruthy();
  });

  it('validate SIP destination domain part length not exceed 63', function() {
    let testAddress = 'aaaa0123456789-0123456789-0123456789-0123456789-0123456789-012345.aa.com:5061';
    expect(this.controller.invalidCharactersValidation(testAddress)).toBeFalsy();
  });
});
