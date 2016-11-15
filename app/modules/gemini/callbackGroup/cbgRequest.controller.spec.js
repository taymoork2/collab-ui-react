'use strict';

describe('controller: CbgRequestCtrl', function () {
  var $q, defer, $scope, $controller, $stateParams, controller, cbgService, Notification;
  // var spData = getJSONFixture('gemini/custom.json');
  var cbgsData = getJSONFixture('gemini/callbackGroups.json');

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Gemini'));
  beforeEach(inject(dependencies));
  beforeEach(initSpecs);
  beforeEach(initController);

  function dependencies(_$q_, $rootScope, _$controller_, _$stateParams_, _cbgService_, _Notification_) {
    $q = _$q_;
    defer = $q.defer();
    cbgService = _cbgService_;
    $scope = $rootScope.$new();
    // $state = _$state_;
    $stateParams = _$stateParams_;
    $controller = _$controller_;
    Notification = _Notification_;
  }

  function initSpecs() {
    spyOn(Notification, 'error').and.returnValue($q.when());
    spyOn(cbgService, 'postRequest').and.returnValue(defer.promise);
  }

  function initController() {
    controller = $controller("CbgRequestCtrl", {
      $scope: $scope,
      cbgService: cbgService
    });
  }

  it('test resetFile', function () {
    controller.model.file = {
      file: null,
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false,
    };
    controller.model.postData = { countries: 'China' };
    controller.hideCountries = 'American';
    controller.resetFile();
    expect(controller.model.file).toBe(null);
    expect(controller.model.postData.countries).toBe(null);
    expect(controller.hideCountries).toBe(null);
  });

  it('function onFileSizeError response error message', function () {
    defer.reject({});
    $stateParams.a = '';
    controller.onFileSizeError();
    expect(Notification.error).toHaveBeenCalled();
  });

  it('function onFileTypeError response error message', function () {
    controller.onFileTypeError();
    expect(Notification.error).toHaveBeenCalled();
  });

  it('test function validateCsv', function () {
    controller.isCsvValid = true;
    controller.validateCsv();
    expect(controller.isCsvValid).toBe(false);
  });

  it('test function onSubmit', function () {
    defer.resolve(cbgsData);
    controller.loading = false;
    controller.onSubmit();
    expect(controller.loading).toBe(true);
  });

  it('test function removeCountry', function () {
    controller.model.postData.countries = [{ countryName: 'America' }, { countryName: 'Japan' }];
    controller.removeCountry('America');
    expect(controller.model.postData.countries.length).toBe(1);
  });

  it('test function removeCountry', function () {
    controller.model.file = '';
    controller.hideCountries = '';
    controller.model.postData.countries = [{ countryName: 'America' }];
    controller.removeCountry('America');
    expect(controller.model.file).toBe(null);
    expect(controller.hideCountries).toBe(null);
  });

});
