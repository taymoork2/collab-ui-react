require('./_new-field.scss');

(function () {
  'use strict';

  angular.module('Context')
    .component('contextNewFieldModal', {
      controller: NewFieldCtrl,
      templateUrl: 'modules/context/fields/new-modal/hybrid-context-new-field.html',
      bindings: {
        existingFieldIds: '<',
        createCallback: '&',
        dismiss: '&',
      },
    });

  /* @ngInject */
  function NewFieldCtrl($translate, Notification, LogMetricsService, ContextFieldsService) {

    var vm = this;
    var unencrypted = $translate.instant('context.dictionary.fieldPage.unencrypted');
    var encrypted = $translate.instant('context.dictionary.fieldPage.encrypted');
    var pii = $translate.instant('context.dictionary.fieldPage.piiEncrypted');

    var defaultClassification = encrypted;

    // map datatype to value that is accepted by api
    var dataTypeApiMap = {};
    dataTypeApiMap[$translate.instant('context.dictionary.dataTypes.boolean')] = 'boolean';
    dataTypeApiMap[$translate.instant('context.dictionary.dataTypes.double')] = 'double';
    dataTypeApiMap[$translate.instant('context.dictionary.dataTypes.integer')] = 'integer';
    dataTypeApiMap[$translate.instant('context.dictionary.dataTypes.string')] = 'string';

    // map encrypted type to value that is accepted by api
    var classificationApiMap = {};
    classificationApiMap[unencrypted] = 'UNENCRYPTED';
    classificationApiMap[encrypted] = 'ENCRYPTED';
    classificationApiMap[pii] = 'PII';

    // map encryption type to help text
    var classificationHelpTextMap = {};
    classificationHelpTextMap[unencrypted] = $translate.instant('context.dictionary.fieldPage.unencryptedHelpText');
    classificationHelpTextMap[encrypted] = $translate.instant('context.dictionary.fieldPage.encryptedHelpText');
    classificationHelpTextMap[pii] = $translate.instant('context.dictionary.fieldPage.PiiEncryptedHelpText');

    function invalidCharactersValidation(viewValue) {
      var value = viewValue || '';
      var regex = new RegExp(/^[0-9a-zA-Z-_]*$/g);
      return regex.test(value);
    }

    function uniqueIdValidation(viewValue) {
      var value = viewValue || '';
      return vm.existingFieldIds.indexOf(value) === -1;
    }

    ///////////////////////////////////

    vm.dataTypeOptions = _.keys(dataTypeApiMap);
    vm.dataTypePlaceholder = $translate.instant('context.dictionary.fieldPage.dataTypePlaceholder');

    vm.classificationOptions = _.keys(classificationApiMap);
    vm.classificationHelpText = classificationHelpTextMap[defaultClassification];
    vm.classificationOnChange = function () {
      vm.classificationHelpText = classificationHelpTextMap[vm.fieldData.classification];
    };

    vm.fieldData = {
      classification: defaultClassification,
      dataType: '',
      translations: {},
    };

    vm._fixDataForApi = function () {
      var fieldCopy = _.cloneDeep(vm.fieldData);
      fieldCopy.dataType = dataTypeApiMap[fieldCopy.dataType];
      fieldCopy.classification = classificationApiMap[fieldCopy.classification];
      return fieldCopy;
    };

    vm.create = function () {
      return ContextFieldsService.createAndGetField(vm._fixDataForApi())
        .then(function (data) {
          // must call callback method to add newly created field to field list
          vm.createCallback(data);
          vm.dismiss();
          Notification.success('context.dictionary.fieldPage.fieldCreateSuccess');
          LogMetricsService.logMetrics('Successfully created new field', LogMetricsService.getEventType('contextCreateFieldSuccess'), LogMetricsService.getEventAction('buttonClick'), 201, moment(), 1);
        }).catch(function (response) {
          Notification.error('context.dictionary.fieldPage.fieldCreateFailure');
          LogMetricsService.logMetrics('Failed to create new field', LogMetricsService.getEventType('contextCreateFieldFailure'), LogMetricsService.getEventAction('buttonClick'), response.status, moment(), 1);
        });
    };

    vm.createEnabled = function () {
      return Boolean(vm.fieldData.id &&
        invalidCharactersValidation(vm.fieldData.id) &&
        uniqueIdValidation(vm.fieldData.id) &&
        vm.fieldData.translations.en_US &&
        vm.fieldData.dataType);
    };

    vm.validationMessages = {
      pattern: $translate.instant('context.dictionary.fieldPage.fieldIdInvalidCharactersError'),
      unique: $translate.instant('context.dictionary.fieldPage.fieldIdUniqueError'),
    };

    vm.validators = {
      pattern: invalidCharactersValidation,
      unique: uniqueIdValidation,
    };
  }
}());
