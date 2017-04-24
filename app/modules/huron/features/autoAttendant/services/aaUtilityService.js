(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAUtilityService', AAUtilityService);

  function AAUtilityService(ASTParser, ASTWalker) {
    //methods and exposable vars
    var CONSTANTS = {};
    CONSTANTS.expressions = {};
    CONSTANTS.js = {};
    CONSTANTS.expressions.CallExpression = 'CallExpression';
    CONSTANTS.expressions.ThisExpression = 'ThisExpression';
    CONSTANTS.js.func = 'var func = function ()';
    CONSTANTS.js.conditionalArr = 'checks';
    var service = {
      splitOnCommas: splitOnCommas,
      addQuotesAroundCommadQuotedValues: addQuotesAroundCommadQuotedValues,
      countOccurences: countOccurences,
      generateFunction: generateFunction,
      pullJSPieces: pullJSPieces,
      removeEscapeChars: removeEscapeChars,
      CONSTANTS: CONSTANTS,
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
          _.each(split, function (piece) {
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
      return ifCondition && elementsToCheck && elementsToCheck.length > 0 ? generateTrueFunction(ifCondition, elementsToCheck) : service.CONSTANTS.js.func + ' { return this[\'' + ifCondition + '\'] != this[\'' + ifCondition + '\']; };';
    }

    function pullJSPieces(expression) {
      var pieces = {
        ifCondition: '',
        isConditions: '',
      };
      if (expression) {
        return parseLeftRightExpression(pieces, expression);
      }
      return pieces;
    }

    /***********/
    //private helper methods

    function parseLeftRightExpression(pieces, expression) {
      try {
        var ast = ASTParser.parse(expression, []);
        if (ast) {
          pieces.ifCondition = grabThisCheckAgainstCondition(ast);
          pieces.isConditions = grabCheckConditions(ast).join(', ');
        }
      } catch (exception) {
        return pieces;
      }
      return pieces;
    }

    function grabThisCheckAgainstCondition(abstractSyntaxTree) {
      //innerfunction details guaranteed currently with var func = { ... };
      var body = abstractSyntaxTree.body;
      if (body) {
        var declarations = body[0].declarations;
        if (declarations) {
          var init = declarations[0].init;
          if (init) {
            var innerFunctionDetails = init.body.body;
            return checkPropertyHandler(innerFunctionDetails);
          }
        }
      }
      return '';
    }

    function grabCheckConditions(abstractSyntaxTree) {
      var conditions = [];
      ASTWalker.ancestor(abstractSyntaxTree, {
        Literal: function (node, ancestors) {
          checkConditionsHandler(conditions, literalHandler(node, ancestors));
        },
      });
      return conditions;
    }

    function checkConditionsHandler(conditions, nodeLiteralValue) {
      if (nodeLiteralValue) {
        conditions.push(removeEscapeChars(addQuotesAroundCommadQuotedValues(nodeLiteralValue)));
      }
    }

    function literalHandler(node, ancestors) {
      if (ancestors.length > 2 && ancestors[ancestors.length - 2].type === service.CONSTANTS.expressions.CallExpression) {
        return node.value;
      }
    }

    function checkPropertyHandler(innerFunctionDetails) {
      var simpleLeftArgument = innerFunctionDetails[innerFunctionDetails.length - 1].argument.left;
      if (simpleLeftArgument) {
        return getCheckAgainstProperty(simpleLeftArgument.arguments);
      }
      return '';
    }

    function getCheckAgainstProperty(argumentLeft) {
      if (argumentLeft && argumentLeft.length > 0) {
        if (argumentLeft[0].object.type === service.CONSTANTS.expressions.ThisExpression) {
          return argumentLeft[0].property.value;
        }
      }
      return '';
    }

    function generateTrueFunction(condition, elements) {
      return service.CONSTANTS.js.func + ' {' + generateList(['var ' + service.CONSTANTS.js.conditionalArr + ' = []; '], elements).join('') + 'return ' + service.CONSTANTS.js.conditionalArr + '.indexOf(this[\'' + condition + '\']) !== -1 };'; //cannot check > -1 -- invalid characters for request
    }

    function generateList(arr, elements) {
      _.forEach(elements, function (element) { arr.push(service.CONSTANTS.js.conditionalArr + '.push(\'' + element + '\'); '); });
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
