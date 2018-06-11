# UI-GRID and Accessibility

Atlas has been using `ui-grid` to manage and display large lists of data.  However, `ui-grid` lacks a great deal of keyboard integration support.  Specifically, header sorting and cell navigation cannot be done via keyboard.  In order to make Atlas a more accessible app, two wrapper components have been created for the purposes of remedying the lack of keyboard support in `ui-grid`.

(Note: For reference, `ui-grid` APIs can be found at http://ui-grid.info/docs/#/api)

## CS-GRID

`cs-grid` is a wrapper component for `ui-grid` itself.  Instead of putting `<div ui-grid="gridOptions">` in the html directly, `<cs-grid grid-options="gridOptions"></cs-grid>` should be used instead.

`cs-grid` accepts the following variables: gridApi, gridOptions, name, spinner, state, and stateChangeFunction.  The bare minimum required to make cs-grid work, however, is gridOptions.

Please Note: When creating a grid with a row selection column, do not use `ui-grid`'s built in options for this.  `ui-grid`'s built in column for row selection, much like the rest of `ui-grid`, does not include keyboard support or screen reader support.  Instead, use `GridService.getDefaultSelectColumn` to create a select column as the first column the `gridOptions.columnDefs` that is visually identical to the `ui-grid`'s built in row selection column.

### gridOptions

cs-grid has a set of default parameters that are combined with any gridOptions passed in to cs-grid.  Please check the default options before creating a new grid, or updating an existing grid, to avoid duplicate code and to verify any defaults that may need to be overridden.

When converting an existing grid from `ui-grid` to cs-grid, please keep in mind the following:
* `gridOptions.data` should not be set with a string indicating where to find the grid data on the scope.  Instead, when the grid data is updated, it should be set to `gridOptions.data` directly.
* Any functions mean to be utilized in the grid itself should be added to `gridOptions.appScopeProvider` and not to `$scope` so that they are accessible in the grid cells via `grid.appScope`

### gridApi

gridApi is the set of APIs used by `ui-grid` and are accessed when the grid is first initialized via the function `gridOptions.onRegisterApi`.  If the controller for the page where the grid is located needs to manipulate the grid directly, then onRegisterApi needs to be set on the controller's gridOptions.  However, the gridApi variable needs to be passed in separately to `cs-grid`.  Otherwise `cs-grid` will overwrite `gridOptions.onRegisterApi` in order to ensure that it has access to the gridApi.

Example of function for retrieving gridApi:
```javascript
(gridApi: uiGrid.IGridApi): void => {
  this.gridApi = gridApi;
}
```

### name

If a name is passed on to `cs-grid`, it is assigned to `ui-grid` as the id.

### spinner

The spinner boolean variable is passed on to `ui-grid` to determine whether the grid-spinner on `ui-grid` is set.

### state

Often the grids are used to trigger side-panel states.  When the side-panel is closed, the grid may need to clear the selected grid row.  The state variable should be a string containing the name of the $state where the grid is located, such as 'users.list' for the users grid.  Then, when the `$stateChangeSuccess` is fired by the closing of the side-panel, `gridApi.selection.clearSelectedRows()` will be called.

### stateChangeFunction

If state has already been set, the if a function has been attached to stateChangeFunction it will be called at the same time that `gridApi.selection.clearSelectedRows()` is called.  Any custom changes that need to occur when the row selection is cleared should be bundled into this function.

### Example of cs-grid

```html
<cs-grid name="userListGrid" grid-api="gridApi" grid-options="gridOptions" spinner="gridRefresh" state="users.list" state-change-function="deselectRow()"></cs-grid>
```

## cs-grid-cell

`cs-grid-cell` is a wrapper component that should be placed in the `gridOptions.columns[x].cellTemplate` and used only for basic cells that are displaying either an icon, a string value, or both.  For more complicated grid cells, it can be used as a template for including keyboard support.

`cs-grid-cell` includes the following variables: cellClickFunction, cellIconCss, cellValue, centerText, grid, and row.

### cell-click-function

Anything that needs to occurs on row selection should be bundled into the cellClickFunction.

### cell-icon-css

If the cell needs to display an icon, the class for the icon can be passed in here.

### cell-value

If the cell needs to display a string, then the string variable can be passed in here.

### center-text

This boolean value should be set as true if the icon and/or text in the grid cell needs to be centered.

### grid

`grid` should be the `uiGrid.IGridInstance` instance provided by `ui-grid`

### row

`row` should be the `uiGrid.IGridRow` instance provided by `ui-grid`

### Example of cs-grid-cell

```html
<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cellIconCss="icon-acessibility" cell-value="row.entity.notes.text" centerText="false"></cs-grid-cell>
```

Please note that any custom cellTemplates should include a call to `GridService.selectRow(grid, row)` in order to toggle row selection for the grid.

## cs-row-select-cell

The requirements for cs-row-select-cell are similar to, but simpler than, the `cs-grid-cell` and can be used to create either a Header cell or a row cell for use in selecting all or some rows on the grid.  This should only be used in grids that allow multi-select and, ideally, the `GridService.getDefaultSelectColumn` will be used to create the entire column for the grid.

## cs-aria-label

`cs-aria-label` provides the text announced by the screen reader.  The header should always be assigned `common.selectAll` while the row should always announce the most relevent information identifying the row or all the information in the row, depending on how much of the row other than this cell is keyboard/screen reader accessible.  When using `GridService.getDefaultSelectColumn` to create a row selection column, the only variable required will be a generic text string that can be used to fill in the aria-label for each non-Header row.

Example:
```typescript
this.GridService.getDefaultSelectColumn('{{:: row.entity.name.firstName}} {{:: row.entity.name.lastName}}');
```

### grid

`grid` should be the `uiGrid.IGridInstance` instance provided by `ui-grid`

### row

`row` should be the `uiGrid.IGridRow` instance provided by `ui-grid`.  Should only be provided for row cells, as the lack of the `row` object will cause the cell to be treated as a header cell where the checkbox is used for selecting/deselecting all rows.

NOTE: Again, do not use `cs-row-select-cell` directly for creating row selection in a `cs-grid`.  Instead, use the `GridService` to create a default row selection column.

## GridService

`GridService` is a series of helper functions for controlling grid functions.

### getDefaultSelectColumn

`getDefaultSelectColumn` should only be used when creating a multiSelect grid (in `gridOptions` set `multiSelect` to `true` as it defaults to `false` using `cs-grid`).  It requires that an `ariaLabel` variable be passed in, which is then used as the template for the row checkbox `aria-labels`.  The header cell checkbox `aria-label` will default to `common.selectAll`.  `getDefaultSelectColumn` will then return a `uiGrid.IColumnDef` instance for a row select column where the header checkbox selects all rows and the row checkboxes selects that row only.

Note: The Select Column behaves and appears visually indistinguishable from the column inserted by `ui-grid`'s `getDefaultSelectColumn`.  However, the column provided by `getDefaultSelectColumn` does not include `aria-label` or `aria-checked` (also the role is announced as `button` instead of `checkbox`), making `getDefaultSelectColumn` incompatible with screen reader accessibility.

Example:
```typescript
grid.columnDefs = [];
grid.columnDefs.push(this.GridService.getDefaultSelectColumn('{{:: row.entity.name.firstName}} {{:: row.entity.name.lastName}}'));

// the function itself looks like:
public getDefaultSelectColumn(ariaLabel: string): uiGrid.IColumnDef {
  return {
    cellTemplate: `<cs-row-select-cell cs-aria-label="${ariaLabel}" grid="grid" row="row"></cs-row-select-cell>`,
    headerCellTemplate: `<cs-row-select-cell cs-aria-label="${this.$translate.instant('common.selectAll')}" grid="grid" header="true"></cs-row-select-cell>`,
    enableSorting: false,
    name: 'selectColumn',
    width: 50,
  };
}
```

### handleResize

Because of how auto-resize is handled by `ui-grid`, the `ui-grid` auto-resize plug in does not work for Atlas.  When a resize needs to be enforced on an instance of `cs-grid`, the `handleResize` function can be called with the grid's `gridApi`, along with an optional `timeout` variable, to force the grid to resize to fit the space.

Examples:
```typescript
// Without timeout variable
this.GridService.handleResize(this.gridApi);

// With timeout variable
this.GridService.handleResize(this.gridApi, 500);
```

### selectRow

The `selectRow` function is used in grid cells for toggling row selection.  The `grid` and `row` variables provided by the `ui-grid`'s scope should be passed in, along with the optional variables `multiSelect` and `noUnselect`.  The optional variables default to `false` and `true` respectively, as the default `cs-grid` is created with the assumption that multiSelect is not allowed and that rows can only be deselected when the side panel triggered by selection closes.

Examples:
```typescript
// when using a default grid
this.GridService.selectRow(grid, row);

// when using a grid that allows multiSelect
this.GridService.selectRow(grid, row, true, false);
```

### toggleSelectAll

Toggles the `selectAll` setting on or off.

Example:
```typescript
// For toggling all rows selected on or off for the grid
this.GridService.toggleSelectAll(this.gridApi);
```
