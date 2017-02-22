'use strict';

describe('Component: uploadPrivateKey', function () {

  var $componentController;

  beforeEach(angular.mock.module('Hercules'));
  beforeEach(angular.mock.module('Squared'));

  beforeEach(inject(function (_$componentController_) {
    $componentController = _$componentController_;
  }));


  it(' .clearFile() should keep the current service account', function () {

    var originalServiceAccount = 'jose@mourinho.org';
    var bindings = {
      data: {
        googleServiceAccount: originalServiceAccount,
        file: '',
        fileName: '',
      },
    };
    var ctrl = $componentController('uploadPrivateKey', null, bindings);

    ctrl.clearFile();
    expect(ctrl.data.googleServiceAccount).toBe(originalServiceAccount);
  });

  it(' .clearFile() should clear the file and file name', function () {

    var bindings = {
      data: {
        googleServiceAccount: '',
        file: 'data:application/x-pkcs12;base64,LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktL…',
        fileName: 'certificate_file.p12',
      },
    };
    var ctrl = $componentController('uploadPrivateKey', null, bindings);

    ctrl.clearFile();
    expect(ctrl.data.file).toBe('');
    expect(ctrl.data.fileName).toBe('');
  });

  it(' .warnInvalidCertificate() should show a warning when file type is incorrect', function () {

    var bindings = {
      data: {
        googleServiceAccount: '',
        file: 'data:image/jpeg;base64,/9j/4QEaRXhpZgAASUkqAAgAAAAIABIBAwA…',
        fileName: 'not_a_certificate_file.jpg',
      },
    };
    var ctrl = $componentController('uploadPrivateKey', null, bindings);

    expect(ctrl.warnInvalidCertificate()).toBe(true);
  });


});
