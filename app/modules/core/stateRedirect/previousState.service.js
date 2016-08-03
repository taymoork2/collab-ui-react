(function () {
  'use strict';

  module.exports = angular.module('core.previousstate', [
      'ui.router',
    ]).factory('PreviousState', PreviousState)
    .name;

  /* @ngInject */
  function PreviousState($state) {
    var state, params;
    var unallowedReturnStates = [
      'login'
    ];

    var service = {
      set: set,
      get: get,
      setParams: setParams,
      getParams: getParams,
      isValid: isValid,
      go: go
    };

    return service;

    function set(_state) {
      state = _state;
    }

    function get() {
      return state;
    }

    function setParams(_params) {
      params = _params;
    }

    function getParams() {
      return params;
    }

    function isValid() {
      // if previousState is set and not one of the unallowed return states
      return _.isString(state) && _.size(state) && !_.includes(unallowedReturnStates, state);
    }

    function go() {
      if (isValid()) {
        return $state.go(state, params);
      }
    }
  }

})();
