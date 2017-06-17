'use strict';

describe('Service: AASessionVariableService', function () {
  var customVarJson = getJSONFixture('huron/json/autoAttendant/aaCustomVariables.json');
  var q;
  var $timeout;
  var CustomVariableService, AASessionVariableService;
  var $scope, $rootScope;

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_CustomVariableService_, $q, _AASessionVariableService_, _$timeout_, _$rootScope_) {
    CustomVariableService = _CustomVariableService_;
    AASessionVariableService = _AASessionVariableService_;
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    q = $q;
  }));

  describe('getSessionVariables', function () {
    var notFoundResponse = {
      status: 404,
      statusText: 'Not Found',
    };
    var sessionVarOptions, deferred;

    beforeEach(inject(function () {
      // setup the promise
      deferred = q.defer();
      spyOn(CustomVariableService, 'listCustomVariables').and.returnValue(q.resolve(deferred.promise));

      // setup aaModel for test
      sessionVarOptions = undefined;
      AASessionVariableService.getSessionVariables().then(function (value) {
        sessionVarOptions = value;
      });
    }));

    it('should set sessionVarOptions after resolve', function () {
      expect(sessionVarOptions).toBeUndefined();
      expect(CustomVariableService.listCustomVariables).toHaveBeenCalled();
      deferred.resolve(customVarJson);
      $scope.$apply();
      $timeout.flush();

      // verify data returned
      expect(sessionVarOptions).toBeDefined();
      expect(sessionVarOptions.length).toEqual(5);
    });

    it('should set empty sessionVarOptions upon 404 for session variables', function () {
      expect(sessionVarOptions).toBeUndefined();
      expect(CustomVariableService.listCustomVariables).toHaveBeenCalled();

      // reject  with 404
      deferred.reject(notFoundResponse);
      $scope.$apply();
      $timeout.flush();

      // verify empty data returned
      expect(sessionVarOptions).toBeDefined();
      expect(sessionVarOptions.length).toEqual(0);
      expect(sessionVarOptions).toEqual([]);
    });
  });
});
