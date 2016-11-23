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
      }
    };
    var ctrl = $componentController('uploadPrivateKey', null, bindings);

    ctrl.clearFile();
    expect(ctrl.data.googleServiceAccount).toBe(originalServiceAccount);
  });

  it(' .clearFile() should clear the file and file name', function () {

    var bindings = {
      data: {
        googleServiceAccount: '',
        file: '-----BEGIN RSA PRIVATE KEY-----  BLAH BLAH BLAH -----END RSA PRIVATE KEY-----',
        fileName: 'very_secret_private_key.txt',
      }
    };
    var ctrl = $componentController('uploadPrivateKey', null, bindings);

    ctrl.clearFile();
    expect(ctrl.data.file).toBe('');
    expect(ctrl.data.fileName).toBe('');
  });


});
