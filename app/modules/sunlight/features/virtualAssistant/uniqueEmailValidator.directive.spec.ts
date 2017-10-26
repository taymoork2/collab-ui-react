'use strict';

describe('Directive: uniqueEmailValidator', function () {
  let $scope;
  let element;
  let emailInput;
  let sparkServiceMock;
  const emailElementString = '<form name="emailForm" novalidate><input name="emailInput" ng-model="abc" ng-maxlength="63" ng-pattern="regex" unique-email /></form>';

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
    sparkServiceMock = undefined;
  });

  beforeEach(angular.mock.module('Sunlight'));

  describe('built-in directives', function () {

    beforeEach(inject(function ($compile, $rootScope, $q, SparkService) {
      $scope = $rootScope.$new();
      $scope.regex = /^([A-Za-z0-9-._~/|?%^&{}!#$'`*=]+)$/;

      element = angular.element(emailElementString);

      sparkServiceMock = SparkService;
      spyOn(sparkServiceMock, 'getPersonByEmail').and.callFake(function () {
        const existingEmails = { items: [] };
        return $q.resolve(existingEmails);
      });

      $compile(element)($scope);
      $scope.$digest();
      emailInput = $scope.emailForm.emailInput;
    }));

    it('should fail the email validation when emailPrefix length is greater than 63 characters', function () {
      emailInput.$setViewValue('1111111111222222222233333333334444444444555555556666666666677777777777778888888888');
      $scope.$digest();
      expect(emailInput.$valid).toBe(false);
      expect(emailInput.$error.maxlength).toBe(true);
    });

    it('should succeed the email validation when emailPrefix length is valid', function () {
      emailInput.$setViewValue('shortEmail');
      $scope.$digest();
      expect(emailInput.$valid).toBe(true);
    });

    it('should fail the email validation when emailPrefix contains an invalid character', function () {
      emailInput.$setViewValue('ab@abc');
      $scope.$digest();
      expect(emailInput.$valid).toBe(false);
      expect(emailInput.$error.pattern).toBe(true);
    });

    it('should succeed the email validation when emailPrefix with only valid characters', function () {
      emailInput.$setViewValue('valid_Chars_!#$%6&*=-?');
      $scope.$digest();
      expect(emailInput.$valid).toBe(true);
    });
  });

  describe('custom directive with duplicate email', function () {

    beforeEach(inject(function ($compile, $rootScope, $q, SparkService) {
      $scope = $rootScope.$new();
      $scope.regex = /^([A-Za-z0-9-._~/|?%^&{}!#$'`*=]+)$/;

      element = angular.element(emailElementString);

      sparkServiceMock = SparkService;
      spyOn(sparkServiceMock, 'getPersonByEmail').and.callFake(function () {
        const existingEmails = { items: ['abc@sparkbot.io'] };
        return $q.resolve(existingEmails);
      });

      $compile(element)($scope);
      $scope.$digest();
      emailInput = $scope.emailForm.emailInput;
    }));

    it('should fail the email validation when email already exists', function () {
      const testDuplicateEmailPrefix = 'abc';
      emailInput.$setViewValue(testDuplicateEmailPrefix);
      $scope.$digest();
      expect(sparkServiceMock.getPersonByEmail).toHaveBeenCalledWith(`${testDuplicateEmailPrefix}@sparkbot.io`);
      expect(emailInput.$valid).toBe(false);
      expect(emailInput.$error.uniqueEmailValidator).toBe(true);
    });
  });

  describe('custom directive with unique email', function () {
    beforeEach(inject(function ($compile, $rootScope, $q, SparkService) {
      $scope = $rootScope.$new();
      $scope.regex = /^([A-Za-z0-9-._~/|?%^&{}!#$'`*=]+)$/;

      element = angular.element(emailElementString);

      sparkServiceMock = SparkService;
      spyOn(sparkServiceMock, 'getPersonByEmail').and.callFake(function () {
        const existingEmails = { items: [] };
        return $q.resolve(existingEmails);
      });

      $compile(element)($scope);
      $scope.$digest();
      emailInput = $scope.emailForm.emailInput;
    }));

    it('should succeed the email validation when email is unique', function () {
      const testUniqueEmail = 'unqiueEmail';
      emailInput.$setViewValue(testUniqueEmail);
      $scope.$digest();
      expect(sparkServiceMock.getPersonByEmail).toHaveBeenCalledWith(`${testUniqueEmail}@sparkbot.io`);
      expect(emailInput.$valid).toBe(true);
    });
  });
});
