require('./_convertUsersModal.scss');

angular.module('Core')
  .directive('crConvertUsersModal', directive);

function directive() {
  return {
    templateUrl: 'modules/core/convertUsers/convertUsersModal.tpl.html',
  };
}
