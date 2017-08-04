require('../_fieldsets-sidepanel.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('ContextFieldsetsSidepanelFieldListCtrl', ContextFieldsetsSidepanelFieldListCtrl);

  /* @ngInject */
  function ContextFieldsetsSidepanelFieldListCtrl($translate, fields, FieldUtils) {
    var vm = this;

    var classificationMap = {
      ENCRYPTED: $translate.instant('context.dictionary.fieldPage.encrypted'),
      UNENCRYPTED: $translate.instant('context.dictionary.fieldPage.unencrypted'),
      PII: $translate.instant('context.dictionary.fieldPage.piiEncrypted'),
    };

    if (fields && fields.length > 0) {
      for (var index in fields) {
        var field = fields[index];
        var classification = classificationMap[field.classification] || $translate.instant('context.dictionary.fieldPage.unencrypted');
        var type = FieldUtils.getDataType(field);
        var fieldInfo = type + ', ' + classification;
        fields[index].fieldInfo = fieldInfo.trim();
        fields[index].id = field.id.trim();
      }
    }

    vm.fields = fields;
  }
})();
