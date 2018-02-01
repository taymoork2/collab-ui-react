(function () {
  'use strict';

  angular
    .module('Sunlight')
    .service('CareFeatureList', CareFeatureList);

  /* @ngInject */
  function CareFeatureList(Authinfo, ConfigTemplateService) {
    var filterConstants = {
      customerSupport: 'customerSupport',
      virtualAssistant: 'virtualAssistant',
      autoAttendant: 'AA',
      all: 'all',
    };
    var service = {
      getChatTemplates: getChatTemplates,
      getCallbackTemplates: getCallbackTemplates,
      getChatPlusCallbackTemplates: getChatPlusCallbackTemplates,
      getTemplate: getTemplate,
      formatTemplates: formatTemplates,
      deleteTemplate: deleteTemplate,
      filterCards: filterCards,
      filterConstants: filterConstants,
    };

    return service;

    function getChatTemplates() {
      return ConfigTemplateService.query({
        orgId: Authinfo.getOrgId(),
        mediaType: 'chat',
      }).$promise;
    }

    function getCallbackTemplates() {
      return ConfigTemplateService.query({
        orgId: Authinfo.getOrgId(),
        mediaType: 'callback',
      }).$promise;
    }

    function getChatPlusCallbackTemplates() {
      return ConfigTemplateService.query({
        orgId: Authinfo.getOrgId(),
        mediaType: 'chatPlusCallback',
      }).$promise;
    }

    function deleteTemplate(templateId) {
      return ConfigTemplateService.delete({
        orgId: Authinfo.getOrgId(),
        templateId: templateId,
      }).$promise;
    }

    function getTemplate(templateId) {
      return ConfigTemplateService.get({
        orgId: Authinfo.getOrgId(),
        templateId: templateId,
      }).$promise;
    }

    function orderByCardName(list) {
      return _.sortBy(list, function (item) {
        //converting cardName to lower case as _.sortBy by default does a case sensitive sorting
        return item.name.toLowerCase();
      });
    }

    function filterCards(list, filterValue, filterText) {
      var filterStringProperties = [
        'name',
        'cardName',
      ];

      var filteredList = _.filter(list, function (feature) {
        if (feature.mediaType && filterValue === filterConstants.autoAttendant) {
          return false;
        }
        if (!feature.mediaType && filterValue === filterConstants.customerSupport) {
          return false;
        }
        if (filterValue === filterConstants.customerSupport && feature.mediaType === filterConstants.virtualAssistant) {
          //if the filter selected is support virtual assistant templates should not be displayed
          return false;
        }
        if (filterValue === filterConstants.virtualAssistant && feature.mediaType !== filterConstants.virtualAssistant) {
          //if the virtual assistant filter is selected only virtual assistant templates should be displayed
          return false;
        }
        if (filterValue !== filterConstants.customerSupport && filterValue !== filterConstants.virtualAssistant
          && filterValue !== filterConstants.autoAttendant && filterValue !== filterConstants.all) {
          //if the filter value is not any of the valid values templates should not be displayed
          return false;
        }
        if (_.isEmpty(filterText)) {
          return true;
        }
        var matchedStringProperty = _.some(filterStringProperties, function (stringProperty) {
          return _.includes(_.get(feature, stringProperty, '').toLowerCase(), filterText.toLowerCase());
        });
        var matchedNumbers = _.some(feature.numbers, function (number) {
          return _.includes(number, filterText);
        });
        return matchedStringProperty || matchedNumbers;
      });
      return filteredList;
    }

    function formatTemplates(list, feature) {
      var formattedList = _.map(list, function (tpl) {
        tpl.featureType = feature.name;
        tpl.color = feature.color;
        tpl.icons = feature.icons;
        tpl.featureIcons = feature.featureIcons;
        return tpl;
      });
      return orderByCardName(formattedList);
    }
  }
})();
