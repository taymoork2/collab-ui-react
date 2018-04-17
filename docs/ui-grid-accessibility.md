# UI-GRID and Accessibility

Atlas has been using ui-grid to manage and display large lists of data.  However, ui-grid lacks a great deal of keyboard integration support.  Specifically, header sorting and cell navigation cannot be done via keyboard.  In order to make Atlas a more accessible app, two wrapper components have been created for the purposes of remedying the lack of keyboard support in ui-grid.

(Note: For reference, ui-grid APIs can be found at http://ui-grid.info/docs/#/api)

## CS-GRID

cs-grid is a wrapper component for ui-grid itself.  Instead of putting `<div ui-grid="gridOptions">` in the html directly, `<cs-grid grid-options="gridOptions"></cs-grid>` should be used instead.

cs-grid accepts the following variables: gridApi, gridOptions, name, spinner, state, and stateChangeFunction.  The bare minimum required to make cs-grid work, however, is gridOptions.

### gridOptions

cs-grid has a set of default parameters that are combined with any gridOptions passed in to cs-grid.  Please check the default options before creating a new grid, or updating an existing grid, to avoid duplicate code and to verify any defaults that may need to be overridden.

When converting an existing grid from ui-grid to cs-grid, please keep in mind the following:
* `gridOptions.data` should not be set with a string indicating where to find the grid data on the scope.  Instead, when the grid data is updated, it should be set to `gridOptions.data` directly.
* Any functions mean to be utilized in the grid itself should be added to `gridOptions.appScopeProvider` and not to `$scope` so that they are accessible in the grid cells via `grid.appScope`

### gridApi

gridApi is the set of APIs used by ui-grid and are accessed when the grid is first initialized via the function `gridOptions.onRegisterApi`.  If the controller for the page where the grid is located needs to manipulate the grid directly, then onRegisterApi needs to be set on the controller's gridOptions.  However, the gridApi variable needs to be passed in separately to cs-grid.  Otherwise cs-grid will over-write `gridOptions.onRegisterApi` in order to ensure that it has access to the gridApi.

Example of function for retrieving gridApi:
```javascript
(gridApi: uiGrid.IGridApi): void => {
  this.gridApi = gridApi;
}
```

### name

If a name is passed on to cs-grid, it is assigned to ui-grid as the id.

### spinner

The spinner boolean variable is passed on to ui-grid to determine whether the grid-spinner on ui-grid is set.

### state

Often the grids are used to trigger side-panel states.  When the side-panel is closed, the grid may need to clear the selected grid row.  The state variable should be a string containing the name of the $state where the grid is located, such as 'users.list' for the users grid.  Then, when the `$stateChangeSuccess` is fired by the closing of the side-panel, `gridApi.selection.clearSelectedRows()` will be called.

### stateChangeFunction

If state has already been set, the if a function has been attached to stateChangeFunction it will be called at the same time that `gridApi.selection.clearSelectedRows()` is called.  Any custom changes that need to occur when the row selection is cleared should be bundled into this function.

### Example of cs-grid

```html
<cs-grid name="userListGrid" grid-api="gridApi" grid-options="gridOptions" spinner="gridRefresh" state="users.list" state-change-function="deselectRow()"></cs-grid>
```

## CS-GRID-CELL

cs-grid-cell is a wrapper component that should be placed in the `gridOptions.columns[x].cellTemplate` and used only for basic cells that are displaying either an icon, a string value, or both.  For more complicated grid cells, it can be used as a template for including keyboard support.

cs-grid-cell includes the following variables: cellClickFunction, cellIconCss, cellValue, centerText, grid, and row.

### cellClickFunction

Anything that needs to occurs on row selection should be bundled into the cellClickFunction.

### cellIconCss

If the cell needs to display an icon, the class for the icon can be passed in here.

### cellValue

If the cell needs to display a string, then the string variable can be passed in here.

### centerText

This boolean value should be set as true if the icon and/or text in the grid cell needs to be centered.

### grid

grid should be the `uiGrid.IGridInstance` instance provided by ui-grid

### row

row should be the `uiGrid.IGridRow` instance provided by ui-grid

### Example of cs-grid-cell

```html
<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.showCustomerDetails(row.entity)" cellIconCss="icon-acessibility" cell-value="row.entity.notes.text" centerText="false"></cs-grid-cell>
```

Please note that any custom cellTemplates should include a call to `GridCellService.selectRow(grid, row)` in order to toggle row selection for the grid.

