import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { omit, uniqueId } from 'lodash-es';

/**
 * @category containers
 * @component list-item
 * @variations collab-ui-react
 */

class ListItem extends React.Component {

  state = {
    id: this.props.id || uniqueId('cui-list-item-'),
  };

  componentWillMount() {
    if (!this.props.children) return;
    const checkAllChildren = this.getChildrenElements(['ListItemSection', 'EventOverlay']);
    const checkSectionChildren = this.getChildrenElements(['ListItemSection']);

    if (!checkAllChildren) {
      return;
    } else if (!checkAllChildren.isCorrectUsage) {
      throw new Error(
        `If ListItemSection Component is used all children must use ListItemSection Components.`
      );
    } else if (checkSectionChildren.length > 3) {
      throw new Error(
        `Only 3 ListItemSection components can be used as children. You've used ${
          checkSectionChildren.length
        }`
      );
    }
  }

  componentDidMount() {
    const anchorCount = this.checkElements('A');
    const { focus, refName, focusOnLoad } = this.props;

    if (anchorCount.count > 1) {
      throw new Error(
        'Only 1 primary child anchor tag may be used with ListItem component'
      );
    } else if (anchorCount.count === 1 && anchorCount.children > 1) {
      throw new Error('Anchor tag can not have sibling');
    }

    focusOnLoad && focus
    && this[refName]
    && this[refName].focus();
  }

  componentDidUpdate(prevProps) {
    const { focus, refName } = this.props;
    prevProps.focus !== focus
      && focus
      && this[refName]
      && this[refName].focus();
  }

  checkElements = tag => {
    const children = Object.values(ReactDOM.findDOMNode(this).childNodes);

    return this.countDOMChildren(children, tag);
  };

  countDOMChildren = (children, tag) =>
    children.reduce(
      (agg, child) => (
        child.tagName === tag
          ? { ...agg, count: (agg.count += 1) }
          : agg
      ), { count: 0, children: children.length }
    );

  getChildrenElements = nameArr => {
    const { children } = this.props;
    let elementCount = 0;
    let childrenLength = 0;

    React.Children.forEach(children, child => {
      childrenLength++;
      if (child.type && nameArr.includes(child.type.displayName)) {
        return elementCount++;
      }
    });

    return (
      elementCount && {
        isCorrectUsage: elementCount === childrenLength,
        length: elementCount
      }
    );
  };

  handleClick = e => {
    const {
      disabled,
      itemIndex,
      label,
      onClick,
      value,
    } = this.props;
    const { setSelected } = this.context;

    if(disabled) {
      e.preventDefault();
      e.stopPropagation();
    }

    e.persist();
    setSelected && setSelected(e, itemIndex, value, label);
    onClick && onClick(e);
  }

  handleKeyDown = e => {
    const { disabled, itemIndex, onKeyDown } = this.props;
    const { handleListKeyDown } = this.context;

    if(disabled) {
      e.preventDefault();
      e.stopPropagation();
    }

    e.persist();
    handleListKeyDown && handleListKeyDown(e, itemIndex);
    onKeyDown && onKeyDown(e);
  }

