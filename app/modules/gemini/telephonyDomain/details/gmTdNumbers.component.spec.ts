import testModule from '../index';

const TOLL_TYPE = [{ label: 'CCA Toll', value: 'CCA Toll' }, { label: 'CCA Toll Free', value: 'CCA Toll Free' }];
const DEFAULT_NUMBER = [{ label: 'Default Toll', value: '1' }, { label: 'Default Toll Free', value: '1' }];
const GLOBAL_DISPLAY = [{ label: 'Display', value: '1' }, { label: 'NO', value: '0' }];
const HIDDEN_ON_CLIENT = [{ label: 'Display', value: 'false' }, { label: 'Hidden', value: 'true' }];
describe('Component: gmTdNumbers', () => {
  beforeAll(function () {
    this.newTD = {
      ccaDomainId: '',
      customerId: 'ff808081527ccb3f0153116a3531041e',
      domainName: '',
      telephonyDomainId: '',
      region: 'EMEA',
      isEdit: true,
    };

    this.editTD = {
      ccaDomainId: 'ff808081527ccb3f0153116a3531041b',
      customerId: 'ff808081527ccb3f0153116a3531041e',
      domainName: 'xxy_test_TD',
      telephonyDomainId: '',
      region: 'EMEA',
      isEdit: true,
    };

    this.constObject = {
      SELECT_TYPE: 'Select Type',
      SELECT_COUNTRY: 'Select Country',
      CCA_TOLL: 'CCA Toll',
      CCA_TOLL_FREE: 'CCA Toll Free',
      INTERNATIONAL: 'International',
      DOMESTIC: 'Domestic',
      DEFAULT_TOLL: 'Default Toll',
      DEFAULT_TOLL_FREE: 'Default Toll Free',
      DISPLAY: 'Display',
      HIDDEN: 'Hidden',
      NO: 'NO',
      DATA_STATUS: { NEW: 1, UPDATED: 2, DELETED: 3, NO_CHANGE: 4 },
    };

    this.number = {
      dnisId: 'ff8080815bcce6c9015bead026e20d24',
      countryId: 1,
      tollType: 'CCA Toll',
      phone: '1111111',
      label: 'p1',
      dnisNumber: '11133333333',
      dnisNumberFormat: '11133333333',
      phoneType: 'Domestic',
      defaultDialInLanguage: '',
      firstAltChoice: '',
      secondAltChoice: '',
      compareToSuperadminPhoneNumberStatus: '0',
      superAdminCallInNumberDto: null,
      spCustomerId: 'ff808081570807760157d570572619f4',
      defaultNumber: '1',
      globalListDisplay: '1',
      ccaDomainId: 'ff8080815bcce6c9015bead026df0d23',
      isHidden: 'false',
    };

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
    this.mockData = {
      telephonyNumbers: {
        content: {
          data: {
            returnCode: 0,
            body: [],
          },
        },
      },
      accessNumber: {
        content: {
          data: {
            body: [
              { id: 0,
                number: '123456789',
                tollType: null,
                callType: null,
                billingFormat: null,
                languages: null,
                accessNumberGroup: null,
              },
            ],
            returnCode: 0,
            trackId: '',
          },
        },
      },
      returnError: {
        content: {
          data: {
            returnCode: 500,
            trackId: '',
          },
        },
      },
      postFail: {
        content: {
          data: {
            code: 5002,
            message: 'submit fail',
          },
        },
      },
      postSuccess: {
        content: {
          data: {
            code: 5000,
          },
        },
      },
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope', '$state', '$modal', 'gemService', '$q', 'Notification', '$translate', '$timeout', '$interval', 'TelephonyDomainService', 'PreviousState');
    initSpies.apply(this);
  });

  function initSpies() {
    spyOn(this.PreviousState, 'go');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'notify');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$modal, 'open').and.returnValue(this.fakeModal);
    spyOn(this.TelephonyDomainService, 'getNumbers').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getAccessNumberInfo').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'postTelephonyDomain').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'exportNumbersToCSV').and.returnValue(this.$q.resolve());
    spyOn(this.TelephonyDomainService, 'getDownloadUrl').and.returnValue('downloadUrl');
  }

  function initComponent() {
    this.$state.current.data = {};
    this.$state.sidepanel = { dismiss: Function };

    this.gemService.setStorage('remedyTicket', {});
    this.gemService.setStorage('currentTdNotes', [ 'note' ]);
    this.gemService.setStorage('currentTdHistories', [ 'history' ]);
    this.gemService.setStorage('countryOptions', [{ label: 'US', value: 1 }, { label: 'China', value: 2 }]);
    this.gemService.setStorage('countryId2NameMapping', { 1: 'US', 2: 'China' });
    this.gemService.setStorage('countryName2IdMapping', { US: 1, China: 2 });

    this.compileComponent('gmTdNumbers', {});
    this.$scope.$apply();

    this.controller.constObject = this.constObject;
  }

  function requestTDAndAddNumber() {
    this.gemService.setStorage('currentTelephonyDomain', this.newTD);
    initComponent.apply(this);
    this.controller.addNumber();
    this.$timeout.flush();
  }

  function updateTDAndShowNumber(num) {
    num = num ? num : 1;

    let body = this.mockData.telephonyNumbers.content.data.body;
    for (let i = 0; i < num; i++) {
      body.push(this.number);
    }

    this.TelephonyDomainService.getNumbers.and.returnValue(this.$q.resolve(this.mockData.telephonyNumbers));
    updateTD.apply(this);
  }

  function updateTD() {
    this.gemService.setStorage('currentTelephonyDomain', this.editTD);
    initComponent.apply(this);
    this.$timeout.flush(500);
    this.$interval.flush(10);
  }

  it('$onInit > edit TD', function () {
    updateTDAndShowNumber.apply(this);
    expect(this.controller.gridData.length).toBe(1);
  });

  it('$onInit > edit TD > get Numbers return error', function () {
    this.TelephonyDomainService.getNumbers.and.returnValue(this.$q.resolve(this.mockData.returnError));
    updateTD.apply(this);

    expect(this.Notification.notify).toHaveBeenCalled();
  });

  it('submit TD > validateForm > invalid Phone', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].phone = '';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.phone.invalid).toBe(true);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].phone = '~~~';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.phone.invalid).toBe(true);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].phone = '123456';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.phone.invalid).toBe(true);
  });

  it('submit TD > validateForm > invalid Label', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].label = '';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.label.invalid).toBe(true);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].label = '测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.label.invalid).toBe(true);
  });

  it('submit TD > validateForm > invalid Access Number', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].dnisNumberFormat = '';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.dnisNumberFormat.invalid).toBe(true);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].dnisNumberFormat = '123456';
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.dnisNumberFormat.invalid).toBe(true);
  });

  it('submit TD > validateForm > invalid TollType', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].tollType = { label: '', value: '' };
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.tollType.invalid).toBe(true);
  });

  it('submit TD > validateForm > invalid CallType', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].callType = { label: '', value: '' };
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.callType.invalid).toBe(true);
  });

  it('submit TD > validateForm > invalid Country', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].callType = { label: 'Domestic', value: 'Domestic' };
    this.controller.gridData[0].country = { label: '', value: '' };
    this.controller.submitTD();
    expect(this.controller.gridData[0].validation.country.invalid).toBe(true);
  });

  it('submit TD > validateDefaultNumber > invalid no Default Toll number', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.submitTD();
    expect(this.controller.gridData[0].defaultNumberValidation.invalid).toBe(true);
  });

  it('submit TD > validateDefaultNumber > invalid two Default Toll numbers', function () {
    updateTDAndShowNumber.apply(this, [2]);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[1].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[1].defaultNumber = DEFAULT_NUMBER[0];

    this.controller.submitTD();
    expect(this.controller.gridData[1].defaultNumberValidation.invalid).toBe(true);
  });

  it('submit TD > validateDefaultNumber > invalid two Default Toll Free numbers', function () {
    updateTDAndShowNumber.apply(this, [3]);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[1].tollType = TOLL_TYPE[1];
    this.controller.gridData[2].tollType = TOLL_TYPE[1];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[1].defaultNumber = DEFAULT_NUMBER[1];
    this.controller.gridData[2].defaultNumber = DEFAULT_NUMBER[1];

    this.controller.submitTD();
    expect(this.controller.gridData[2].defaultNumberValidation.invalid).toBe(true);
  });

  it('submit TD > validateGlobalDisplay > invalid no Display CCA Toll number', function () {
    updateTDAndShowNumber.apply(this);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[0].globalListDisplay = GLOBAL_DISPLAY[1];

    this.controller.submitTD();
    expect(this.controller.gridData[0].globalDisplayValidation.invalid).toBe(true);
  });

  it('submit TD > validateDuplicatedPhnNumber > invalid two duplicate numbers', function () {
    updateTDAndShowNumber.apply(this, [2]);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[0].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[1].tollType = TOLL_TYPE[1];

    this.controller.submitTD();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('submit TD > validateConflictDnisNumber > invalid two same access numbers have different toll type or call type', function () {
    updateTDAndShowNumber.apply(this, [2]);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[0].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[1].label = 'p2';
    this.controller.gridData[1].tollType = TOLL_TYPE[1];

    this.controller.submitTD();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('submit TD > validatePhoneNumberDisplay > invalid one phone number which appears once is hidden', function () {
    updateTDAndShowNumber.apply(this);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[0].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[0].isHidden = HIDDEN_ON_CLIENT[1];

    this.controller.submitTD();
    expect(this.Notification.error).toHaveBeenCalled();
  });

  it('submit TD > validatePhoneNumberDisplay > confirm two same phone numbers are display', function () {
    updateTDAndShowNumber.apply(this, [2]);
    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[0].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[0].isHidden = HIDDEN_ON_CLIENT[0];
    this.controller.gridData[1].dnisNumber = '22222222';
    this.controller.gridData[1].tollType = TOLL_TYPE[1];
    this.controller.gridData[1].isHidden = HIDDEN_ON_CLIENT[0];

    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.resolve(this.mockData.postFail));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();

    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.resolve(this.mockData.postSuccess));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();

    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.reject({ status: 404 }));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();

    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('submit TD > add & update & delete number successfully', function () {
    updateTDAndShowNumber.apply(this, [3]);
    let row = { entity: this.controller.gridData[0] };
    this.controller.deleteNumber(row);
    this.$scope.$apply();

    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    this.controller.gridData[0].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[0].isHidden = HIDDEN_ON_CLIENT[0];

    this.controller.gridData[1].phone = '22222222';
    this.controller.gridData[1].dnisNumber = '22222222';
    this.controller.gridData[1].dnisNumberFormat = '22222222';
    this.controller.gridData[1].tollType = TOLL_TYPE[1];
    this.controller.gridData[1].defaultNumber = DEFAULT_NUMBER[1];
    this.controller.gridData[1].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[1].isHidden = HIDDEN_ON_CLIENT[0];

    this.controller.addNumber();
    _.assign(this.controller.gridData[2], this.number);
    this.controller.gridData[2].dataType = 0;
    this.controller.gridData[2].phone = '33333333';
    this.controller.gridData[2].dnisNumber = '33333333';
    this.controller.gridData[2].dnisNumberFormat = '33333333';
    this.controller.gridData[2].tollType = TOLL_TYPE[1];
    this.controller.gridData[2].globalListDisplay = GLOBAL_DISPLAY[0];
    this.controller.gridData[2].isHidden = HIDDEN_ON_CLIENT[0];
    this.$scope.$apply();

    this.TelephonyDomainService.postTelephonyDomain.and.returnValue(this.$q.resolve(this.mockData.postSuccess));
    this.controller.submitTD();
    this.fakeModal.ok();
    this.$scope.$apply();

    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('change Access Number > input invalid access number', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].dnisNumberFormat = '';
    this.controller.gridData[0].dnisNumber = '';

    let row = { entity: this.controller.gridData[0] };
    this.controller.changeAccessNumber(row);
    expect(this.controller.gridData[0].typeDisabled).toBe(true);
  });

  it('change Access Number > input invalid access number then show notification', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].dnisNumberFormat = '12345678';

    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.mockData.returnError));
    let row = { entity: this.controller.gridData[0] };
    this.controller.changeAccessNumber(row);
    this.$scope.$apply();

    expect(this.Notification.notify).toHaveBeenCalled();
  });

  it('change Access Number > input new access number not existed in super admin', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].dnisNumberFormat = '12345678';

    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.mockData.accessNumber));
    let row = { entity: this.controller.gridData[0] };
    this.controller.changeAccessNumber(row);
    this.$scope.$apply();

    expect(this.controller.gridData[0].typeDisabled).toBe(false);
  });

  it('change Access Number > input access number existed in super admin', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].dnisNumberFormat = '123456789';
    this.mockData.accessNumber.content.data.body[0].tollType = 'CCA Toll';
    this.mockData.accessNumber.content.data.body[0].callType = 'Domestic';

    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.mockData.accessNumber));
    let row = { entity: this.controller.gridData[0] };
    this.controller.changeAccessNumber(row);
    this.$scope.$apply();

    expect(this.controller.gridData[0].typeDisabled).toBe(true);
  });

  it('change Access Number > input access number which is non CCA in super admin', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].dnisNumberFormat = '123456789';
    this.mockData.accessNumber.content.data.body[0].tollType = 'Toll';

    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.mockData.accessNumber));
    let row = { entity: this.controller.gridData[0] };
    this.controller.changeAccessNumber(row);
    this.$scope.$apply();

    expect(this.controller.gridData[0].typeDisabled).toBe(true);
  });

  it('change Access Number > input new access number existed in current TD', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.addNumber();
    this.controller.gridData[1].dnisNumberFormat = '11133333333';

    this.TelephonyDomainService.getAccessNumberInfo.and.returnValue(this.$q.resolve(this.mockData.accessNumber));
    let row = { entity: this.controller.gridData[1] };
    this.controller.changeAccessNumber(row);
    this.$scope.$apply();

    expect(this.controller.gridData[0].tollType.value).toEqual(this.controller.gridData[1].tollType.value);
  });

  it('change Toll Type', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    let row = { entity: this.controller.gridData[0] };

    this.controller.accessNumber2EntityMapping[this.number.dnisNumber] = { status: 0, tollType: 'CCA Toll' };
    this.controller.changeTollType(row);

    expect(this.controller.gridData.length).toBe(1);
  });

  it('change Call Type', function () {
    requestTDAndAddNumber.apply(this);

    _.assign(this.controller.gridData[0], this.number);
    let row = { entity: this.controller.gridData[0] };

    this.controller.accessNumber2EntityMapping[this.number.dnisNumber] = { status: 0, callType: 'Domestic' };
    this.controller.changeCallType(row);

    expect(this.controller.gridData.length).toBe(1);
  });

  it('change Default Number as Default Toll when only one number', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    let row = { entity: this.controller.gridData[0], uid: 'r0' };
    this.controller.changeDefaultNumber(row);

    expect(this.controller.curDefTollRow.uid).toBe('r0');
  });

  it('change Default Number as Default Toll Free when only one number', function () {
    requestTDAndAddNumber.apply(this);

    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[1];
    let row = { entity: this.controller.gridData[0], uid: 'r0' };
    this.controller.changeDefaultNumber(row);

    expect(this.controller.curDefTollFreeRow.uid).toBe('r0');
  });

  it('change Default Number as Default Toll when the other is Default Toll', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.gridData[0].tollType = TOLL_TYPE[0];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[0];
    let row = { entity: this.controller.gridData[0], uid: 'r0' };
    this.controller.changeDefaultNumber(row);

    this.controller.addNumber();
    this.controller.gridData[1].tollType = TOLL_TYPE[0];
    this.controller.gridData[1].defaultNumber = DEFAULT_NUMBER[0];
    row = { entity: this.controller.gridData[1], uid: 'r1' };
    this.controller.changeDefaultNumber(row);

    expect(this.controller.curDefTollRow.uid).toBe('r1');
  });

  it('change Default Number as Default Toll Free when the other is Default Toll Free', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.gridData[0].tollType = TOLL_TYPE[1];
    this.controller.gridData[0].defaultNumber = DEFAULT_NUMBER[1];
    let row = { entity: this.controller.gridData[0], uid: 'r0' };
    this.controller.changeDefaultNumber(row);

    this.controller.addNumber();
    this.controller.gridData[1].tollType = TOLL_TYPE[1];
    this.controller.gridData[1].defaultNumber = DEFAULT_NUMBER[1];
    row = { entity: this.controller.gridData[1], uid: 'r1' };
    this.controller.changeDefaultNumber(row);

    expect(this.controller.curDefTollFreeRow.uid).toBe('r1');
  });

  it('Delete Number', function () {
    requestTDAndAddNumber.apply(this);
    this.controller.submitLoading = true;
    let row = { entity: this.controller.gridData[0] };
    this.controller.deleteNumber(row);
    expect(this.controller.gridData.length).toBe(1);

    this.controller.submitLoading = false;
    this.controller.deleteNumber(row);
    expect(this.controller.gridData.length).toBe(0);

    this.controller.addNumber();
    this.controller.gridData[0].dataType = 3;
    row = { entity: this.controller.gridData[0] };
    this.controller.deleteNumber(row);
    expect(this.controller.gridData.length).toBe(0);

    this.controller.addNumber();
    this.controller.gridData[0].dataType = 1;
    row = { entity: this.controller.gridData[0] };
    this.controller.deleteNumber(row);
    expect(this.controller.gridData.length).toBe(0);
  });

  it('download template', function () {
    initComponent.apply(this);
    this.controller.downloadTemplate();
    this.fakeModal.ok();
    expect(this.$modal.open).toHaveBeenCalled();
  });

  it('import TD', function () {
    initComponent.apply(this);

    let importTDNumbers = [ this.number ];
    this.gemService.setStorage('currentTelephonyDomain', { importTDNumbers: importTDNumbers });
    this.controller.importTD();
    this.fakeModal.ok();
    this.$interval.flush(10);
    expect(this.controller.gridData.length).toBe(1);
  });

  it('import CSV', function () {
    initComponent.apply(this);

    let number = _.assignIn({}, this.number, { country: 'US' });
    delete number.countryId;

    this.controller.importNumberCSV([ number ]);
    this.$timeout.flush();
    this.$interval.flush(10);
    expect(this.controller.gridData.length).toBe(1);
  });

  it('onEditTD', function () {
    updateTDAndShowNumber.apply(this);

    this.controller.submitLoading = true;
    this.controller.onEditTD();

    this.controller.submitLoading = false;
    this.controller.gridData[0].dataType = 1;
    this.controller.onEditTD();
    let currentTD = this.gemService.getStorage('currentTelephonyDomain');
    currentTD.region = 'US';

    this.fakeModal.ok();
    expect(this.controller.gridData.length).toBe(0);
  });

  it('export to CSV', function () {
    initComponent.apply(this);
    this.controller.exportToCSV();

    updateTDAndShowNumber.apply(this);
    this.controller.exportToCSV();
    this.$scope.$apply();

    this.TelephonyDomainService.exportNumbersToCSV.and.returnValue(this.$q.reject({ status: 404 }));
    this.controller.exportToCSV();
    this.$scope.$apply();
    this.$timeout.flush(1500);

    expect(this.Notification.errorResponse).toHaveBeenCalled();
  });

  it('onCancel', function () {
    initComponent.apply(this);
    this.controller.onCancel();
    expect(this.PreviousState.go).toHaveBeenCalled();
  });

});
