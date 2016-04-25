(function() {
  'use strict';

  angular.module('Core')
    .service('Pagination', Pagination);

  /* @ngInject */
  function Pagination(Log, UserListService, $rootScope) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var pagination = {};

    pagination.init = function (scope, perPage) {
      perPage = perPage === undefined ? 10 : perPage;

      var paginator = {
        perPage: perPage,
        page: 0,
        scope: scope
      };

      var listUsers = function (startIndex, sortBy, sortOrder, type) {

        UserListService.listUsers(startIndex, paginator.perPage, sortBy, sortOrder, function (data, status) {
          if (data.success) {
            Log.debug(data.Resources);
            paginator.scope.queryuserslist = data.Resources;
            $rootScope.$broadcast('PAGINATION_UPDATED');
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
            if (type === 'next') {
              paginator.page -= 1;
            } else {
              paginator.page += 1;
            }
            $rootScope.$broadcast('PAGINATION_UPDATED');
          }
        });
      };

      paginator.prevPage = function () {
        if (paginator.page > 0) {
          $('.pagination-current a').html('<i class=\'icon icon-spinner\'></i>');
          paginator.page -= 1;
          listUsers(paginator.page * paginator.perPage + 1, paginator.scope.sort.by, paginator.scope.sort.order, 'prev');
        }
      };

      paginator.nextPage = function () {
        $('.pagination-current a').html('<i class=\'icon icon-spinner\'></i>');
        paginator.page += 1;
        listUsers(paginator.page * paginator.perPage + 1, paginator.scope.sort.by, paginator.scope.sort.order, 'next');
      };

      return paginator;
    };

    return pagination;
  }
})();