require('../_fieldsets-sidepanel.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('ContextFieldsetsSidepanelFieldListCtrl', ContextFieldsetsSidepanelFieldListCtrl);

  /* @ngInject */
  function ContextFieldsetsSidepanelFieldListCtrl($translate, fields) {

    var vm = this;

    var classificationMap = {
      ENCRYPTED: $translate.instant('context.dictionary.fieldPage.encrypted'),
      UNENCRYPTED: $translate.instant('context.dictionary.fieldPage.unencrypted'),
      PII: $translate.instant('context.dictionary.fieldPage.piiEncrypted'),
    };

    if (fields && fields.length > 0) {
      for (var index in fields) {
        var field = fields[index];
        var fieldInfo = classificationMap[field.classification] || $translate.instant('context.dictionary.fieldPage.unencrypted');
        if (field.dataType) {
          fieldInfo += ", " + _.upperFirst(field.dataType.trim());
        }
        fields[index].fieldInfo = fieldInfo.trim();
        fields[index].id = field.id.trim();
      }
    }

    vm.fields = fields;
  }
})();
