export function giveBreakOpportunities() {
  return function(original: string) {
    return _.replace(_.escape(original), '.', '\u200B.');
  };
}

angular
  .module('Squared')
  .filter('giveBreakOpportunities', giveBreakOpportunities);
