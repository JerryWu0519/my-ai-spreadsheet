/* tslint:disable */
/* eslint-disable */

import * as types from './types';



export function A1SelectionStringToSelection(a1_selection: string): JsSelection;

export function A1SelectionToJsSelection(a1_selection: any): JsSelection;

export class CellRefCoord {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    coord: bigint;
    is_absolute: boolean;
}

export class CellRefRangeEnd {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    col: CellRefCoord;
    row: CellRefCoord;
}

export enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3,
}

export class EmptyValuesCache {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class GridController {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    addDataTable(sheet_id: string, pos: string, name: string, values: any, first_row_is_header: boolean, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Adds an empty sheet to the grid. Returns a [`TransactionSummary`].
     */
    addSheet(sheet_name: string | null | undefined, insert_before_sheet_name: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Apply format painter: copy formatting from source selection to target selection
     */
    applyFormatPainter(source_selection: string, target_selection: string, cursor: string | null | undefined, is_ai: boolean): void;
    applyOfflineUnsavedTransaction(transaction_id: string, unsaved_transaction: string): any;
    /**
     * Extend and/or shrink the contents of selection to range by inferring patterns.
     */
    autocomplete(sheet_id: string, initial_range: string, final_range: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Batch update conditional formats - creates, updates, or deletes multiple
     * conditional formats in a single transaction. Used by AI tools.
     */
    batchUpdateConditionalFormats(sheet_id: string, updates: string, delete_ids: string, cursor?: string | null): any;
    /**
     * Called after a external calculation is complete.
     */
    calculationComplete(result: Uint8Array): void;
    calculationGetCellsA1(transaction_id: string, a1: string): Uint8Array;
    /**
     * Returns true if a cell position intersects with a data table, but allows
     * the anchor cell (top-left) of a code cell (not an import)
     */
    cellIntersectsDataTable(sheet_id: string, pos: string): boolean;
    /**
     * Changes cell numeric decimals.
     */
    changeDecimalPlaces(selection: string, delta: number, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Returns a [`TransactionSummary`].
     */
    clearFormatting(selection: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Clears the preview conditional format and triggers a re-render.
     */
    clearPreviewConditionalFormat(sheet_id: string): void;
    /**
     * Converts a DataTableKind::CodeRun to DataTableKind::Import
     */
    codeDataTableToDataTable(sheet_id: string, pos: string, cursor: string | null | undefined, is_ai: boolean): void;
    commitOffsetsResize(sheet_id: string, transient_resize: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Commits a single resize operation. Returns a [`TransactionSummary`].
     */
    commitSingleResize(sheet_id: string, column: number | null | undefined, row: number | null | undefined, size: number, cursor: string | null | undefined, is_ai: boolean): any;
    connectionComplete(transaction_id: string, data: Uint8Array, std_out?: string | null, std_err?: string | null, extra?: string | null): void;
    /**
     * Returns the clipboard [`JsClipboard`]
     */
    copyToClipboard(selection: string): Uint8Array;
    /**
     * Returns the clipboard [`JsClipboard`]
     */
    cutToClipboard(selection: string, cursor: string | null | undefined, is_ai: boolean): Uint8Array;
    /**
     * Toggle applying the first row as head
     */
    dataTableFirstRowAsHeader(sheet_id: string, pos: string, first_row_is_header: boolean, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Update a Data Table's name
     */
    dataTableMeta(sheet_id: string, pos: string, name: string | null | undefined, alternating_colors: boolean | null | undefined, columns_js: string | null | undefined, show_name: boolean | null | undefined, show_columns: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    dataTableMutations(sheet_id: string, pos: string, select_table: boolean, columns_to_add: Uint32Array | null | undefined, columns_to_remove: Uint32Array | null | undefined, rows_to_add: Uint32Array | null | undefined, rows_to_remove: Uint32Array | null | undefined, flatten_on_delete: boolean | null | undefined, swallow_on_insert: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Deletes a region of cells.
     */
    deleteCellValues(selection: string, cursor: string | null | undefined, is_ai: boolean): any;
    deleteColumns(sheet_id: string, columns: string, cursor: string | null | undefined, is_ai: boolean): any;
    deleteRows(sheet_id: string, rows: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Deletes a sheet from the the grid. Returns a [`TransactionSummary`].
     */
    deleteSheet(sheet_id: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Makes a copy of a sheet. Returns a [`TransactionSummary`].
     */
    duplicateSheet(sheet_id: string, name_of_new_sheet: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Returns [`TransactionSummary`]
     */
    exportCsvSelection(selection: string): string;
    /**
     * Returns [`TransactionSummary`]
     */
    exportExcel(): Uint8Array;
    /**
     * Exports a [`GridController`] to a file (consumes the grid). Returns a `Vec<u8>`.
     * This is useful when exporting the grid to a file from dashboard, saves memory while exporting.
     */
    exportGridToFile(): Uint8Array;
    /**
     * Exports a [`GridController`] to a file (exports the grid using clone). Returns a `Vec<u8>`.
     * This is required when exporting the open file from app, requires a clone because the grid is still being used.
     */
    exportOpenGridToFile(): Uint8Array;
    /**
     * Exports a [`GridController`] to a JSON string for debugging.
     */
    exportOpenGridToJson(): string;
    /**
     * Flattens a Data Table
     */
    flattenDataTable(sheet_id: string, pos: string, cursor: string | null | undefined, is_ai: boolean): void;
    getAICellFormats(sheet_id: string, a1: string, page: number): any;
    getAICells(a1: string, sheet_id: string, page: number): any;
    /**
     * Returns all code cells with errors or spills in all sheets. Returns
     * undefined if there are no errors or spills in the file.
     */
    getAICodeErrors(max_errors: number): any;
    /**
     * Returns the context for ai in selection. If max_rows is not provided, then it does not provide sample rows
     * returns an array of JsSelectionContext, one for each selection
     */
    getAISelectionContexts(selections: string[], max_rows?: number | null): any;
    getAITransactions(): any;
    /**
     * Returns a summary of the formatting in a region as a
     * [`CellFormatSummary`]. This includes any conditional formatting applied to the cell.
     */
    getCellFormatSummary(sheet_id: string, pos: string): any;
    /**
     * gets the value and type for a cell
     * returns a stringified JsCellValue
     */
    getCellValue(sheet_id: string, pos: string): any;
    /**
     * Returns the code cell if the pos is part of a code run.
     *
     * * CodeCell.evaluation_result is a stringified version of the output (used for AI models)
     */
    getCodeCell(sheet_id: string, pos: string): any;
    /**
     * Returns the conditional formats for a sheet
     */
    getConditionalFormats(sheet_id: string): any;
    /**
     * gets the display value for a cell
     */
    getDisplayValue(sheet_id: string, pos: string): string;
    /**
     * gets an editable string for a cell
     *
     * returns a JsEditCell with text and optional code_cell info
     */
    getEditCell(sheet_id: string, pos: string): any;
    getFormatSelection(selection: string): any;
    /**
     * Returns cell data in a format useful for rendering. This includes only
     * the data necessary to render raw text values.
     *
     * Returns a string containing a JSON array of [`JsRenderCell`].
     */
    getRenderCells(sheet_id: string, rect: string): Uint8Array;
    /**
     * Returns fill data for the specified hashes.
     *
     * hashes_json is a JSON array of {x, y} hash coordinates.
     * Returns a JSON array of [`JsHashRenderFills`].
     */
    getRenderFillsForHashes(sheet_id: string, hashes_json: string): Uint8Array;
    getSheetColor(sheet_id: string): string;
    /**
     * Gets a list of ordered sheet ids
     */
    getSheetIds(): any;
    /**
     * Returns meta fills (row/column/sheet fills) for a sheet.
     *
     * Returns a JSON array of [`JsSheetFill`].
     */
    getSheetMetaFills(sheet_id: string): Uint8Array;
    getSheetName(sheet_id: string): string;
    /**
     * Returns the order string for a sheet.
     */
    getSheetOrder(sheet_id: string): string;
    /**
     * Gets a Validation from a Position
     */
    getValidationFromPos(sheet_id: string, pos: string): any;
    /**
     * Returns a list of values for a List validation
     */
    getValidationList(sheet_id: string, x: bigint, y: bigint): any;
    /**
     * Returns a stringified version of Vec<Validation>
     */
    getValidations(sheet_id: string): any;
    /**
     * Exports a [`string`]
     */
    getVersion(): string;
    /**
     * Converts a selection on the grid to a Data Table
     */
    gridToDataTable(sheet_rect: string, table_name: string | null | undefined, first_row_is_header: boolean, cursor: string | null | undefined, is_ai: boolean): any;
    hasCellData(sheet_id: string, selection: string): any;
    /**
     * Returns whether there is a transaction to redo.
     */
    hasRedo(): boolean;
    /**
     * Returns whether there is a transaction to undo.
     */
    hasUndo(): boolean;
    static importCsv(file: Uint8Array, file_name: string, delimiter?: number | null, header_is_first_row?: boolean | null, is_overwrite_table?: boolean | null): GridController;
    importCsvIntoExistingFile(file: Uint8Array, file_name: string, sheet_id: string, insert_at: string, cursor: string | null | undefined, delimiter: number | null | undefined, header_is_first_row: boolean | null | undefined, is_ai: boolean, is_overwrite_table: boolean): any;
    static importExcel(file: Uint8Array, file_name: string): GridController;
    importExcelIntoExistingFile(file: Uint8Array, file_name: string, cursor: string | null | undefined, is_ai: boolean): any;
    static importParquet(file: Uint8Array, file_name: string): GridController;
    importParquetIntoExistingFile(file: Uint8Array, file_name: string, sheet_id: string, insert_at: string, cursor: string | null | undefined, is_ai: boolean, is_overwrite_table: boolean): any;
    insertColumns(sheet_id: string, column: bigint, count: number, after: boolean, cursor: string | null | undefined, is_ai: boolean): any;
    insertRows(sheet_id: string, row: bigint, count: number, after: boolean, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Merges cells for the selection within a rectangle.
     */
    mergeCells(selection: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Move multiple cell regions in a single transaction
     * moves_json is a JSON array of objects with source and dest properties
     */
    moveCellsBatch(moves_json: string, cursor: string | null | undefined, is_ai: boolean): void;
    moveCodeCellHorizontally(sheet_id: string, x: bigint, y: bigint, sheet_end: boolean, reverse: boolean, cursor: string | null | undefined, is_ai: boolean): any;
    moveCodeCellVertically(sheet_id: string, x: bigint, y: bigint, sheet_end: boolean, reverse: boolean, cursor: string | null | undefined, is_ai: boolean): any;
    moveColsRows(source: string, dest: string, columns: boolean, rows: boolean, cursor: string | null | undefined, is_ai: boolean): void;
    moveColumns(sheet_id: string, col_start: number, col_end: number, to: number, cursor: string | null | undefined, is_ai: boolean): any;
    moveRows(sheet_id: string, row_start: number, row_end: number, to: number, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Moves a sheet to before another sheet, or to the end of the list.
     * Returns a [`TransactionSummary`].
     */
    moveSheet(sheet_id: string, to_before: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    multiplayerTransaction(transaction_id: string, sequence_num: number, operations: Uint8Array): any;
    neighborText(sheet_id: string, x: bigint, y: bigint): any;
    /**
     * Imports a [`GridController`] from a JSON string.
     */
    static newFromFile(file: Uint8Array, last_sequence_num: number, initialize: boolean): GridController;
    pasteFromClipboard(selection: string, js_clipboard: Uint8Array, special: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets a preview conditional format for live preview while editing.
     * This is transient and not persisted. Triggers a re-render of affected cells.
     */
    previewConditionalFormat(conditional_format: string): any;
    receiveMultiplayerTransactionAck(transaction_id: string, sequence_num: number): any;
    receiveMultiplayerTransactions(transactions: any): any;
    receiveRowHeights(transaction_id: string, sheet_id: string, row_heights: string): any;
    /**
     * Handle server-provided sequence_num.
     *
     * Returns a [`TransactionSummary`] (sometimes with a request for more transactions)
     */
    receiveSequenceNum(sequence_num: number): any;
    /**
     * Redoes count transactions.
     */
    redo(count: number, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Removes a conditional format
     */
    removeConditionalFormat(sheet_id: string, conditional_format_id: string, cursor?: string | null): void;
    /**
     * Sets cells numeric_format to normal
     */
    removeNumericFormat(selection: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Removes a validation
     */
    removeValidation(sheet_id: string, validation_id: string, cursor: string | null | undefined, is_ai: boolean): void;
    removeValidationSelection(sheet_id: string, selection: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Removes all validations in a sheet
     */
    removeValidations(sheet_id: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Reruns all code cells in grid.
     */
    rerunAllCodeCells(cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Reruns one code cell
     */
    rerunCodeCell(sheet_id: string, selection: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Reruns all code cells in a sheet.
     */
    rerunSheetCodeCells(sheet_id: string, cursor: string | null | undefined, is_ai: boolean): any;
    resizeAllColumns(sheet_id: string, size: number, cursor: string | null | undefined, is_ai: boolean): void;
    resizeAllRows(sheet_id: string, size: number, cursor: string | null | undefined, is_ai: boolean): void;
    resizeColumns(sheet_id: string, columns: string, cursor: string | null | undefined, is_ai: boolean): any;
    resizeRows(sheet_id: string, rows: string, cursor: string | null | undefined, is_ai: boolean, client_resized: boolean): any;
    search(query: string, options: any): any;
    /**
     * Returns true if a selection intersects with any data table, but allows
     * the anchor cell (top-left) of a code cell (not an import)
     */
    selectionIntersectsDataTable(sheet_id: string, selection: string): any;
    /**
     * Sets cell align formatting given as an optional [`CellAlign`].
     */
    setAlign(selection: string, align: any, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell bold formatting given as an optional [`bool`].
     */
    setBold(selection: string, bold: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets border style for the selection within a rectangle.
     */
    setBorders(selection: string, border_selection: string, style: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Sets the code on a cell
     */
    setCellCode(sheet_id: string, pos: string, language: any, code_string: string, code_cell_name: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): string | undefined;
    /**
     * changes the decimal places
     */
    setCellNumericDecimals(selection: string, delta: number, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets a cell to a RichText value with the given spans (as JSON).
     */
    setCellRichText(sheet_id: string, x: number, y: number, spans_json: string, cursor?: string | null): void;
    /**
     * Sets a cell value given as a [`CellValue`].
     *
     * Returns a [`TransactionSummary`].
     */
    setCellValue(sheet_id: string, x: number, y: number, value: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets a 2d array of cell values with x and y being the top left corner of the 2d array.
     *
     * Returns a [`TransactionSummary`].
     */
    setCellValues(sheet_id: string, x: number, y: number, values: any, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell render size (used for Html-style cells).
     */
    setChartSize(sheet_pos: string, columns: number, rows: number, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Sets cells numeric_commas
     */
    setCommas(selection: string, commas: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cells numeric_format to currency
     */
    setCurrency(selection: string, symbol: string, cursor: string | null | undefined, is_ai: boolean): void;
    setDateTimeFormat(selection: string, date_time: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cells numeric_format to scientific notation
     */
    setExponential(selection: string, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell fill color given as an optional [`String`].
     */
    setFillColor(selection: string, fill_color: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell font size given as an [`i16`].
     */
    setFontSize(selection: string, font_size: number, cursor: string | null | undefined, is_ai: boolean): void;
    setFormats(sheet_id: string, selection: string, formats: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Sets multiple format entries in a single transaction.
     * Each entry in the array contains a selection string and format properties.
     */
    setFormatsA1(formats_json: string, cursor: string | null | undefined, is_ai: boolean): any;
    setFormula(sheet_id: string, selection: string, code_string: string, cursor?: string | null): any;
    /**
     * Sets multiple formulas in a single transaction (batched)
     */
    setFormulas(sheet_id: string, formulas: any, cursor?: string | null): any;
    /**
     * Sets cell italic formatting given as an optional [`bool`].
     */
    setItalic(selection: string, italic: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Used to set the sequence_num for multiplayer. This should only be called when receiving the sequence_num
     * directly from the file. Use receiveSequenceNum for all other cases.
     */
    setMultiplayerSequenceNum(sequence_num: number): void;
    /**
     * Sets cells numeric_format to percentage
     */
    setPercentage(selection: string, cursor: string | null | undefined, is_ai: boolean): void;
    setSheetColor(sheet_id: string, color: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): any;
    setSheetName(sheet_id: string, name: string, cursor: string | null | undefined, is_ai: boolean): any;
    setSheetsColor(sheet_names_to_color: any, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Sets cell bold formatting given as an optional [`bool`].
     */
    setStrikeThrough(selection: string, strike_through: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell text color given as an optional [`String`].
     */
    setTextColor(selection: string, text_color: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell bold formatting given as an optional [`bool`].
     */
    setUnderline(selection: string, underline: boolean | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell vertical align formatting given as an optional [`CellVerticalAlign`].
     */
    setVerticalAlign(selection: string, vertical_align: any, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Sets cell wrap formatting given as an optional [`CellWrap`].
     */
    setWrap(selection: string, wrap: any, cursor: string | null | undefined, is_ai: boolean): void;
    /**
     * Returns the ID of the sheet at the given index.
     */
    sheetIdToIndex(id: string): number | undefined;
    /**
     * Sort a Data Table
     */
    sortDataTable(sheet_id: string, pos: string, sort_js: string | null | undefined, cursor: string | null | undefined, is_ai: boolean): void;
    summarizeSelection(selection: string, max_decimals: bigint): any;
    /**
     * Undoes count transactions.
     */
    undo(count: number, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Unmerges cells for the selection within a rectangle.
     */
    unmergeCells(selection: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Creates or updates a conditional format
     */
    updateConditionalFormat(conditional_format: string, cursor?: string | null): any;
    /**
     * Creates or updates a validation and applies it to a selection
     */
    updateValidation(validation: string, cursor: string | null | undefined, is_ai: boolean): any;
    /**
     * Validates user input against any validation rules.
     */
    validateInput(sheet_id: string, pos: string, value: string): any;
}

export class JsA1Context {
    free(): void;
    [Symbol.dispose](): void;
    constructor(context: Uint8Array);
    static newEmpty(): JsA1Context;
}

export class JsCoordinate {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    x: number;
    y: number;
}

export class JsMergeCells {
    free(): void;
    [Symbol.dispose](): void;
    static createFromBytes(merge_cells: Uint8Array): JsMergeCells;
    getMergeCellRect(x: number, y: number): Rect | undefined;
    getMergeCells(x0: number, y0: number, x1: number, y1: number): Rect[];
    isMergeCells(x: number, y: number): boolean;
    constructor();
}

export class JsSelection {
    free(): void;
    [Symbol.dispose](): void;
    canInsertColumnRow(): boolean;
    checkForTableRef(sheet_id: string, context: JsA1Context): void;
    clone(): JsSelection;
    contains(x: number, y: number, context: JsA1Context): boolean;
    containsMergedCells(context: JsA1Context, merge_cells: JsMergeCells): boolean;
    cursorIsOnHtmlImage(context: JsA1Context): boolean;
    excludeCells(x0: number, y0: number, x1: number, y1: number, context: JsA1Context): void;
    getBottomRightCell(): JsCoordinate;
    getColumnsWithSelectedCells(context: JsA1Context): Uint32Array;
    getContiguousColumns(): Uint32Array | undefined;
    getContiguousRows(): Uint32Array | undefined;
    /**
     * Returns the cursor position (as a JsCoordinate)
     */
    getCursor(): JsCoordinate;
    getFiniteRefRangeBounds(context: JsA1Context, merge_cells: JsMergeCells): any;
    /**
     * Returns the first cell position of the first range in the selection.
     * This is different from the cursor position, which may be elsewhere.
     * For table column selections, this returns the first data cell of that column.
     */
    getFirstRangeStart(context: JsA1Context): JsCoordinate | undefined;
    getInfiniteRefRangeBounds(): any;
    getLargestRectangle(context: JsA1Context): Rect;
    getLargestUnboundedRectangle(context: JsA1Context): Rect;
    getRanges(): string;
    getRowsWithSelectedCells(context: JsA1Context): Uint32Array;
    getSelectedColumnRanges(from: number, to: number, context: JsA1Context): Uint32Array;
    getSelectedColumns(): Uint32Array;
    getSelectedRowRanges(from: number, to: number, context: JsA1Context): Uint32Array;
    getSelectedRows(): Uint32Array;
    getSelectedTableColumnsCount(context: JsA1Context): number;
    getSelectedTableNames(sheet_id: string, data_table_cache: SheetDataTablesCache, context: JsA1Context): any;
    getSheetId(): string;
    getSheetName(context: JsA1Context): string;
    getSheetRefRangeBounds(): any;
    getSingleFullTableSelectionName(): string | undefined;
    getSingleRectangle(context: JsA1Context): Rect | undefined;
    getSingleRectangleOrCursor(context: JsA1Context): Rect | undefined;
    getTableColumnSelection(table_name: string, context: JsA1Context): any;
    getTableNameFromPos(sheet_id: string, col: number, row: number, context: JsA1Context): string | undefined;
    getTablesWithColumnSelection(): string[];
    hasOneColumnRowSelection(one_cell: boolean, context: JsA1Context): boolean;
    is1dRange(context: JsA1Context): boolean;
    isAllSelected(): boolean;
    isColumnRow(): boolean;
    isEntireColumnSelected(column: number): boolean;
    isEntireRowSelected(row: number): boolean;
    isMultiCursor(context: JsA1Context): boolean;
    isSelectedColumnsFinite(context: JsA1Context): boolean;
    isSelectedRowsFinite(context: JsA1Context): boolean;
    isSingleSelection(context: JsA1Context): boolean;
    isTableColumnSelected(table_name: string, column: number, context: JsA1Context): boolean;
    keyboardJumpSelectTo(col: number, row: number, direction: Direction, context: JsA1Context, merge_cells: JsMergeCells): void;
    keyboardSelectTo(x: number, y: number, context: JsA1Context, merge_cells: JsMergeCells): void;
    /**
     * Loads the selection from a JSON string.
     */
    load(selection: string): void;
    moveTo(x: number, y: number, append: boolean, merge_cells: JsMergeCells): void;
    constructor(sheet_id: string);
    outOfRange(): boolean;
    overlapsA1Selection(selection: string, context: JsA1Context): boolean;
    /**
     * Saves the selection to a JSON string.
     */
    save(): string;
    /**
     * Selects the entire sheet.
     */
    selectAll(append: boolean): void;
    selectColumn(column: number, ctrl_key: boolean, shift_key: boolean, is_right_click: boolean, top: number, context: JsA1Context): void;
    selectRect(left: number, top: number, right: number, bottom: number, append: boolean): void;
    selectRow(row: number, ctrl_key: boolean, shift_key: boolean, is_right_click: boolean, left: number, context: JsA1Context): void;
    selectSheet(sheet_id: string): void;
    selectTable(table_name: string, col: string | null | undefined, screen_col_left: number, shift_key: boolean, ctrl_key: boolean, context: JsA1Context): void;
    selectTo(x: number, y: number, append: boolean, context: JsA1Context, merge_cells: JsMergeCells): void;
    /**
     * Get A1Selection as a JsValue.
     */
    selection(): any;
    selectionEnd(context: JsA1Context): JsCoordinate;
    selectionToSheetRect(sheet_id: string, selection: string, context: JsA1Context): string;
    setColumnsSelected(context: JsA1Context): void;
    setRowsSelected(context: JsA1Context): void;
    toA1String(default_sheet_id: string | null | undefined, context: JsA1Context): string;
    toCursorA1(): string;
    updateColumnName(table_name: string, old_name: string, new_name: string): void;
    updateTableName(old_name: string, new_name: string): void;
}

/**
 * Data structure that tracks column widths or row heights in pixel units,
 * optimized for converting between column/row indices and pixel units.
 */
export class Offsets {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class Placement {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    index: number;
    position: number;
    size: number;
}

/**
 * Cell position {x, y}.
 */
export class Pos {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Column
     */
    x: bigint;
    /**
     * Row
     */
    y: bigint;
}

/**
 * Rectangular region of cells.
 */
export class Rect {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Lower-right corner.
     */
    max: Pos;
    /**
     * Upper-left corner.
     */
    min: Pos;
}

export class RefRangeBounds {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    end: CellRefRangeEnd;
    start: CellRefRangeEnd;
}

export class ScreenRect {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    h: number;
    w: number;
    x: number;
    y: number;
}

export class SheetContentCache {
    free(): void;
    [Symbol.dispose](): void;
    hasContent(col: number, row: number): boolean;
    hasContentInRect(x0: number, y0: number, x1: number, y1: number): boolean;
    constructor(bytes: Uint8Array);
    /**
     * Creates an empty version of the cache.
     */
    static new_empty(): SheetContentCache;
}

export class SheetDataTablesCache {
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Returns what table is the table Pos at the given position.
     */
    getTableInPos(x: number, y: number): Pos | undefined;
    /**
     * Returns all tables in the given rectangle.
     */
    getTablesInRect(x0: number, y0: number, x1: number, y1: number): Pos[];
    hasCodeCellInSelection(js_selection: JsSelection, a1_context: JsA1Context): boolean;
    /**
     * Returns whether the rect has any type of table
     */
    hasTableInRect(x0: number, y0: number, x1: number, y1: number): boolean;
    constructor(bytes: Uint8Array);
    static new_empty(): SheetDataTablesCache;
}

export class SheetId {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

export class SheetOffsets {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    /**
     * Cancels a resize operation.
     */
    cancelResize(): void;
    /**
     * Returns a rectangle with the screen coordinates for a cell
     */
    getCellOffsets(column: number, row: number): ScreenRect;
    getColumnFromScreen(x: number): number;
    /**
     * gets the screen coordinate and size for a row. Returns a [`Placement`]
     */
    getColumnPlacement(column: number): Placement;
    /**
     * gets the column and row based on the pixels' coordinates. Returns a (column, row) index
     */
    getColumnRowFromScreen(x: number, y: number): string;
    /**
     * gets the column width. Returns a f32
     */
    getColumnWidth(x: number): number;
    getRectCellOffsets(column: number, row: number, width: number, height: number): string;
    /**
     * Returns and removes the transient resize for the current offset.
     * Use this on the local SheetOffsets to get the resize to apply to the Grid's SheetOffsets.
     *
     * Returns a [`TransientResize` || undefined]
     */
    getResizeToApply(): string | undefined;
    getRowFromScreen(y: number): number;
    /**
     * gets the row height from a row index
     */
    getRowHeight(y: number): number;
    /**
     * gets the screen coordinate and size for a pixel y-coordinate. Returns a [`Placement`]
     */
    getRowPlacement(row: number): Placement;
    /**
     * gets the screen coordinate and size for a pixel x-coordinate. Returns a [`Placement`]
     */
    getXPlacement(x: number): Placement;
    /**
     * gets the screen coordinate and size for a pixel y-coordinate. Returns a [`Placement`]
     */
    getYPlacement(y: number): Placement;
    /**
     * Resizes a column transiently; the operation must be committed using
     * `commitResize()` or canceled using `cancelResize()`. If `size` is `null`
     * then the column width is reset.
     */
    resizeColumnTransiently(column: number, size?: number | null): void;
    /**
     * Resizes a row transiently; the operation must be committed using
     * `commitResize()` or canceled using `cancelResize()`. If `size` is `null`
     * then the row height is reset.
     */
    resizeRowTransiently(row: number, size?: number | null): void;
    /**
     * Sets the column width. Returns the old width.
     */
    setColumnWidth(x: number, width: number): number;
    /**
     * Resets the row height. Returns the old height.
     */
    setRowHeight(y: number, height: number): number;
}

export class SheetOffsetsWasm {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    static empty(): SheetOffsets;
    static load(data: string): SheetOffsets;
}

export class ViewportBuffer {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
}

/**
 * Applies a date format to a date from CellValue.to_edit()
 * Note: this will likely change, but for now we hardcode the formats
 *    CellValue::Date(d) => d.format("%m/%d/%Y").to_string(),
 *    CellValue::Time(t) => t.format("%-I:%M %p").to_string(),
 *    CellValue::DateTime(t) => t.format("%m/%d/%Y %-I:%M %p").to_string(),
 */
export function applyFormatToDateTime(date: string, format: string): string | undefined;

export function cellRefRangeToRefRangeBounds(cell_ref_range: string, show_table_headers_for_python: boolean, context: JsA1Context): any;

export function checkFormula(formula_string: string, context: JsA1Context, sheet_id: string, x: number, y: number): boolean;

export function columnNameToIndex(column: string): bigint | undefined;

/**
 * Converts a ConditionalFormatRule to a formula string.
 * Takes a JSON-serialized ConditionalFormatRule and an anchor cell reference (e.g., "A1", "B2").
 * Returns the formula string (e.g., "ISBLANK(B2)", "B2>5").
 */
export function conditionalFormatRuleToFormula(rule_json: string, anchor: string): string;

/**
 * Converts a table reference to an A1 range.
 */
export function convertTableToRange(table_name: string, current_sheet_id: string, context: JsA1Context): string;

/**
 * Converts a table reference to a position.
 */
export function convertTableToSheetPos(table_name: string, context: JsA1Context): any;

/**
 * Converts a date-time string to an i64 for use in date_time validations.
 * Expects the date-time to be in the format of %Y-%m-%d %H:%M:%S.
 */
export function dateTimeToNumber(date: string): bigint;

/**
 * Returns a formatted version of the date string. The date is expected to
 * be in the format of %Y-%m-%d.
 */
export function formatDate(date: string, format?: string | null): string;

/**
 * Returns a formatted version of the date string. The date is expected to
 * be in the format of %Y-%m-%d %H:%M:%S.
 */
export function formatDateTime(date: string, format?: string | null): string;

/**
 * Returns a formatted version of the time string. The date is expected to be
 * in the format DEFAULT_DATE_TIME_FORMAT.
 */
export function formatTime(date: string, format?: string | null): string;

export function getTableInfo(context: JsA1Context): any;

export function hello(): void;

/**
 * Returns the SheetPos after a jump (ctrl/cmd + arrow key)
 */
export function jumpCursor(sheet_id: string, col: number, row: number, direction: Direction, content_cache: SheetContentCache, table_cache: SheetDataTablesCache, context: JsA1Context, merge_cells: JsMergeCells): Pos;

/**
 * Returns the SheetPos after a move (arrow key)
 */
export function moveCursor(sheet_id: string, col: number, row: number, direction: Direction, table_cache: SheetDataTablesCache, context: JsA1Context, merge_cells: JsMergeCells): Pos;

export function newAllSelection(sheet_id: string): string;

export function newRectSelection(sheet_id: string, x0: bigint, y0: bigint, x1: bigint, y1: bigint): string;

export function newSingleSelection(sheet_id: string, x: number, y: number): JsSelection;

/**
 * Converts a number to a date string to the default date format.
 */
export function numberToDate(number: bigint): string | undefined;

/**
 * Converts a number to a time string to the default time format.
 */
export function numberToTime(number: number): string | undefined;

export function parseFormula(formula_string: string, context: JsA1Context, sheet_id: string, x: number, y: number): any;

/**
 * Returns a date string in the format of %Y-%m-%d %H:%M:%S. Returns an empty
 * string if unable to parse the date or time string.
 */
export function parseTime(date: string, time: string): string;

export function provideCompletionItems(_text_model: any, _position: any, _context: any, _token: any): any;

export function provideHover(text_model: any, position: any, _token: any): any;

export function rectToA1(rect: any): string;

export function scheduledTaskDecode(binary_ops: Uint8Array): JsSelection | undefined;

/**
 * Computes the code for a selection. If sheet_id and selection are not
 * provided, then all code cells in the file are computed.
 */
export function scheduledTaskEncode(selection?: JsSelection | null): any;

export function selectionToSheetRect(sheet_id: string, selection: string, context: JsA1Context): any;

export function selectionToSheetRectString(sheet_id: string, selection: string, context: JsA1Context): string;

export function stringToSelection(a1: string, default_sheet_id: string, context: JsA1Context): JsSelection;

/**
 * Converts a time to an i32 for use in time validations. Expects the time to
 * be in the format of %H:%M:%S.
 */
export function timeToNumber(time: string): number;

export function toggleReferenceTypes(reference: string): string;

/**
 * Attempts to convert a user's input to an i64 for use in date_time validation.
 */
export function userDateToNumber(date: string): bigint | undefined;

/**
 * Attempts to convert a user's input to an i32 for use in time validation.
 */
export function userTimeToNumber(time: string): number | undefined;

export function validateColumnName(table_name: string, index: number, column_name: string, context: JsA1Context): boolean;

export function validateSheetName(name: string, sheet_id: string, context: JsA1Context): boolean;

export function validateTableName(name: string, sheet_id: string, x: number, y: number, context: JsA1Context): boolean;

export function xyToA1(x: number, y: number): string;

export function xyxyToA1(x0: number, y0: number, x1: number, y1: number): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly gridcontroller_importCsv: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly gridcontroller_importCsvIntoExistingFile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => any;
    readonly gridcontroller_importExcel: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly gridcontroller_importExcelIntoExistingFile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_importParquet: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly gridcontroller_importParquetIntoExistingFile: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => any;
    readonly gridcontroller_neighborText: (a: number, b: number, c: number, d: bigint, e: bigint) => any;
    readonly gridcontroller_search: (a: number, b: number, c: number, d: any) => any;
    readonly __wbg_viewportbuffer_free: (a: number, b: number) => void;
    readonly jsselection_checkForTableRef: (a: number, b: number, c: number, d: number) => void;
    readonly jsselection_keyboardJumpSelectTo: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly jsselection_keyboardSelectTo: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly jsselection_moveTo: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly jsselection_selectAll: (a: number, b: number) => void;
    readonly jsselection_selectColumn: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly jsselection_selectRect: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly jsselection_selectRow: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly jsselection_selectSheet: (a: number, b: number, c: number) => [number, number];
    readonly jsselection_selectTable: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => void;
    readonly jsselection_selectTo: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly jsselection_setColumnsSelected: (a: number, b: number) => void;
    readonly jsselection_setRowsSelected: (a: number, b: number) => void;
    readonly validateColumnName: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly validateSheetName: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly validateTableName: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly __wbg_get_rect_max: (a: number) => number;
    readonly __wbg_get_rect_min: (a: number) => number;
    readonly __wbg_jsmergecells_free: (a: number, b: number) => void;
    readonly __wbg_rect_free: (a: number, b: number) => void;
    readonly __wbg_set_rect_max: (a: number, b: number) => void;
    readonly __wbg_set_rect_min: (a: number, b: number) => void;
    readonly __wbg_sheetoffsets_free: (a: number, b: number) => void;
    readonly gridcontroller_exportGridToFile: (a: number) => [number, number, number, number];
    readonly gridcontroller_exportOpenGridToFile: (a: number) => [number, number, number, number];
    readonly gridcontroller_exportOpenGridToJson: (a: number) => [number, number, number, number];
    readonly gridcontroller_getVersion: (a: number) => [number, number];
    readonly gridcontroller_hasRedo: (a: number) => number;
    readonly gridcontroller_hasUndo: (a: number) => number;
    readonly gridcontroller_newFromFile: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly gridcontroller_redo: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly gridcontroller_undo: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly jsmergecells_createFromBytes: (a: number, b: number) => number;
    readonly jsmergecells_getMergeCellRect: (a: number, b: number, c: number) => number;
    readonly jsmergecells_getMergeCells: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly jsmergecells_isMergeCells: (a: number, b: number, c: number) => number;
    readonly jsmergecells_new: () => number;
    readonly gridcontroller_autocomplete: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
    readonly gridcontroller_commitOffsetsResize: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_commitSingleResize: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number];
    readonly gridcontroller_receiveRowHeights: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly gridcontroller_resizeAllColumns: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_resizeAllRows: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_resizeColumns: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_resizeRows: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly __wbg_gridcontroller_free: (a: number, b: number) => void;
    readonly __wbg_jsselection_free: (a: number, b: number) => void;
    readonly checkFormula: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly gridcontroller_addDataTable: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: any, i: number, j: number, k: number, l: number) => [number, number];
    readonly gridcontroller_cellIntersectsDataTable: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly gridcontroller_codeDataTableToDataTable: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_dataTableFirstRowAsHeader: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_dataTableMeta: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number) => any;
    readonly gridcontroller_dataTableMutations: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number) => any;
    readonly gridcontroller_flattenDataTable: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_gridToDataTable: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_selectionIntersectsDataTable: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly gridcontroller_sortDataTable: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
    readonly hello: () => void;
    readonly jsselection_clone: (a: number) => number;
    readonly jsselection_excludeCells: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly jsselection_getTableNameFromPos: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly jsselection_selectionToSheetRect: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly jsselection_updateColumnName: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly jsselection_updateTableName: (a: number, b: number, c: number, d: number, e: number) => void;
    readonly parseFormula: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly provideCompletionItems: (a: any, b: any, c: any, d: any) => [number, number, number];
    readonly provideHover: (a: any, b: any, c: any) => [number, number, number];
    readonly __wbg_cellrefcoord_free: (a: number, b: number) => void;
    readonly __wbg_cellrefrangeend_free: (a: number, b: number) => void;
    readonly __wbg_get_cellrefcoord_coord: (a: number) => bigint;
    readonly __wbg_get_cellrefcoord_is_absolute: (a: number) => number;
    readonly __wbg_get_cellrefrangeend_col: (a: number) => number;
    readonly __wbg_get_cellrefrangeend_row: (a: number) => number;
    readonly __wbg_offsets_free: (a: number, b: number) => void;
    readonly __wbg_set_cellrefcoord_coord: (a: number, b: bigint) => void;
    readonly __wbg_set_cellrefcoord_is_absolute: (a: number, b: number) => void;
    readonly __wbg_set_cellrefrangeend_col: (a: number, b: number) => void;
    readonly __wbg_set_cellrefrangeend_row: (a: number, b: number) => void;
    readonly conditionalFormatRuleToFormula: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly gridcontroller_batchUpdateConditionalFormats: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_calculationComplete: (a: number, b: number, c: number) => void;
    readonly gridcontroller_calculationGetCellsA1: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly gridcontroller_clearPreviewConditionalFormat: (a: number, b: number, c: number) => void;
    readonly gridcontroller_connectionComplete: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number) => [number, number];
    readonly gridcontroller_getAICodeErrors: (a: number, b: number) => any;
    readonly gridcontroller_getAISelectionContexts: (a: number, b: number, c: number, d: number) => any;
    readonly gridcontroller_getAITransactions: (a: number) => any;
    readonly gridcontroller_getCodeCell: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly gridcontroller_getConditionalFormats: (a: number, b: number, c: number) => [number, number, number];
    readonly gridcontroller_previewConditionalFormat: (a: number, b: number, c: number) => any;
    readonly gridcontroller_removeConditionalFormat: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => void;
    readonly gridcontroller_rerunAllCodeCells: (a: number, b: number, c: number, d: number) => any;
    readonly gridcontroller_rerunCodeCell: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_rerunSheetCodeCells: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_setCellCode: (a: number, b: number, c: number, d: number, e: number, f: any, g: number, h: number, i: number, j: number, k: number, l: number, m: number) => [number, number];
    readonly gridcontroller_setFormula: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_setFormulas: (a: number, b: number, c: number, d: any, e: number, f: number) => any;
    readonly gridcontroller_updateConditionalFormat: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly scheduledTaskDecode: (a: number, b: number) => [number, number, number];
    readonly scheduledTaskEncode: (a: number) => [number, number, number];
    readonly applyFormatToDateTime: (a: number, b: number, c: number, d: number) => [number, number];
    readonly dateTimeToNumber: (a: number, b: number) => bigint;
    readonly formatDate: (a: number, b: number, c: number, d: number) => [number, number];
    readonly formatDateTime: (a: number, b: number, c: number, d: number) => [number, number];
    readonly formatTime: (a: number, b: number, c: number, d: number) => [number, number];
    readonly gridcontroller_exportCsvSelection: (a: number, b: number, c: number) => [number, number, number, number];
    readonly gridcontroller_exportExcel: (a: number) => [number, number, number, number];
    readonly numberToDate: (a: bigint) => [number, number];
    readonly numberToTime: (a: number) => [number, number];
    readonly parseTime: (a: number, b: number, c: number, d: number) => [number, number];
    readonly timeToNumber: (a: number, b: number) => number;
    readonly userDateToNumber: (a: number, b: number) => [number, bigint];
    readonly userTimeToNumber: (a: number, b: number) => number;
    readonly __wbg_get_pos_x: (a: number) => bigint;
    readonly __wbg_get_pos_y: (a: number) => bigint;
    readonly __wbg_get_screenrect_h: (a: number) => number;
    readonly __wbg_get_screenrect_w: (a: number) => number;
    readonly __wbg_get_screenrect_x: (a: number) => number;
    readonly __wbg_get_screenrect_y: (a: number) => number;
    readonly __wbg_pos_free: (a: number, b: number) => void;
    readonly __wbg_screenrect_free: (a: number, b: number) => void;
    readonly __wbg_set_pos_x: (a: number, b: bigint) => void;
    readonly __wbg_set_pos_y: (a: number, b: bigint) => void;
    readonly __wbg_set_screenrect_h: (a: number, b: number) => void;
    readonly __wbg_set_screenrect_w: (a: number, b: number) => void;
    readonly __wbg_set_screenrect_x: (a: number, b: number) => void;
    readonly __wbg_set_screenrect_y: (a: number, b: number) => void;
    readonly __wbg_sheetdatatablescache_free: (a: number, b: number) => void;
    readonly __wbg_sheetid_free: (a: number, b: number) => void;
    readonly __wbg_sheetoffsetswasm_free: (a: number, b: number) => void;
    readonly gridcontroller_getRenderCells: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly gridcontroller_getRenderFillsForHashes: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly gridcontroller_getSheetMetaFills: (a: number, b: number, c: number) => [number, number];
    readonly jsselection_load: (a: number, b: number, c: number) => void;
    readonly jsselection_new: (a: number, b: number) => number;
    readonly jsselection_save: (a: number) => [number, number, number, number];
    readonly newAllSelection: (a: number, b: number) => [number, number, number, number];
    readonly newRectSelection: (a: number, b: number, c: bigint, d: bigint, e: bigint, f: bigint) => [number, number, number, number];
    readonly newSingleSelection: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly rectToA1: (a: any) => [number, number, number, number];
    readonly sheetoffsetswasm_empty: () => number;
    readonly sheetoffsetswasm_load: (a: number, b: number) => [number, number, number];
    readonly xyToA1: (a: number, b: number) => [number, number, number, number];
    readonly xyxyToA1: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly gridcontroller_getValidationFromPos: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly gridcontroller_getValidationList: (a: number, b: number, c: number, d: bigint, e: bigint) => [number, number, number];
    readonly gridcontroller_getValidations: (a: number, b: number, c: number) => [number, number, number];
    readonly gridcontroller_removeValidation: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => void;
    readonly gridcontroller_removeValidationSelection: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_removeValidations: (a: number, b: number, c: number, d: number, e: number, f: number) => void;
    readonly gridcontroller_summarizeSelection: (a: number, b: number, c: number, d: bigint) => [number, number, number];
    readonly gridcontroller_updateValidation: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_validateInput: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly A1SelectionStringToSelection: (a: number, b: number) => [number, number, number];
    readonly A1SelectionToJsSelection: (a: any) => [number, number, number];
    readonly __wbg_get_placement_index: (a: number) => number;
    readonly __wbg_get_placement_position: (a: number) => number;
    readonly __wbg_get_placement_size: (a: number) => number;
    readonly __wbg_placement_free: (a: number, b: number) => void;
    readonly __wbg_set_placement_index: (a: number, b: number) => void;
    readonly __wbg_set_placement_position: (a: number, b: number) => void;
    readonly __wbg_set_placement_size: (a: number, b: number) => void;
    readonly __wbg_sheetcontentcache_free: (a: number, b: number) => void;
    readonly cellRefRangeToRefRangeBounds: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly columnNameToIndex: (a: number, b: number) => [number, bigint];
    readonly convertTableToRange: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly convertTableToSheetPos: (a: number, b: number, c: number) => [number, number, number];
    readonly getTableInfo: (a: number) => [number, number, number];
    readonly gridcontroller_applyOfflineUnsavedTransaction: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly gridcontroller_multiplayerTransaction: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number];
    readonly gridcontroller_receiveMultiplayerTransactionAck: (a: number, b: number, c: number, d: number) => any;
    readonly gridcontroller_receiveMultiplayerTransactions: (a: number, b: any) => any;
    readonly gridcontroller_receiveSequenceNum: (a: number, b: number) => [number, number, number];
    readonly gridcontroller_setMultiplayerSequenceNum: (a: number, b: number) => void;
    readonly jsselection_canInsertColumnRow: (a: number) => number;
    readonly jsselection_contains: (a: number, b: number, c: number, d: number) => number;
    readonly jsselection_containsMergedCells: (a: number, b: number, c: number) => number;
    readonly jsselection_cursorIsOnHtmlImage: (a: number, b: number) => number;
    readonly jsselection_getBottomRightCell: (a: number) => number;
    readonly jsselection_getColumnsWithSelectedCells: (a: number, b: number) => [number, number];
    readonly jsselection_getContiguousColumns: (a: number) => [number, number];
    readonly jsselection_getContiguousRows: (a: number) => [number, number];
    readonly jsselection_getCursor: (a: number) => number;
    readonly jsselection_getFiniteRefRangeBounds: (a: number, b: number, c: number) => [number, number, number];
    readonly jsselection_getFirstRangeStart: (a: number, b: number) => number;
    readonly jsselection_getInfiniteRefRangeBounds: (a: number) => [number, number, number];
    readonly jsselection_getLargestRectangle: (a: number, b: number) => [number, number, number];
    readonly jsselection_getLargestUnboundedRectangle: (a: number, b: number) => [number, number, number];
    readonly jsselection_getRanges: (a: number) => [number, number, number, number];
    readonly jsselection_getRowsWithSelectedCells: (a: number, b: number) => [number, number];
    readonly jsselection_getSelectedColumnRanges: (a: number, b: number, c: number, d: number) => [number, number];
    readonly jsselection_getSelectedColumns: (a: number) => [number, number];
    readonly jsselection_getSelectedRowRanges: (a: number, b: number, c: number, d: number) => [number, number];
    readonly jsselection_getSelectedRows: (a: number) => [number, number];
    readonly jsselection_getSelectedTableColumnsCount: (a: number, b: number) => number;
    readonly jsselection_getSelectedTableNames: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly jsselection_getSheetId: (a: number) => [number, number];
    readonly jsselection_getSheetName: (a: number, b: number) => [number, number];
    readonly jsselection_getSheetRefRangeBounds: (a: number) => [number, number, number];
    readonly jsselection_getSingleFullTableSelectionName: (a: number) => [number, number];
    readonly jsselection_getSingleRectangle: (a: number, b: number) => [number, number, number];
    readonly jsselection_getSingleRectangleOrCursor: (a: number, b: number) => [number, number, number];
    readonly jsselection_getTableColumnSelection: (a: number, b: number, c: number, d: number) => any;
    readonly jsselection_getTablesWithColumnSelection: (a: number) => [number, number];
    readonly jsselection_hasOneColumnRowSelection: (a: number, b: number, c: number) => number;
    readonly jsselection_is1dRange: (a: number, b: number) => number;
    readonly jsselection_isAllSelected: (a: number) => number;
    readonly jsselection_isColumnRow: (a: number) => number;
    readonly jsselection_isEntireColumnSelected: (a: number, b: number) => number;
    readonly jsselection_isEntireRowSelected: (a: number, b: number) => number;
    readonly jsselection_isMultiCursor: (a: number, b: number) => number;
    readonly jsselection_isSelectedColumnsFinite: (a: number, b: number) => number;
    readonly jsselection_isSelectedRowsFinite: (a: number, b: number) => number;
    readonly jsselection_isSingleSelection: (a: number, b: number) => number;
    readonly jsselection_isTableColumnSelected: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly jsselection_outOfRange: (a: number) => number;
    readonly jsselection_overlapsA1Selection: (a: number, b: number, c: number, d: number) => [number, number, number];
    readonly jsselection_selection: (a: number) => [number, number, number];
    readonly jsselection_selectionEnd: (a: number, b: number) => number;
    readonly jsselection_toA1String: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly jsselection_toCursorA1: (a: number) => [number, number, number, number];
    readonly selectionToSheetRect: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly selectionToSheetRectString: (a: number, b: number, c: number, d: number, e: number) => [number, number, number, number];
    readonly sheetcontentcache_hasContent: (a: number, b: number, c: number) => number;
    readonly sheetcontentcache_hasContentInRect: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly sheetcontentcache_new: (a: number, b: number) => number;
    readonly sheetcontentcache_new_empty: () => number;
    readonly sheetoffsets_cancelResize: (a: number) => void;
    readonly sheetoffsets_getCellOffsets: (a: number, b: number, c: number) => number;
    readonly sheetoffsets_getColumnFromScreen: (a: number, b: number) => number;
    readonly sheetoffsets_getColumnPlacement: (a: number, b: number) => number;
    readonly sheetoffsets_getColumnRowFromScreen: (a: number, b: number, c: number) => [number, number];
    readonly sheetoffsets_getColumnWidth: (a: number, b: number) => number;
    readonly sheetoffsets_getRectCellOffsets: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly sheetoffsets_getResizeToApply: (a: number) => [number, number];
    readonly sheetoffsets_getRowFromScreen: (a: number, b: number) => number;
    readonly sheetoffsets_getRowHeight: (a: number, b: number) => number;
    readonly sheetoffsets_getRowPlacement: (a: number, b: number) => number;
    readonly sheetoffsets_getXPlacement: (a: number, b: number) => number;
    readonly sheetoffsets_getYPlacement: (a: number, b: number) => number;
    readonly sheetoffsets_resizeColumnTransiently: (a: number, b: number, c: number, d: number) => void;
    readonly sheetoffsets_resizeRowTransiently: (a: number, b: number, c: number, d: number) => void;
    readonly sheetoffsets_setColumnWidth: (a: number, b: number, c: number) => number;
    readonly sheetoffsets_setRowHeight: (a: number, b: number, c: number) => number;
    readonly stringToSelection: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly toggleReferenceTypes: (a: number, b: number) => [number, number, number, number];
    readonly __wbg_get_refrangebounds_end: (a: number) => number;
    readonly __wbg_get_refrangebounds_start: (a: number) => number;
    readonly __wbg_jsa1context_free: (a: number, b: number) => void;
    readonly __wbg_refrangebounds_free: (a: number, b: number) => void;
    readonly __wbg_set_refrangebounds_end: (a: number, b: number) => void;
    readonly __wbg_set_refrangebounds_start: (a: number, b: number) => void;
    readonly gridcontroller_mergeCells: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_unmergeCells: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly jsa1context_new: (a: number, b: number) => number;
    readonly jsa1context_newEmpty: () => number;
    readonly __wbg_emptyvaluescache_free: (a: number, b: number) => void;
    readonly gridcontroller_addSheet: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_changeDecimalPlaces: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_clearFormatting: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly gridcontroller_deleteSheet: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_duplicateSheet: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_getCellFormatSummary: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly gridcontroller_getFormatSelection: (a: number, b: number, c: number) => any;
    readonly gridcontroller_getSheetColor: (a: number, b: number, c: number) => [number, number];
    readonly gridcontroller_getSheetIds: (a: number) => [number, number, number];
    readonly gridcontroller_getSheetName: (a: number, b: number, c: number) => [number, number];
    readonly gridcontroller_getSheetOrder: (a: number, b: number, c: number) => [number, number];
    readonly gridcontroller_moveSheet: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_removeNumericFormat: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly gridcontroller_setAlign: (a: number, b: number, c: number, d: any, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setBold: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setChartSize: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_setCommas: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setCurrency: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_setDateTimeFormat: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_setExponential: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly gridcontroller_setFillColor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_setFontSize: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setFormats: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => any;
    readonly gridcontroller_setFormatsA1: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_setItalic: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setPercentage: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly gridcontroller_setSheetColor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_setSheetName: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_setSheetsColor: (a: number, b: any, c: number, d: number, e: number) => any;
    readonly gridcontroller_setStrikeThrough: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setTextColor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_setUnderline: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setVerticalAlign: (a: number, b: number, c: number, d: any, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setWrap: (a: number, b: number, c: number, d: any, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_sheetIdToIndex: (a: number, b: number, c: number) => number;
    readonly jumpCursor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number, number];
    readonly moveCursor: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number, number];
    readonly gridcontroller_deleteColumns: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_deleteRows: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => any;
    readonly gridcontroller_insertColumns: (a: number, b: number, c: number, d: bigint, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_insertRows: (a: number, b: number, c: number, d: bigint, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_moveColumns: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_moveRows: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => any;
    readonly gridcontroller_setBorders: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => any;
    readonly __wbg_get_jscoordinate_x: (a: number) => number;
    readonly __wbg_get_jscoordinate_y: (a: number) => number;
    readonly __wbg_jscoordinate_free: (a: number, b: number) => void;
    readonly __wbg_set_jscoordinate_x: (a: number, b: number) => void;
    readonly __wbg_set_jscoordinate_y: (a: number, b: number) => void;
    readonly gridcontroller_applyFormatPainter: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => [number, number];
    readonly gridcontroller_copyToClipboard: (a: number, b: number, c: number) => [number, number, number, number];
    readonly gridcontroller_cutToClipboard: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number, number, number];
    readonly gridcontroller_deleteCellValues: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_getAICellFormats: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_getAICells: (a: number, b: number, c: number, d: number, e: number, f: number) => any;
    readonly gridcontroller_getCellValue: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly gridcontroller_getDisplayValue: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly gridcontroller_getEditCell: (a: number, b: number, c: number, d: number, e: number) => [number, number, number];
    readonly gridcontroller_hasCellData: (a: number, b: number, c: number, d: number, e: number) => any;
    readonly gridcontroller_moveCellsBatch: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
    readonly gridcontroller_moveCodeCellHorizontally: (a: number, b: number, c: number, d: bigint, e: bigint, f: number, g: number, h: number, i: number, j: number) => any;
    readonly gridcontroller_moveCodeCellVertically: (a: number, b: number, c: number, d: bigint, e: bigint, f: number, g: number, h: number, i: number, j: number) => any;
    readonly gridcontroller_moveColsRows: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
    readonly gridcontroller_pasteFromClipboard: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
    readonly gridcontroller_setCellNumericDecimals: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
    readonly gridcontroller_setCellRichText: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => [number, number];
    readonly gridcontroller_setCellValue: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number) => [number, number];
    readonly gridcontroller_setCellValues: (a: number, b: number, c: number, d: number, e: number, f: any, g: number, h: number, i: number) => [number, number];
    readonly sheetdatatablescache_getTableInPos: (a: number, b: number, c: number) => number;
    readonly sheetdatatablescache_getTablesInRect: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly sheetdatatablescache_hasCodeCellInSelection: (a: number, b: number, c: number) => number;
    readonly sheetdatatablescache_hasTableInRect: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly sheetdatatablescache_new: (a: number, b: number) => number;
    readonly sheetdatatablescache_new_empty: () => number;
    readonly rust_zstd_wasm_shim_calloc: (a: number, b: number) => number;
    readonly rust_zstd_wasm_shim_free: (a: number) => void;
    readonly rust_zstd_wasm_shim_malloc: (a: number) => number;
    readonly rust_zstd_wasm_shim_memcmp: (a: number, b: number, c: number) => number;
    readonly rust_zstd_wasm_shim_memcpy: (a: number, b: number, c: number) => number;
    readonly rust_zstd_wasm_shim_memmove: (a: number, b: number, c: number) => number;
    readonly rust_zstd_wasm_shim_memset: (a: number, b: number, c: number) => number;
    readonly rust_zstd_wasm_shim_qsort: (a: number, b: number, c: number, d: number) => void;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __externref_drop_slice: (a: number, b: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
