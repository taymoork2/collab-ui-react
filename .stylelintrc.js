module.exports = {
  plugins: ['stylelint-scss'],
  extends: 'stylelint-config-recommended',
  rules: {
    // Activate rules from the stylelint-scss plugin
    'scss/selector-no-redundant-nesting-selector': true,
    // Override rules from stylelint-config-recommended
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'content',
        'extend',
        'include',
        'mixin',
        'while',
      ]
    }],
    'no-descending-specificity': null,
    'selector-type-no-unknown': null,
  },
};