  render() {
    const {
      active,
      children,
      className,
      customAnchorNode,
      customRefProp,
      disabled,
      focus,
      isReadOnly,
      label,
      link,
      refName,
      role,
      separator,
      title,
      type,
      ...props
    } = this.props;
    const { id } = this.state;

    const otherProps = omit({...props}, [
      'focusOnLoad',
      'id',
      'itemIndex',
      'onClick',
      'onKeyDown',
      'value',
    ]);

    const addRefToAnchor = node => {
      return React.cloneElement(
        node,
        {
          'aria-current': focus,
          className:
            'cui-list-item' +
            `${(type && ` cui-list-item--${type}`) || ''}` +
            `${(active && ` active`) || ''}` +
            `${(disabled && ` disabled`) || ''}` +
            `${(isReadOnly && ` cui-list-item--read-only`) || ''}` +
            `${(separator && ` cui-list-item--separator`) || ''}` +
            `${(className && ` ${className}`) || ''}` +
            `${(node.props.className && ` ${node.props.className}`) || ''}`,
          role: role,
          ...customRefProp && { [customRefProp]: ref => this[this.props.refName] = ref },
          ...id && { id },
          ...!isReadOnly && {
            onClick: this.handleClick,
            onKeyDown: this.handleKeyDown,
            tabIndex: (!disabled && focus) ? 0 : -1,
          },
          ...otherProps,
          ...(title || label) && {title: title || label}
        },
        children || node.props.children || label
      );
    };

    const customProps = {
      'aria-current': focus,
      className:
        'cui-list-item' +
        `${(type && ` cui-list-item--${type}`) || ''}` +
        `${(active && ` active`) || ''}` +
        `${(disabled && ` disabled`) || ''}` +
        `${(isReadOnly && ` cui-list-item--read-only`) || ''}` +
        `${(separator && ` cui-list-item--separator`) || ''}` +
        `${(className && ` ${className}`) || ''}`,
      id: id,
      role: role,
      ref: ref => (this[refName] = ref),
      ...!isReadOnly && {
        onClick: this.handleClick,
        onKeyDown: this.handleKeyDown,
        tabIndex: (!disabled && focus) ? 0 : -1,
      },
      ...link && { href: link },
      ...otherProps,
      ...(title || label) && { title: title || label }
    };

    return customAnchorNode
      ? addRefToAnchor(customAnchorNode)
      : React.createElement(
          link ? 'a' : 'div',
          {
            ...customProps
          },
          children || label
        );
  }
}

ListItem.propTypes = {
  /** @prop Active prop to help determine styles | false */
  active: PropTypes.bool,
  /** @prop Children nodes to render inside ListItem | null  */
  children: PropTypes.node,
  /** @prop Optional css class string | '' */
  className: PropTypes.string,
  /** @prop Node in which the selection begins | null */
  customAnchorNode: PropTypes.element,
  /** @prop ListItem Custom Prop Name for child with custom Ref | null */
  customRefProp: PropTypes.string,
  /** @prop Disabled attribute for ListItem to determine styles | false */
  disabled: PropTypes.bool,
  /** @prop Specifies if ListItem should automatically get focus | false */
  focus: PropTypes.bool,
  /** @prop Specifies if ListItem should automatically get focus when page loads | false */
  focusOnLoad: PropTypes.bool,
  /** @prop Sets ListItem id | null */
  id: PropTypes.string,
  /** @prop Determines if ListItem is clickable | false */
  isReadOnly: PropTypes.bool,
  /** @prop ListItem index number | null */
  itemIndex: PropTypes.number,
  /** @prop ListItem label text | '' */
  label: PropTypes.string,
  /** @prop external link associated input | '' */
  link: PropTypes.string,
  /** @prop Callback function invoked by user tapping on ListItem | null */
  onClick: PropTypes.func,
  /** @prop Callback function invoked by user pressing on a key | null */
  onKeyDown: PropTypes.func,
  /** @prop ListItem ref name | 'navLink' */
  refName: PropTypes.string,
  /** @prop Aria role | 'listItem' */
  role: PropTypes.string,
  /** @prop Prop that controls whether to show separator or not | false */
  separator: PropTypes.bool,
  /** @prop ListItem Title | '' */
  title: PropTypes.string,
  /** @prop ListItem size | '' */
  type: PropTypes.oneOf(['', 'small', 'large', 'xlarge', 'space', 'header', 36, 52, 60]),
  /** @prop ListItem value for OnSelect value | '' */
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
    PropTypes.array
  ]),
};

ListItem.defaultProps = {
  active: false,
  children: null,
  className: '',
  customAnchorNode: null,
  customRefProp: '',
  disabled: false,
  focus: false,
  focusOnLoad: false,
  id: null,
  itemIndex: null,
  isReadOnly: false,
  label: '',
  link: '',
  onClick: null,
  onKeyDown: null,
  refName: 'navLink',
  role: 'listItem',
  separator: false,
  title: '',
  type: '',
  value: '',
};

