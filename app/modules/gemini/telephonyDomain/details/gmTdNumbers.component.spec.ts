import testModule from '../index';

describe('Component: gmTdNumbers', () => {
  beforeEach(function () {
    this.preData = _.cloneDeep(getJSONFixture('gemini/common.json'));

    this.submittedTD = this.preData.submittedTD;
    this.constObject = this.preData.gmTdConstObject;
    this.allOptions = this.preData.gmTdAllOptions;
    this.newAccessNumber = this.preData.newAccessNumber;
    this.exsitedAccessNumber = this.preData.exsitedAccessNumber;
    this.nonccaAccessNumber = this.preData.nonccaAccessNumber;

    this.fakeModal = {
      result: {
        then: function (okCallback, cancelCallback) {
          this.okCallback = okCallback;
          this.cancelCallback = cancelCallback;
        },
      },
      ok: function (item) {
        this.result.okCallback(item);
      },
      cancel: function (type) {
        this.result.cancelCallback(type);
      },
    };
  });

  beforeEach(function () {
    this.telephonyNumber = _.assign({}, this.preData.gmTdNumber);
    this.telephonyNumbers = [];
    this.accessNumberEntity = {};
    this.postResponse = {
      code: 5003,
    };
    this.rows = [];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope', 'UrlConfig', '$httpBackend', '$state', '$modal', 'gemService', 'TelephonyNumberDataService', '$q', 'Notification', '$translate', '$timeout', 'TelephonyDomainService', 'PreviousState', 'WindowLocation');
    initSpies.apply(this);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initSpies() {
    spyOn(this.PreviousState, 'go');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$modal, 'open').and.returnValue(this.fakeModal);
    spyOn(this.TelephonyDomainService, 'getNumbers').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getAccessNumberInfo').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'postTelephonyDomain').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'exportNumbersToCSV').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getDownloadUrl').and.returnValue('downloadUrl');
    spyOn(this.WindowLocation, 'set');
  }

  function initConstObjectAndAllOptions() {
    this.controller.constObject = this.constObject;
    this.TelephonyNumberDataService.constObject = this.constObject;
    this.TelephonyNumberDataService.tollTypeOptions = this.allOptions.tollTypeOptions;
    this.TelephonyNumberDataService.callTypeOptions = this.allOptions.callTypeOptions;
    this.TelephonyNumberDataService._countryOptions = this.allOptions._countryOptions;
    this.TelephonyNumberDataService.countryOptions = this.allOptions.countryOptions;
    this.TelephonyNumberDataService.countryId2NameMapping = this.allOptions.countryId2NameMapping;
    this.TelephonyNumberDataService.countryName2IdMapping = this.allOptions.countryName2IdMapping;
    this.TelephonyNumberDataService.isHiddenOptions = this.allOptions.isHiddenOptions;
    this.TelephonyNumberDataService.defaultNumberOptions = this.allOptions.defaultNumberOptions;
    this.TelephonyNumberDataService.globalDisplayOptions = this.allOptions.globalDisplayOptions;
  }

  function updateTDAndShowNumber(telephonyNumbers) {
    telephonyNumbers = telephonyNumbers || [ this.telephonyNumber ];

    for (let i = 0; i < telephonyNumbers.length; i++) {
      this.telephonyNumbers.push(telephonyNumbers[i]);
    }

    this.TelephonyDomainService.getNumbers.and.returnValue(this.$q.resolve(this.telephonyNumbers));
    updateTD.apply(this);
  }

  function updateTD() {
    this.gemService.setStorage('currentTelephonyDomain', this.submittedTD);
    initComponent.apply(this);
    this.$timeout.flush();

    const gridApi = this.TelephonyNumberDataService.gridApi;
    this.rows = gridApi.core.getVisibleRows(gridApi.grid);
  }

  function initComponent() {
    this.$state.current.data = {};
    this.$state.sidepanel = { dismiss: Function };

    this.gemService.setStorage('remedyTicket', {});
    this.gemService.setStorage('currentTdNotes', [ 'note' ]);
    this.gemService.setStorage('currentTdHistories', [ 'history' ]);

    const getCountriesUrl = this.UrlConfig.getGeminiUrl() + 'countries';
    this.$httpBackend.expectGET(getCountriesUrl).respond(200, this.preData.getCountries);
    this.$httpBackend.flush();

    this.compileComponent('gmTdNumbers', {});
    this.$scope.$apply();

    initConstObjectAndAllOptions.apply(this);
  }

  it('$onInit > edit TD', function () {
    updateTDAndShowNumber.apply(this);
    expect(this.controller.gridData.length).toBe(1);
  });

  it('$onInit > edit TD and add new number', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.addNumber();
    this.$scope.$apply();
    this.$timeout.flush(10);
    expect(this.controller.gridData.length).toBe(2);
  });

  it('$onInit > edit TD and sort number', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber, { tollType: '' })];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.TelephonyNumberDataService.sortDropdownList(this.rows[0].entity.tollType, this.rows[1].entity.tollType);
    this.controller.TelephonyNumberDataService.sortDropdownList(this.rows[0].entity.callType, this.rows[1].entity.callType);

    expect(this.controller.gridData.length).toBe(2);
  });

  it('$onInit > edit TD with only one deleted number', function () {
    this.telephonyNumber.compareToSuperadminPhoneNumberStatus = 3;

    updateTDAndShowNumber.apply(this);
    expect(this.controller.gridData.length).toBe(0);
  });

  it('changePhone > resetDuplicateRowValidation', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { defaultNumber: '0' }));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();

    this.rows[0].entity.phone = '77777777';
    this.controller.changePhone(this.rows[0], '1111111');
    expect(this.rows[0].entity.duplicatedRowValidation.invalid).toBe(false);
  });

  it('changeLabel > resetDuplicateRowValidation', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { defaultNumber: '0' }));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();

    this.rows[0].entity.label = 'p11';
    this.controller.changeLabel(this.rows[0], 'p1');
    expect(this.rows[0].entity.duplicatedRowValidation.invalid).toBe(false);
  });

  it('changeDnisNumber > resetDuplicateRowValidation', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { defaultNumber: '0' }));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();

    this.rows[0].entity.dnisNumberFormat = '33333333333';
    this.controller.changeDnisNumber(this.rows[0], '11133333333');
    expect(this.rows[0].entity.duplicatedRowValidation.invalid).toBe(false);
  });

  it('changeAccessNumber > invalid empty access number', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.dnisNumberFormat = '';
    this.controller.changeAccessNumber(this.rows[0]);
    expect(this.rows[0].entity.typeDisabled).toBe(true);
  });

  it('changeAccessNumber > get access number info not existed in super admin', function () {
    updateTDAndShowNumber.apply(this);

    this.accessNumberEntity = [];
    this.accessNumberEntity.push(this.newAccessNumber);
    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.accessNumberEntity));

    this.rows[0].entity.dnisNumberFormat = '123456789';
    this.controller.changeAccessNumber(this.rows[0]);
    this.$scope.$apply();

    expect(this.rows[0].entity.typeDisabled).toBe(false);
  });

  it('changeAccessNumber > get access number info existed in super admin', function () {
    updateTDAndShowNumber.apply(this);

    this.accessNumberEntity = [];
    this.accessNumberEntity.push(this.exsitedAccessNumber);
    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.accessNumberEntity));

    this.rows[0].entity.dnisNumberFormat = '123456789';
    this.controller.changeAccessNumber(this.rows[0]);
    this.$scope.$apply();

    expect(this.rows[0].entity.typeDisabled).toBe(true);
  });

  it('changeAccessNumber > get non CCA access number info', function () {
    updateTDAndShowNumber.apply(this);

    this.accessNumberEntity = [];
    this.accessNumberEntity.push(this.nonccaAccessNumber);
    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.accessNumberEntity));

    this.rows[0].entity.dnisNumberFormat = '123456789';
    this.controller.changeAccessNumber(this.rows[0]);
    this.$scope.$apply();

    expect(this.rows[0].entity.validation.dnisNumberFormat.invalid).toBe(true);
  });

  it('changeTollType > get access number info', function () {
    updateTDAndShowNumber.apply(this);

    this.accessNumberEntity = [];
    this.accessNumberEntity.push(this.newAccessNumber);
    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.accessNumberEntity));

    this.rows[0].entity.dnisNumberFormat = '123456789';
    this.controller.changeAccessNumber(this.rows[0]);
    this.$scope.$apply();

    this.controller.changeTollType(this.rows[0]);

    expect(this.rows[0].entity.typeDisabled).toBe(false);
  });

  it('changeCallType > get access number info', function () {
    updateTDAndShowNumber.apply(this);

    this.accessNumberEntity = [];
    this.accessNumberEntity.push(this.newAccessNumber);
    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.accessNumberEntity));

    this.rows[0].entity.dnisNumberFormat = '123456789';
    this.controller.changeAccessNumber(this.rows[0]);
    this.$scope.$apply();

    this.controller.changeCallType(this.rows[0]);

    expect(this.rows[0].entity.typeDisabled).toBe(false);
  });

  it('changeDefaultNumber > change the second number to Default Toll', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { defaultNumber: '0' }));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.rows[1].entity.defaultNumber = { label: 'Default Toll', value: '1' };
    this.controller.changeDefaultNumber(this.rows[1]);

    expect(this.rows[1].entity.isHnDisabled).toBe(true);
  });

  it('changeDefaultNumber > change the second number to Default Toll Free', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];
    _.assign(telephonyNumbers[0], { tollType: 'CCA Toll Free' });
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { tollType: 'CCA Toll Free', defaultNumber: '0' }));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.rows[1].entity.defaultNumber = { label: 'Default Toll Free', value: '1' };
    this.controller.changeDefaultNumber(this.rows[1]);

    expect(this.rows[1].entity.isHnDisabled).toBe(true);
  });

  it('changeDefaultNumber > resetDefaultNumberValidation', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.defaultNumber = { label: '', value: '0' };
    this.controller.submitTD();

    this.rows[0].entity.defaultNumber = { label: 'Default Toll', value: '1' };
    this.controller.changeDefaultNumber(this.rows[0]);

    expect(this.rows[0].entity.defaultNumberValidation.invalid).toBe(false);
  });

  it('changeGlobalDisplay > resetGlobalDisplayValidation', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.globalListDisplay = { label: 'NO', value: '0' };
    this.controller.submitTD();

    this.rows[0].entity.globalListDisplay = { label: 'Display', value: '1' };
    this.controller.changeGlobalDisplay(this.rows[0]);

    expect(this.rows[0].entity.globalDisplayValidation.invalid).toBe(false);
  });

  it('changeHiddenOnClient > resetPhnNumDisplayValidation', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.isHidden = { label: 'Hidden', value: true };
    this.controller.submitTD();

    this.rows[0].entity.isHidden = { label: 'Display', value: false };
    this.controller.changeHiddenOnClient(this.rows[0]);

    expect(this.rows[0].entity.phnNumDisplayValidation.invalid).toBe(false);
  });

  it('delete Number > delete one submitted number', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.submitLoading = true;
    this.controller.deleteNumber(this.rows[0]);

    this.controller.submitLoading = false;
    this.controller.deleteNumber(this.rows[0]);
    this.$timeout.flush();
    expect(this.controller.gridData.length).toBe(0);
  });

  it('delete Number > delete one number imported from TD', function () {
    updateTDAndShowNumber.apply(this);

    const importTDNumbers = [ this.telephonyNumber ];
    this.gemService.setStorage('currentTelephonyDomain', { importTDNumbers: importTDNumbers });
    this.controller.importTD();
    this.fakeModal.ok();
    this.$timeout.flush();
    this.$scope.$apply();

    this.controller.deleteNumber(this.rows[1]);
    this.$timeout.flush();
    expect(this.controller.gridData.length).toBe(1);
  });

  it('download template', function () {
    initComponent.apply(this);
    this.controller.downloadTemplate();
    this.fakeModal.ok();

    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('import TD', function () {
    updateTDAndShowNumber.apply(this);

    const importTDNumbers = [ this.telephonyNumber ];
    this.gemService.setStorage('currentTelephonyDomain', { importTDNumbers: importTDNumbers });
    this.controller.importTD();
    this.fakeModal.ok();
    this.$timeout.flush();
    this.$scope.$apply();

    expect(this.controller.gridData.length).toBe(2);
  });

  it('import CSV', function () {
    updateTDAndShowNumber.apply(this);

    const number = _.assign({}, this.telephonyNumber, { country: 'US' });
    delete number.countryId;

    this.controller.importNumberCSV([ number ]);
    this.$timeout.flush();

    expect(this.controller.gridData.length).toBe(2);
  });

  it('onEditTD > change region', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.submitLoading = true;
    this.controller.onEditTD();

    const importTDNumbers = [ this.telephonyNumber ];
    this.gemService.setStorage('currentTelephonyDomain', { importTDNumbers: importTDNumbers });
    this.controller.submitLoading = false;
    this.controller.importTD();
    this.fakeModal.ok();
    this.$scope.$apply();

    this.controller.onEditTD();
    const currentTD = this.gemService.getStorage('currentTelephonyDomain');
    currentTD.region = 'US';

    this.fakeModal.ok();
    this.$scope.$apply();

    expect(this.controller.gridData.length).toBe(1);
  });

  it('export to CSV', function () {
    updateTDAndShowNumber.apply(this);
    this.controller.exportToCSV();
    this.$scope.$apply();

    this.TelephonyDomainService.exportNumbersToCSV.and.returnValue(this.$q.reject({ status: 404 }));
    this.controller.exportToCSV();
    this.$timeout.flush(1500);
    this.$scope.$apply();

    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('onCancel', function () {
    initComponent.apply(this);
    this.controller.onCancel();
    expect(this.PreviousState.go).toHaveBeenCalled();
  });

  it('submitTD > validatePhone', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.phone = '';
    this.controller.submitTD();

    this.rows[0].entity.phone = '<>';
    this.controller.submitTD();

    this.rows[0].entity.phone = '123';
    this.controller.submitTD();

    expect(this.rows[0].entity.validation.phone.invalid).toBe(true);
  });

  it('submitTD > validateLabel', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.label = '';
    this.controller.submitTD();

    this.rows[0].entity.label = '测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测';
    this.controller.submitTD();

    expect(this.rows[0].entity.validation.label.invalid).toBe(true);
  });

  it('submitTD > validateAccessNumber', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.dnisNumberFormat = '';
    this.controller.submitTD();

    this.rows[0].entity.dnisNumberFormat = '123';
    this.controller.submitTD();

    expect(this.rows[0].entity.validation.dnisNumberFormat.invalid).toBe(true);
  });

  it('submitTD > validateTollType', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.tollType = { label: 'Select Type', value: '' };
    this.controller.submitTD();

    expect(this.rows[0].entity.validation.tollType.invalid).toBe(true);
  });

  it('submitTD > validateCallType', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.callType = { label: 'Select Type', value: '' };
    this.controller.submitTD();

    expect(this.rows[0].entity.validation.callType.invalid).toBe(true);
  });

  it('submitTD > validateCountry', function () {
    updateTDAndShowNumber.apply(this);

    this.rows[0].entity.country = { label: 'Select Country', value: '' };
    this.controller.submitTD();

    expect(this.rows[0].entity.validation.country.invalid).toBe(true);
  });

  xit('submitTD > validateNumbersCount > exceed 300 numbers', function () {
    const telephonyNumbers: any = [];
    for (let i = 0; i < 301; i++) {
      telephonyNumbers.push(_.assign({}, this.telephonyNumber));
    }
    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('submitTD > validateDefaultNumber > have two default toll numbers', function () {
    const telephonyNumbers: any = [];
    for (let i = 0; i < 2; i++) {
      telephonyNumbers.push(_.assign({}, this.telephonyNumber));
    }
    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();
    expect(this.rows[1].entity.defaultNumberValidation.invalid).toBe(true);
  });

  it('submitTD > validateDefaultNumber > have two default toll free numbers', function () {
    const telephonyNumbers: any = [_.assign({}, this.telephonyNumber)];
    for (let i = 0; i < 2; i++) {
      telephonyNumbers.push(_.assign({}, this.telephonyNumber, { tollType: 'CCA Toll Free' }));
    }
    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();
    expect(this.rows[2].entity.defaultNumberValidation.invalid).toBe(true);
  });

  it('submitTD > validateConflictDnisNumber > same access number have conflict toll type', function () {
    const telephonyNumbers: any = [_.assign({}, this.telephonyNumber, { phone: '123456789' })];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { tollType: 'CCA Toll Free' }));
    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();
    expect(this.rows[1].entity.validation.tollType.invalid).toBe(true);
  });

  it('submitTD > validatePhoneNumberDisplay > same phone number are all display on client', function () {
    const telephonyNumbers: any = [_.assign({}, this.telephonyNumber, { label: 'p11' })];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { defaultNumber: '0' }));
    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.controller.submitTD();
    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('submitTD successfully', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { phone: '22222222', defaultNumber: '0' }));
    telephonyNumbers.push(_.assign({}, this.telephonyNumber, { phone: '33333333', defaultNumber: '0' }));

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    this.rows[0].entity.phone = '00000000';
    this.controller.deleteNumber(this.rows[2]);

    const number = _.assign({}, this.telephonyNumber, { phone: '44444444', country: 'US', defaultNumber: '0' });
    delete number.countryId;

    this.controller.importNumberCSV([ number ]);
    this.$timeout.flush();

    this.postResponse.code = 5000;
    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.resolve(this.postResponse));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();

    expect(this.controller.gridData.length).toBe(3);
  });

  it('submitTD fail', function () {
    updateTDAndShowNumber.apply(this);

    this.postResponse.code = 5003;
    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.resolve(this.postResponse));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();
    expect(this.Notification.error).toHaveBeenCalled();

    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.reject({ status: 404 }));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();
    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('$onInit > TelephonyNumberDataService initCountries', function () {
    const telephonyNumbers = [_.assign({}, this.telephonyNumber)];

    updateTDAndShowNumber.apply(this, [telephonyNumbers]);

    const gmCountry = {
      countryOptions : { label: 'US', value: 1 },
      countryId2NameMapping : { 1: 'US' },
      countryName2IdMapping : { US: 1 },
    };
    this.gemService.setStorage('gmCountry', gmCountry);
    this.controller.TelephonyNumberDataService.initCountries();

    expect(this.controller.gridData.length).toBe(1);
  });

  it('changeAccessNumber > get access number info return error', function () {
    updateTDAndShowNumber.apply(this);

    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.reject( { status: 404 } ));

    this.rows[0].entity.dnisNumberFormat = '123456789';
    this.controller.changeAccessNumber(this.rows[0]);
    this.$scope.$apply();

    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('$onInit > edit TD > get Numbers return error', function () {
    this.TelephonyDomainService.getNumbers.and.callFake(() => {
      return this.$q.reject({ status: 404 });
    });
    updateTD.apply(this);

    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

});
