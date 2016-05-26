(function () {
  'use strict';

  angular
    .module('Sunlight')
    .controller('CareFeaturesCtrl', CareFeaturesCtrl);

  /* @ngInject */
  function CareFeaturesCtrl($filter, $state, $scope, $timeout, Authinfo, CareFeatureList, Log, Notification) {
    var vm = this;
    vm.init = initCtrl;
    var pageStates = {
      newFeature: 'NewFeature',
      showFeatures: 'ShowFeatures',
      loading: 'Loading',
      error: 'Error'
    };
    var listOfAllFeatures = [];
    var featureToBeDeleted = {};
    vm.searchData = searchData;
    vm.deleteCareFeature = deleteCareFeature;
    vm.listOfFeatures = [];
    vm.pageState = pageStates.loading;
    vm.cardColor = {};
    vm.placeholder = {
      name: 'Search'
    };
    vm.init();

    function initCtrl() {
      vm.pageState = pageStates.loading;
      vm.loading = false;
      CareFeatureList.getChatTemplates().then(function (data) {
        handleTemplates(data);
      }, function (response) {
        handleTemplateFailure(response);
      });
    }

    function handleTemplates(data) {
      if (data.length == 0) {
        vm.pageState = pageStates.newFeature;
        return;
      }
      var templates = _.map(data, function (tpl) {
        tpl.featureType = 'CT';
        tpl.color = 'attention';
        return tpl;
      });

      _.forEach(templates, function (template) {
        vm.cardColor[template.featureType] = template.color;
      });

      listOfAllFeatures = listOfAllFeatures.concat(CareFeatureList.orderByCardName(templates));
      vm.pageState = pageStates.showFeatures;
      vm.listOfFeatures = listOfAllFeatures;
    }

    function handleTemplateFailure(response) {
      vm.pageState = pageStates.error;
      Log.warn('Could not fetch features for customer with Id:', Authinfo.getOrgId());
      Notification.errorResponse(response, 'careChatTpl.failedToLoad', {
        featureText: $filter('translate')('careChatTpl.chatTemplate')
      });
    }

    /* This function does an in-page search for the string typed in search box*/
    function searchData(searchStr) {
      vm.filterText = searchStr;
      vm.listOfFeatures = CareFeatureList.filterCards(listOfAllFeatures, vm.filterText);
      reInstantiateMasonry();
    }

    function reInstantiateMasonry() {
      $timeout(function () {
        $('.cs-card-layout').masonry('destroy');
        $('.cs-card-layout').masonry({
          itemSelector: '.cs-card',
          columnWidth: '.cs-card',
          isResizable: true,
          percentPosition: true
        });
      }, 0);
    }

    function deleteCareFeature(feature) {
      featureToBeDeleted = feature;
      $state.go('care.Features.DeleteFeature', {
        deleteFeatureName: feature.name,
        deleteFeatureId: feature.templateId,
        deleteFeatureType: feature.featureType
      });
    }

    //list is updated by deleting a feature
    $scope.$on('CARE_FEATURE_DELETED', function () {
      listOfAllFeatures.splice(listOfAllFeatures.indexOf(featureToBeDeleted), 1);
      vm.listOfFeatures = listOfAllFeatures;
      featureToBeDeleted = {};
      if (listOfAllFeatures.length === 0) {
        vm.pageState = pageStates.newFeature;
      }

    });
  }

})();
