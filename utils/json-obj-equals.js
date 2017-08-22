const path = require('path');
const _ = require('lodash');

if (process.argv.length < 5) {
  let thisScript = process.argv[1];
  thisScript = path.basename(thisScript);
  console.error(`usage: ${thisScript} <json-file-1> <json-file-2> <common-property-to-compare> [<common-property-to-compare> ...]`);
  console.error('');
  console.error(`  ${thisScript} ./package.json ./package-bak.json dependencies devDependencies`);
  process.exit(1);
}

// first two args should be paths to json files
let f1 = process.argv[2];
let f2 = process.argv[3];
let packageJsonObj1 = require(path.resolve(f1));
let packageJsonObj2 = require(path.resolve(f2));

// - get list of properties to compare from remaining CLI args
// - deep compare each property from both files
const propsToCompare = _.slice(process.argv, 4);
const allPropsEqual = _.every(propsToCompare, (propToCompare) => {
  const prop1 = _.get(packageJsonObj1, propToCompare);
  const prop2 = _.get(packageJsonObj2, propToCompare);
  return _.isEqual(prop1, prop2);
});

process.exit(allPropsEqual ? 0 : 1);