ListItem.contextTypes = {
  setSelected: PropTypes.func,
  handleListKeyDown: PropTypes.func
};

ListItem.displayName = 'ListItem';

export default ListItem;

/**
* @name Default
*
* @category containers
* @component list-item
* @section default
*
* @js
*
import { List, ListItem } from '@collab-ui/react';

export default class ListItemDefault extends React.PureComponent {

  render() {
    return(
      <div className="medium-4 columns">
        <div>
          <List>
            <ListItem label='Default List Item 1' />
            <ListItem label='Default List Item 2' />
          </List>
        </div>
        <div className="cui--contrast">
          <List>
            <ListItem label='List Item 1 (with Contrast)' />
            <ListItem label='List Item 2 (with Contrast)' />
          </List>
        </div>
      </div>
    );
  }
}
**/

/**
* @name Type
*
* @category containers
* @component list-item
* @section type
*
* @js
*
import { List, ListItem } from '@collab-ui/react';

export default class ListItemType extends React.PureComponent {

  render() {
    return(
      <div className="medium-4 columns">
        <div>
          <List>
            <ListItem type='small' link='javascript:void(0)' label='Small List Item' />
            <ListItem link='javascript:void(0)' label='Regular List Item' />
            <ListItem type='large' link='javascript:void(0)' label='Large List Item' />
            <ListItem type='xlarge' link='javascript:void(0)' label='XLarge List Item' />
          </List>
        </div>
        <div className="cui--contrast">
          <List>
            <ListItem type='small' link='javascript:void(0)' label='Small List Item (with Contrast)' />
            <ListItem link='javascript:void(0)' label='Regular List Item (with Contrast)' />
            <ListItem type='large' link='javascript:void(0)' label='Large List Item (with Contrast)' />
            <ListItem type='xlarge' link='javascript:void(0)' label='XLarge List Item (with Contrast)' />
          </List>
        </div>
      </div>
    );
  }
}
**/

/**
* @name List Item Sections
*
* @category containers
* @component list-item
* @section list-item-sections
*
* @js
*
import { List, ListItem, ListItemSection } from '@collab-ui/react';

export default class ListItemSectionExample extends React.PureComponent {

  render() {
    return(
      <div className="medium-4 columns">
        <List>
          <ListItem link='javascript:void(0)'>
            <ListItemSection position='left'>
              Left
              </ListItemSection>
              <ListItemSection position='right'>
                Right
              </ListItemSection>
          </ListItem>
          <ListItem link='javascript:void(0)'>
            <ListItemSection position='center'>
              Center
            </ListItemSection>
          </ListItem>
          <ListItem link='javascript:void(0)'>
            <ListItemSection position='center-align'>
              Center Align
            </ListItemSection>
          </ListItem>
          <ListItem link='javascript:void(0)'>
            <ListItemSection position='left'>
              Left
            </ListItemSection>
            <ListItemSection position='center'>
              Center
            </ListItemSection>
            <ListItemSection position='right'>
              Right
            </ListItemSection>
          </ListItem>
        </List>
      </div>
    );
  }
}
**/

/**
* @name Custom Link
*
* @category containers
* @component list-item
* @section custom-anchor
*
* @js
*
import { List, ListItem } from '@collab-ui/react';
import { NavLink } from 'react-router-dom';

export default class CustomLinkExample extends React.PureComponent {

  render() {
    const anchorNode = <NavLink to='/containers/list-item' />;
    return(
      <div className="medium-4 columns">
        <List>
          <ListItem label='Custom Anchor' customRefProp='innerRef' customAnchorNode={anchorNode}/>
        </List>
      </div>
    );
  }
}
**/

/**
* @name Tab Type
*
* @category containers
* @component list-item
* @section tab-type
*
* @js
*
import { List, ListItem } from '@collab-ui/react';

export default class HorizontalListExample extends React.PureComponent {

  render() {
    return(
      <List tabType="horizontal" wrap>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
        <ListItem style={{width: '100px', flex: '0 0 auto'}}>Hello</ListItem>
      </List>
    );
  }
}
**/
