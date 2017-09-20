import testModule from '../index';

describe('Component: gmTdImportNumbersFromCsv', () => {
  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', '$scope', 'UrlConfig', '$httpBackend', '$timeout', 'gemService', 'Notification', 'TelephonyDomainService', '$modal');

    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.Notification, 'error');
    spyOn(this.$modal, 'open').and.returnValue({ result: this.$q.resolve() });
  }

  function initComponent() {
    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();

    this.compileComponent('gmTdImportNumbersFromCsv', {});
    this.$scope.$apply();
  }

  it('should parse the file content when selected a csv file', function () {
    initComponent.apply(this);
    this.controller.file = `PHONE NUMBER,PHONE LABEL,ACCESS NUMBER,TOLL TYPE,CALL TYPE,COUNTRY,HIDDEN ON CLIENT
    111111111,a,11111111,CCA Toll,International,Albania,Display
    55555555,a,1111111,CCA Toll,Domestic,Algeria,Display
    777777777,A,123113123123131,CCA Toll Free,Domestic,Algeria,Display
    88888888888,A,123131231,CCA Toll,International,Algeria,Display
    38888888888,A,123131231,CCA Toll,International,Algeria,Display
    6666666,a,111111111,CCA Toll,Domestic,Andorra,Display
    000000000,111111111,22222222222222,CCA Toll Free,,United States of America,Hidden
    222222222,a,111111111,CCA Toll,Domestic,American Samoa,Display
    333333333,a,11111111,CCA Toll,International,Albania,Display
    `;
    this.controller.fileName = 'test';
    this.$scope.$digest();
    this.$timeout.flush();
    expect(this.controller.uploadProgress).toBe(100);
  });

  it('should show the dialog when click the button', function () {
    initComponent.apply(this);
    this.view.find('#btnImport').click();
    this.$scope.$digest();
    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('should show error message when failed to parse file content', function () {
    initComponent.apply(this);
    this.controller.file =  `PHONE NUMBER,PHONE LABEL,ACCESS NUMBER,TOLL TYPE,CALL TYPE,COUNTRY,HIDDEN ON CLIENT
    11111,11111,22222`;
    this.controller.validateCsv();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should show error message when no phone numbers found', function () {
    initComponent.apply(this);
    this.controller.file = `PHONE NUMBER,PHONE LABEL,ACCESS NUMBER`;
    this.controller.validateCsv();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should show error message when file size is more than 10M', function () {
    initComponent.apply(this);
    this.controller.onFileSizeError();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should show error message when file content is not valid', function () {
    initComponent.apply(this);
    this.controller.file =  `PHONE NUMBER,PHONE LABEL,ACCESS NUMBER,TOLL TYPE,CALL TYPE,COUNTRY,HIDDEN ON CLIENT
    <script>alert('eee');</script>,<script type="text/javascript">alert('eee');</script>,"=""11111111""","=""CCA Toll""","=""International""","=""Albania""","=""Display"""
    1,2,3,4,5,6,7`;
    this.controller.validateCsv();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('should show error message when file type is not csv', function () {
    initComponent.apply(this);
    this.controller.onFileTypeError();
    expect(this.Notification.error).toHaveBeenCalled();
  });
});
