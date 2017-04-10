(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUtilityService', AAUtilityService);

  function AAUtilityService() {
    //methods and exposable vars
    var service = {
      splitOnCommas: splitOnCommas,
      addQuotesAroundCommadQuotedValues: addQuotesAroundCommadQuotedValues,
      countOccurences: countOccurences,
      generateFunction: generateFunction,
      pullJSPieces: pullJSPieces,
      removeEscapeChars: removeEscapeChars,
      JS_CONDITIONAL_ARR: 'checks',
    };
    //private vars
    var commaSplitter = ','//match on comma
                       + '(?='//positive look ahead
                       + '(?:'//non capturing group
                       + '[^"]*'//match up to " 0 to n times
                       + '"'//match "
                       + '[^"]*'//match up to " 0 to n times
                       + '"'//match "
                       + ')*'//close non capturing group and do whole op 0...n
                       + '[^"]*'//match up to " 0 to n times
                       + '$)'//end string and close positive lookahead
                       ;
    var commaSplitterRegex = new RegExp(commaSplitter);//regex --> new RegRxp(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
    var conditionGrabber = 'this[[][\']([^\']+)';
    var conditionGrabberRegex = new RegExp(conditionGrabber);
    var conditionIsTokensGrabber = service.JS_CONDITIONAL_ARR + '[.]push[(][\']([^)]+)[)]';
    var conditionIsTokensGrabberRegex = new RegExp(conditionIsTokensGrabber, 'g');

    return service;

    /////////////////////
    //public methods

    //add quotes around string values with quotes or commas
    function addQuotesAroundCommadQuotedValues(string) {
      return (
              string
              &&
              (string.indexOf(',') > -1
              ||
              string.indexOf('"') > -1)
              //if has quote or comma,
              ?
              //add quotes around string
              '"' + string.concat('"')
              :
              //otherwise return string
              string
      );
    }

    function removeEscapeChars(string) {
      return string ? string.replace(/\\/g, '') : string;
    }

    //split string based on commas
    function splitOnCommas(string) {
      var separate = [];
      if (string) {
        var lines = string.split(/\n/); //get each user applied carriage return
        _.each(lines, function (line) { //for each natural line
          var split = line.split(commaSplitterRegex); //apply the comma delimited regex
          _.each(split, function (piece) { //
            //compact
            if (piece) {
              separate.push(cleanOnQuotes(piece));
            }
          });
        });
      }
      return separate;
    }

    //count number of occurences in string of given (char) var
    function countOccurences(string, char) {
      var count = string ? string.match(new RegExp(char, 'g')) : false;
      return count ? count.length : 0;
    }

    //insert into alter at index
    function insert(alter, insert, index) {
      return alter && insert && index ? alter.substr(0, index) + insert + alter.substr(index) : alter;
    }

    function generateFunction(ifCondition, elementsToCheck) {
      return ifCondition && elementsToCheck && elementsToCheck.length > 0 ? generateTrueFunction(ifCondition, elementsToCheck) : 'var func = function () { return this[\'' + ifCondition + '\'] != this[\'' + ifCondition + '\']; };';
    }

    function pullJSPieces(expression) {
      var pieces = [];
      if (expression) {
        pieces[0] = grabIfCondition(expression);
        pieces[1] = grabIsConditions(expression);
      }
      return pieces;
    }

    /***********/
    //private helper methods

    function grabIsConditions(expression) {
      var isConditionString = '';
      var match;
      do {
        match = conditionIsTokensGrabberRegex.exec(expression);
        isConditionString = generateComponents(isConditionString, match);
      } while (match);
      return isConditionString;
    }

    function generateComponents(string, match) {
      if (match) {
        if (string.length != 0) {
          string = string.concat(',').concat(' ');
        }
        string = string.concat(removeEscapeChars(addQuotesAroundCommadQuotedValues(match[1].substr(0, match[1].length - 1))));
      }
      return string;
    }

    function grabIfCondition(expression) {
      var condition = conditionGrabberRegex.exec(expression);
      return condition && condition.length === 2 ? condition[1] : '';
    }

    function generateTrueFunction(condition, elements) {
      return 'var func = function () {' + generateList(['var ' + service.JS_CONDITIONAL_ARR + ' = []; '], elements).join('') + 'return ' + service.JS_CONDITIONAL_ARR + '.indexOf(this[\'' + condition + '\']) !== -1 };'; //cannot check > -1 -- invalid characters for request
    }

    function generateList(arr, elements) {
      _.each(elements, function (element) { arr.push(service.JS_CONDITIONAL_ARR + '.push(\'' + element + '\'); '); });
      return arr;
    }

    function cleanOnQuotes(piece) {
      //add escape char for single quote
      if (piece) {
        var singleQuoteIndex = piece.indexOf('\'');
        piece = singleQuoteIndex > -1 ? insert(piece, '\\', singleQuoteIndex) : piece;
        //trim up to quotes
        piece = piece.trim();
        //once you hit quotes remove first but don't alter inside
        piece = piece && _.startsWith(piece, '"') ? piece.substr(1) : piece;
        //once you end in quotes remove last but don't alter inside
        piece = piece && _.endsWith(piece, '"') ? piece.slice(0, -1) : piece;
      }
      return piece;
    }
  }
})();
