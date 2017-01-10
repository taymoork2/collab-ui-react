(function () {
  'use strict';

  angular
    .module('Sunlight')
    .service('CareFeatureList', CareFeatureList);

  /* @ngInject */
  function CareFeatureList($filter, Authinfo, ConfigTemplateService) {

    var service = {
      getChatTemplates: getChatTemplates,
      getCallbackTemplates: getCallbackTemplates,
      getTemplate: getTemplate,
      formatChatTemplates: formatChatTemplates,
      formatCallbackTemplates: formatCallbackTemplates,
      deleteTemplate: deleteTemplate,
      filterCards: filterCards
    };

    return service;

    function getChatTemplates() {
      return ConfigTemplateService.query({
        orgId: Authinfo.getOrgId(),
        mediaType: 'chat'
      }).$promise;
    }

    function getCallbackTemplates() {
      return ConfigTemplateService.query({
        orgId: Authinfo.getOrgId(),
        mediaType: 'callback'
      }).$promise;
    }

    function deleteTemplate(templateId) {
      return ConfigTemplateService.delete({
        orgId: Authinfo.getOrgId(),
        templateId: templateId
      }).$promise;
    }

    function getTemplate(templateId) {
      return ConfigTemplateService.get({
        orgId: Authinfo.getOrgId(),
        templateId: templateId
      }).$promise;
    }

    function orderByCardName(list) {
      return _.sortBy(list, function (item) {
        //converting cardName to lower case as _.sortBy by default does a case sensitive sorting
        return item.name.toLowerCase();
      });
    }

    function filterCards(list, filterText) {
      var filteredList = $filter('filter')(list, {
        name: filterText
      });

      return orderByCardName(filteredList);
    }

    function formatChatTemplates(list) {
      var formattedList = _.map(list, function (tpl) {
        tpl.featureType = 'Ch';
        tpl.color = 'attention';

        return tpl;
      });
      return orderByCardName(formattedList);
    }

    function formatCallbackTemplates(list) {
      var formattedList = _.map(list, function (tpl) {
        tpl.featureType = 'Ca';
        tpl.color = 'alerts';

        return tpl;
      });
      return orderByCardName(formattedList);
    }

  }
})();
