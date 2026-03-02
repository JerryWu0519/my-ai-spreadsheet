/* @ts-self-types="./quadratic_core.d.ts" */

//#region js imports
import { addUnsentTransaction, jsA1Context, jsAddSheet, jsBordersSheet, jsClientMessage, jsCodeRunningState, jsConnection, jsDeleteSheet, jsHashRenderFills, jsHashesDirtyFills, jsHashesDirty, jsHashesRenderCells, jsHtmlOutput, jsImportProgress, jsMergeCells, jsOffsetsModified, jsRequestRowHeights, jsRequestTransactions, jsRunJavascript, jsRunPython, jsSendContentCache, jsSendDataTablesCache, jsSendImage, jsSendTransaction, jsSetCursor, jsSheetBoundsUpdate, jsSheetCodeCells, jsSheetConditionalFormats, jsSheetInfoUpdate, jsSheetInfo, jsSheetMetaFills, jsSheetValidations, jsTransactionEnd, jsTransactionStart, jsUndoRedo, jsUpdateCodeCells, jsUpdateHtml, jsValidationWarnings } from '../web-workers/quadraticCore/worker/rustCallbacks.ts';

//#endregion

//#region exports

/**
 * @param {string} a1_selection
 * @returns {JsSelection}
 */
export function A1SelectionStringToSelection(a1_selection) {
    const ptr0 = passStringToWasm0(a1_selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.A1SelectionStringToSelection(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return JsSelection.__wrap(ret[0]);
}

/**
 * @param {any} a1_selection
 * @returns {JsSelection}
 */
export function A1SelectionToJsSelection(a1_selection) {
    const ret = wasm.A1SelectionToJsSelection(a1_selection);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return JsSelection.__wrap(ret[0]);
}

export class CellRefCoord {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CellRefCoord.prototype);
        obj.__wbg_ptr = ptr;
        CellRefCoordFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellRefCoordFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cellrefcoord_free(ptr, 0);
    }
    /**
     * @returns {bigint}
     */
    get coord() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_cellrefcoord_coord(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {boolean}
     */
    get is_absolute() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_cellrefcoord_is_absolute(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {bigint} arg0
     */
    set coord(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertBigInt(arg0);
        wasm.__wbg_set_cellrefcoord_coord(this.__wbg_ptr, arg0);
    }
    /**
     * @param {boolean} arg0
     */
    set is_absolute(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertBoolean(arg0);
        wasm.__wbg_set_cellrefcoord_is_absolute(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) CellRefCoord.prototype[Symbol.dispose] = CellRefCoord.prototype.free;

export class CellRefRangeEnd {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CellRefRangeEnd.prototype);
        obj.__wbg_ptr = ptr;
        CellRefRangeEndFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellRefRangeEndFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cellrefrangeend_free(ptr, 0);
    }
    /**
     * @returns {CellRefCoord}
     */
    get col() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_cellrefrangeend_col(this.__wbg_ptr);
        return CellRefCoord.__wrap(ret);
    }
    /**
     * @returns {CellRefCoord}
     */
    get row() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_cellrefrangeend_row(this.__wbg_ptr);
        return CellRefCoord.__wrap(ret);
    }
    /**
     * @param {CellRefCoord} arg0
     */
    set col(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(arg0, CellRefCoord);
        if (arg0.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_cellrefrangeend_col(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {CellRefCoord} arg0
     */
    set row(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(arg0, CellRefCoord);
        if (arg0.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_cellrefrangeend_row(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) CellRefRangeEnd.prototype[Symbol.dispose] = CellRefRangeEnd.prototype.free;

/**
 * @enum {0 | 1 | 2 | 3}
 */
export const Direction = Object.freeze({
    Up: 0, "0": "Up",
    Down: 1, "1": "Down",
    Left: 2, "2": "Left",
    Right: 3, "3": "Right",
});

export class EmptyValuesCache {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        EmptyValuesCacheFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_emptyvaluescache_free(ptr, 0);
    }
}
if (Symbol.dispose) EmptyValuesCache.prototype[Symbol.dispose] = EmptyValuesCache.prototype.free;

export class GridController {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(GridController.prototype);
        obj.__wbg_ptr = ptr;
        GridControllerFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        GridControllerFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_gridcontroller_free(ptr, 0);
    }
    /**
     * @param {string} sheet_id
     * @param {string} pos
     * @param {string} name
     * @param {any} values
     * @param {boolean} first_row_is_header
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    addDataTable(sheet_id, pos, name, values, first_row_is_header, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        _assertBoolean(first_row_is_header);
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_addDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, values, first_row_is_header, ptr3, len3, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Adds an empty sheet to the grid. Returns a [`TransactionSummary`].
     * @param {string | null | undefined} sheet_name
     * @param {string | null | undefined} insert_before_sheet_name
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    addSheet(sheet_name, insert_before_sheet_name, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        var ptr0 = isLikeNone(sheet_name) ? 0 : passStringToWasm0(sheet_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(insert_before_sheet_name) ? 0 : passStringToWasm0(insert_before_sheet_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_addSheet(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * Apply format painter: copy formatting from source selection to target selection
     * @param {string} source_selection
     * @param {string} target_selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    applyFormatPainter(source_selection, target_selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(source_selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(target_selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_applyFormatPainter(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} transaction_id
     * @param {string} unsaved_transaction
     * @returns {any}
     */
    applyOfflineUnsavedTransaction(transaction_id, unsaved_transaction) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(unsaved_transaction, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_applyOfflineUnsavedTransaction(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Extend and/or shrink the contents of selection to range by inferring patterns.
     * @param {string} sheet_id
     * @param {string} initial_range
     * @param {string} final_range
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    autocomplete(sheet_id, initial_range, final_range, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(initial_range, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(final_range, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_autocomplete(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Batch update conditional formats - creates, updates, or deletes multiple
     * conditional formats in a single transaction. Used by AI tools.
     * @param {string} sheet_id
     * @param {string} updates
     * @param {string} delete_ids
     * @param {string | null} [cursor]
     * @returns {any}
     */
    batchUpdateConditionalFormats(sheet_id, updates, delete_ids, cursor) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(updates, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(delete_ids, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_batchUpdateConditionalFormats(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        return ret;
    }
    /**
     * Called after a external calculation is complete.
     * @param {Uint8Array} result
     */
    calculationComplete(result) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passArray8ToWasm0(result, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.gridcontroller_calculationComplete(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {string} transaction_id
     * @param {string} a1
     * @returns {Uint8Array}
     */
    calculationGetCellsA1(transaction_id, a1) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(a1, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_calculationGetCellsA1(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * Returns true if a cell position intersects with a data table, but allows
     * the anchor cell (top-left) of a code cell (not an import)
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {boolean}
     */
    cellIntersectsDataTable(sheet_id, pos) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_cellIntersectsDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Changes cell numeric decimals.
     * @param {string} selection
     * @param {number} delta
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    changeDecimalPlaces(selection, delta, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(delta);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_changeDecimalPlaces(this.__wbg_ptr, ptr0, len0, delta, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Returns a [`TransactionSummary`].
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    clearFormatting(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_clearFormatting(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Clears the preview conditional format and triggers a re-render.
     * @param {string} sheet_id
     */
    clearPreviewConditionalFormat(sheet_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.gridcontroller_clearPreviewConditionalFormat(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * Converts a DataTableKind::CodeRun to DataTableKind::Import
     * @param {string} sheet_id
     * @param {string} pos
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    codeDataTableToDataTable(sheet_id, pos, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_codeDataTableToDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {string | null | undefined} transient_resize
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    commitOffsetsResize(sheet_id, transient_resize, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(transient_resize) ? 0 : passStringToWasm0(transient_resize, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_commitOffsetsResize(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Commits a single resize operation. Returns a [`TransactionSummary`].
     * @param {string} sheet_id
     * @param {number | null | undefined} column
     * @param {number | null | undefined} row
     * @param {number} size
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    commitSingleResize(sheet_id, column, row, size, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(column)) {
            _assertNum(column);
        }
        if (!isLikeNone(row)) {
            _assertNum(row);
        }
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_commitSingleResize(this.__wbg_ptr, ptr0, len0, isLikeNone(column) ? 0x100000001 : (column) >> 0, isLikeNone(row) ? 0x100000001 : (row) >> 0, size, ptr1, len1, is_ai);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} transaction_id
     * @param {Uint8Array} data
     * @param {string | null} [std_out]
     * @param {string | null} [std_err]
     * @param {string | null} [extra]
     */
    connectionComplete(transaction_id, data, std_out, std_err, extra) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(std_out) ? 0 : passStringToWasm0(std_out, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(std_err) ? 0 : passStringToWasm0(std_err, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(extra) ? 0 : passStringToWasm0(extra, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_connectionComplete(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Returns the clipboard [`JsClipboard`]
     * @param {string} selection
     * @returns {Uint8Array}
     */
    copyToClipboard(selection) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_copyToClipboard(this.__wbg_ptr, ptr0, len0);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * Returns the clipboard [`JsClipboard`]
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {Uint8Array}
     */
    cutToClipboard(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_cutToClipboard(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * Toggle applying the first row as head
     * @param {string} sheet_id
     * @param {string} pos
     * @param {boolean} first_row_is_header
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    dataTableFirstRowAsHeader(sheet_id, pos, first_row_is_header, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertBoolean(first_row_is_header);
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_dataTableFirstRowAsHeader(this.__wbg_ptr, ptr0, len0, ptr1, len1, first_row_is_header, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * Update a Data Table's name
     * @param {string} sheet_id
     * @param {string} pos
     * @param {string | null | undefined} name
     * @param {boolean | null | undefined} alternating_colors
     * @param {string | null | undefined} columns_js
     * @param {boolean | null | undefined} show_name
     * @param {boolean | null | undefined} show_columns
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    dataTableMeta(sheet_id, pos, name, alternating_colors, columns_js, show_name, show_columns, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(name) ? 0 : passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        if (!isLikeNone(alternating_colors)) {
            _assertBoolean(alternating_colors);
        }
        var ptr3 = isLikeNone(columns_js) ? 0 : passStringToWasm0(columns_js, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        if (!isLikeNone(show_name)) {
            _assertBoolean(show_name);
        }
        if (!isLikeNone(show_columns)) {
            _assertBoolean(show_columns);
        }
        var ptr4 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_dataTableMeta(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, isLikeNone(alternating_colors) ? 0xFFFFFF : alternating_colors ? 1 : 0, ptr3, len3, isLikeNone(show_name) ? 0xFFFFFF : show_name ? 1 : 0, isLikeNone(show_columns) ? 0xFFFFFF : show_columns ? 1 : 0, ptr4, len4, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} pos
     * @param {boolean} select_table
     * @param {Uint32Array | null | undefined} columns_to_add
     * @param {Uint32Array | null | undefined} columns_to_remove
     * @param {Uint32Array | null | undefined} rows_to_add
     * @param {Uint32Array | null | undefined} rows_to_remove
     * @param {boolean | null | undefined} flatten_on_delete
     * @param {boolean | null | undefined} swallow_on_insert
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    dataTableMutations(sheet_id, pos, select_table, columns_to_add, columns_to_remove, rows_to_add, rows_to_remove, flatten_on_delete, swallow_on_insert, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertBoolean(select_table);
        var ptr2 = isLikeNone(columns_to_add) ? 0 : passArray32ToWasm0(columns_to_add, wasm.__wbindgen_malloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(columns_to_remove) ? 0 : passArray32ToWasm0(columns_to_remove, wasm.__wbindgen_malloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(rows_to_add) ? 0 : passArray32ToWasm0(rows_to_add, wasm.__wbindgen_malloc);
        var len4 = WASM_VECTOR_LEN;
        var ptr5 = isLikeNone(rows_to_remove) ? 0 : passArray32ToWasm0(rows_to_remove, wasm.__wbindgen_malloc);
        var len5 = WASM_VECTOR_LEN;
        if (!isLikeNone(flatten_on_delete)) {
            _assertBoolean(flatten_on_delete);
        }
        if (!isLikeNone(swallow_on_insert)) {
            _assertBoolean(swallow_on_insert);
        }
        var ptr6 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len6 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_dataTableMutations(this.__wbg_ptr, ptr0, len0, ptr1, len1, select_table, ptr2, len2, ptr3, len3, ptr4, len4, ptr5, len5, isLikeNone(flatten_on_delete) ? 0xFFFFFF : flatten_on_delete ? 1 : 0, isLikeNone(swallow_on_insert) ? 0xFFFFFF : swallow_on_insert ? 1 : 0, ptr6, len6, is_ai);
        return ret;
    }
    /**
     * Deletes a region of cells.
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    deleteCellValues(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_deleteCellValues(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} columns
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    deleteColumns(sheet_id, columns, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(columns, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_deleteColumns(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} rows
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    deleteRows(sheet_id, rows, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(rows, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_deleteRows(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * Deletes a sheet from the the grid. Returns a [`TransactionSummary`].
     * @param {string} sheet_id
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    deleteSheet(sheet_id, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_deleteSheet(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Makes a copy of a sheet. Returns a [`TransactionSummary`].
     * @param {string} sheet_id
     * @param {string | null | undefined} name_of_new_sheet
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    duplicateSheet(sheet_id, name_of_new_sheet, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(name_of_new_sheet) ? 0 : passStringToWasm0(name_of_new_sheet, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_duplicateSheet(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * Returns [`TransactionSummary`]
     * @param {string} selection
     * @returns {string}
     */
    exportCsvSelection(selection) {
        let deferred3_0;
        let deferred3_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.gridcontroller_exportCsvSelection(this.__wbg_ptr, ptr0, len0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * Returns [`TransactionSummary`]
     * @returns {Uint8Array}
     */
    exportExcel() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_exportExcel(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Exports a [`GridController`] to a file (consumes the grid). Returns a `Vec<u8>`.
     * This is useful when exporting the grid to a file from dashboard, saves memory while exporting.
     * @returns {Uint8Array}
     */
    exportGridToFile() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        const ptr = this.__destroy_into_raw();
        _assertNum(ptr);
        const ret = wasm.gridcontroller_exportGridToFile(ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Exports a [`GridController`] to a file (exports the grid using clone). Returns a `Vec<u8>`.
     * This is required when exporting the open file from app, requires a clone because the grid is still being used.
     * @returns {Uint8Array}
     */
    exportOpenGridToFile() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_exportOpenGridToFile(this.__wbg_ptr);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v1;
    }
    /**
     * Exports a [`GridController`] to a JSON string for debugging.
     * @returns {string}
     */
    exportOpenGridToJson() {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.gridcontroller_exportOpenGridToJson(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Flattens a Data Table
     * @param {string} sheet_id
     * @param {string} pos
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    flattenDataTable(sheet_id, pos, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_flattenDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {string} a1
     * @param {number} page
     * @returns {any}
     */
    getAICellFormats(sheet_id, a1, page) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(a1, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertNum(page);
        const ret = wasm.gridcontroller_getAICellFormats(this.__wbg_ptr, ptr0, len0, ptr1, len1, page);
        return ret;
    }
    /**
     * @param {string} a1
     * @param {string} sheet_id
     * @param {number} page
     * @returns {any}
     */
    getAICells(a1, sheet_id, page) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(a1, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertNum(page);
        const ret = wasm.gridcontroller_getAICells(this.__wbg_ptr, ptr0, len0, ptr1, len1, page);
        return ret;
    }
    /**
     * Returns all code cells with errors or spills in all sheets. Returns
     * undefined if there are no errors or spills in the file.
     * @param {number} max_errors
     * @returns {any}
     */
    getAICodeErrors(max_errors) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(max_errors);
        const ret = wasm.gridcontroller_getAICodeErrors(this.__wbg_ptr, max_errors);
        return ret;
    }
    /**
     * Returns the context for ai in selection. If max_rows is not provided, then it does not provide sample rows
     * returns an array of JsSelectionContext, one for each selection
     * @param {string[]} selections
     * @param {number | null} [max_rows]
     * @returns {any}
     */
    getAISelectionContexts(selections, max_rows) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passArrayJsValueToWasm0(selections, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(max_rows)) {
            _assertNum(max_rows);
        }
        const ret = wasm.gridcontroller_getAISelectionContexts(this.__wbg_ptr, ptr0, len0, isLikeNone(max_rows) ? 0x100000001 : (max_rows) >>> 0);
        return ret;
    }
    /**
     * @returns {any}
     */
    getAITransactions() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_getAITransactions(this.__wbg_ptr);
        return ret;
    }
    /**
     * Returns a summary of the formatting in a region as a
     * [`CellFormatSummary`]. This includes any conditional formatting applied to the cell.
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {any}
     */
    getCellFormatSummary(sheet_id, pos) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getCellFormatSummary(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * gets the value and type for a cell
     * returns a stringified JsCellValue
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {any}
     */
    getCellValue(sheet_id, pos) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getCellValue(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns the code cell if the pos is part of a code run.
     *
     * * CodeCell.evaluation_result is a stringified version of the output (used for AI models)
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {any}
     */
    getCodeCell(sheet_id, pos) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getCodeCell(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Returns the conditional formats for a sheet
     * @param {string} sheet_id
     * @returns {any}
     */
    getConditionalFormats(sheet_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getConditionalFormats(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * gets the display value for a cell
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {string}
     */
    getDisplayValue(sheet_id, pos) {
        let deferred3_0;
        let deferred3_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            const ret = wasm.gridcontroller_getDisplayValue(this.__wbg_ptr, ptr0, len0, ptr1, len1);
            deferred3_0 = ret[0];
            deferred3_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * gets an editable string for a cell
     *
     * returns a JsEditCell with text and optional code_cell info
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {any}
     */
    getEditCell(sheet_id, pos) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getEditCell(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} selection
     * @returns {any}
     */
    getFormatSelection(selection) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getFormatSelection(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * Returns cell data in a format useful for rendering. This includes only
     * the data necessary to render raw text values.
     *
     * Returns a string containing a JSON array of [`JsRenderCell`].
     * @param {string} sheet_id
     * @param {string} rect
     * @returns {Uint8Array}
     */
    getRenderCells(sheet_id, rect) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(rect, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getRenderCells(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * Returns fill data for the specified hashes.
     *
     * hashes_json is a JSON array of {x, y} hash coordinates.
     * Returns a JSON array of [`JsHashRenderFills`].
     * @param {string} sheet_id
     * @param {string} hashes_json
     * @returns {Uint8Array}
     */
    getRenderFillsForHashes(sheet_id, hashes_json) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(hashes_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getRenderFillsForHashes(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }
    /**
     * @param {string} sheet_id
     * @returns {string}
     */
    getSheetColor(sheet_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.gridcontroller_getSheetColor(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Gets a list of ordered sheet ids
     * @returns {any}
     */
    getSheetIds() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_getSheetIds(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns meta fills (row/column/sheet fills) for a sheet.
     *
     * Returns a JSON array of [`JsSheetFill`].
     * @param {string} sheet_id
     * @returns {Uint8Array}
     */
    getSheetMetaFills(sheet_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getSheetMetaFills(this.__wbg_ptr, ptr0, len0);
        var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v2;
    }
    /**
     * @param {string} sheet_id
     * @returns {string}
     */
    getSheetName(sheet_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.gridcontroller_getSheetName(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Returns the order string for a sheet.
     * @param {string} sheet_id
     * @returns {string}
     */
    getSheetOrder(sheet_id) {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ret = wasm.gridcontroller_getSheetOrder(this.__wbg_ptr, ptr0, len0);
            deferred2_0 = ret[0];
            deferred2_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Gets a Validation from a Position
     * @param {string} sheet_id
     * @param {string} pos
     * @returns {any}
     */
    getValidationFromPos(sheet_id, pos) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getValidationFromPos(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns a list of values for a List validation
     * @param {string} sheet_id
     * @param {bigint} x
     * @param {bigint} y
     * @returns {any}
     */
    getValidationList(sheet_id, x, y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(x);
        _assertBigInt(y);
        const ret = wasm.gridcontroller_getValidationList(this.__wbg_ptr, ptr0, len0, x, y);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns a stringified version of Vec<Validation>
     * @param {string} sheet_id
     * @returns {any}
     */
    getValidations(sheet_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_getValidations(this.__wbg_ptr, ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Exports a [`string`]
     * @returns {string}
     */
    getVersion() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.gridcontroller_getVersion(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Converts a selection on the grid to a Data Table
     * @param {string} sheet_rect
     * @param {string | null | undefined} table_name
     * @param {boolean} first_row_is_header
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    gridToDataTable(sheet_rect, table_name, first_row_is_header, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_rect, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(table_name) ? 0 : passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(first_row_is_header);
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_gridToDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1, first_row_is_header, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} selection
     * @returns {any}
     */
    hasCellData(sheet_id, selection) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_hasCellData(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Returns whether there is a transaction to redo.
     * @returns {boolean}
     */
    hasRedo() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_hasRedo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether there is a transaction to undo.
     * @returns {boolean}
     */
    hasUndo() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_hasUndo(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {Uint8Array} file
     * @param {string} file_name
     * @param {number | null} [delimiter]
     * @param {boolean | null} [header_is_first_row]
     * @param {boolean | null} [is_overwrite_table]
     * @returns {GridController}
     */
    static importCsv(file, file_name, delimiter, header_is_first_row, is_overwrite_table) {
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        if (!isLikeNone(delimiter)) {
            _assertNum(delimiter);
        }
        if (!isLikeNone(header_is_first_row)) {
            _assertBoolean(header_is_first_row);
        }
        if (!isLikeNone(is_overwrite_table)) {
            _assertBoolean(is_overwrite_table);
        }
        const ret = wasm.gridcontroller_importCsv(ptr0, len0, ptr1, len1, isLikeNone(delimiter) ? 0xFFFFFF : delimiter, isLikeNone(header_is_first_row) ? 0xFFFFFF : header_is_first_row ? 1 : 0, isLikeNone(is_overwrite_table) ? 0xFFFFFF : is_overwrite_table ? 1 : 0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return GridController.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} file
     * @param {string} file_name
     * @param {string} sheet_id
     * @param {string} insert_at
     * @param {string | null | undefined} cursor
     * @param {number | null | undefined} delimiter
     * @param {boolean | null | undefined} header_is_first_row
     * @param {boolean} is_ai
     * @param {boolean} is_overwrite_table
     * @returns {any}
     */
    importCsvIntoExistingFile(file, file_name, sheet_id, insert_at, cursor, delimiter, header_is_first_row, is_ai, is_overwrite_table) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(insert_at, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        if (!isLikeNone(delimiter)) {
            _assertNum(delimiter);
        }
        if (!isLikeNone(header_is_first_row)) {
            _assertBoolean(header_is_first_row);
        }
        _assertBoolean(is_ai);
        _assertBoolean(is_overwrite_table);
        const ret = wasm.gridcontroller_importCsvIntoExistingFile(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, isLikeNone(delimiter) ? 0xFFFFFF : delimiter, isLikeNone(header_is_first_row) ? 0xFFFFFF : header_is_first_row ? 1 : 0, is_ai, is_overwrite_table);
        return ret;
    }
    /**
     * @param {Uint8Array} file
     * @param {string} file_name
     * @returns {GridController}
     */
    static importExcel(file, file_name) {
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_importExcel(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return GridController.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} file
     * @param {string} file_name
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    importExcelIntoExistingFile(file, file_name, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_importExcelIntoExistingFile(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {Uint8Array} file
     * @param {string} file_name
     * @returns {GridController}
     */
    static importParquet(file, file_name) {
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_importParquet(ptr0, len0, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return GridController.__wrap(ret[0]);
    }
    /**
     * @param {Uint8Array} file
     * @param {string} file_name
     * @param {string} sheet_id
     * @param {string} insert_at
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @param {boolean} is_overwrite_table
     * @returns {any}
     */
    importParquetIntoExistingFile(file, file_name, sheet_id, insert_at, cursor, is_ai, is_overwrite_table) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(file_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ptr3 = passStringToWasm0(insert_at, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        _assertBoolean(is_overwrite_table);
        const ret = wasm.gridcontroller_importParquetIntoExistingFile(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, ptr4, len4, is_ai, is_overwrite_table);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {bigint} column
     * @param {number} count
     * @param {boolean} after
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    insertColumns(sheet_id, column, count, after, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(column);
        _assertNum(count);
        _assertBoolean(after);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_insertColumns(this.__wbg_ptr, ptr0, len0, column, count, after, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {bigint} row
     * @param {number} count
     * @param {boolean} after
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    insertRows(sheet_id, row, count, after, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(row);
        _assertNum(count);
        _assertBoolean(after);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_insertRows(this.__wbg_ptr, ptr0, len0, row, count, after, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Merges cells for the selection within a rectangle.
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    mergeCells(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_mergeCells(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Move multiple cell regions in a single transaction
     * moves_json is a JSON array of objects with source and dest properties
     * @param {string} moves_json
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    moveCellsBatch(moves_json, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(moves_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveCellsBatch(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {bigint} x
     * @param {bigint} y
     * @param {boolean} sheet_end
     * @param {boolean} reverse
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    moveCodeCellHorizontally(sheet_id, x, y, sheet_end, reverse, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(x);
        _assertBigInt(y);
        _assertBoolean(sheet_end);
        _assertBoolean(reverse);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveCodeCellHorizontally(this.__wbg_ptr, ptr0, len0, x, y, sheet_end, reverse, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {bigint} x
     * @param {bigint} y
     * @param {boolean} sheet_end
     * @param {boolean} reverse
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    moveCodeCellVertically(sheet_id, x, y, sheet_end, reverse, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(x);
        _assertBigInt(y);
        _assertBoolean(sheet_end);
        _assertBoolean(reverse);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveCodeCellVertically(this.__wbg_ptr, ptr0, len0, x, y, sheet_end, reverse, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} source
     * @param {string} dest
     * @param {boolean} columns
     * @param {boolean} rows
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    moveColsRows(source, dest, columns, rows, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(source, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(dest, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertBoolean(columns);
        _assertBoolean(rows);
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveColsRows(this.__wbg_ptr, ptr0, len0, ptr1, len1, columns, rows, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {number} col_start
     * @param {number} col_end
     * @param {number} to
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    moveColumns(sheet_id, col_start, col_end, to, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(col_start);
        _assertNum(col_end);
        _assertNum(to);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveColumns(this.__wbg_ptr, ptr0, len0, col_start, col_end, to, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {number} row_start
     * @param {number} row_end
     * @param {number} to
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    moveRows(sheet_id, row_start, row_end, to, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(row_start);
        _assertNum(row_end);
        _assertNum(to);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveRows(this.__wbg_ptr, ptr0, len0, row_start, row_end, to, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Moves a sheet to before another sheet, or to the end of the list.
     * Returns a [`TransactionSummary`].
     * @param {string} sheet_id
     * @param {string | null | undefined} to_before
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    moveSheet(sheet_id, to_before, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(to_before) ? 0 : passStringToWasm0(to_before, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_moveSheet(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {string} transaction_id
     * @param {number} sequence_num
     * @param {Uint8Array} operations
     * @returns {any}
     */
    multiplayerTransaction(transaction_id, sequence_num, operations) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(sequence_num);
        const ptr1 = passArray8ToWasm0(operations, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_multiplayerTransaction(this.__wbg_ptr, ptr0, len0, sequence_num, ptr1, len1);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {string} sheet_id
     * @param {bigint} x
     * @param {bigint} y
     * @returns {any}
     */
    neighborText(sheet_id, x, y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(x);
        _assertBigInt(y);
        const ret = wasm.gridcontroller_neighborText(this.__wbg_ptr, ptr0, len0, x, y);
        return ret;
    }
    /**
     * Imports a [`GridController`] from a JSON string.
     * @param {Uint8Array} file
     * @param {number} last_sequence_num
     * @param {boolean} initialize
     * @returns {GridController}
     */
    static newFromFile(file, last_sequence_num, initialize) {
        const ptr0 = passArray8ToWasm0(file, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(last_sequence_num);
        _assertBoolean(initialize);
        const ret = wasm.gridcontroller_newFromFile(ptr0, len0, last_sequence_num, initialize);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return GridController.__wrap(ret[0]);
    }
    /**
     * @param {string} selection
     * @param {Uint8Array} js_clipboard
     * @param {string} special
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    pasteFromClipboard(selection, js_clipboard, special, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray8ToWasm0(js_clipboard, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(special, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_pasteFromClipboard(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets a preview conditional format for live preview while editing.
     * This is transient and not persisted. Triggers a re-render of affected cells.
     * @param {string} conditional_format
     * @returns {any}
     */
    previewConditionalFormat(conditional_format) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(conditional_format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_previewConditionalFormat(this.__wbg_ptr, ptr0, len0);
        return ret;
    }
    /**
     * @param {string} transaction_id
     * @param {number} sequence_num
     * @returns {any}
     */
    receiveMultiplayerTransactionAck(transaction_id, sequence_num) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(sequence_num);
        const ret = wasm.gridcontroller_receiveMultiplayerTransactionAck(this.__wbg_ptr, ptr0, len0, sequence_num);
        return ret;
    }
    /**
     * @param {any} transactions
     * @returns {any}
     */
    receiveMultiplayerTransactions(transactions) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.gridcontroller_receiveMultiplayerTransactions(this.__wbg_ptr, transactions);
        return ret;
    }
    /**
     * @param {string} transaction_id
     * @param {string} sheet_id
     * @param {string} row_heights
     * @returns {any}
     */
    receiveRowHeights(transaction_id, sheet_id, row_heights) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(transaction_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(row_heights, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_receiveRowHeights(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Handle server-provided sequence_num.
     *
     * Returns a [`TransactionSummary`] (sometimes with a request for more transactions)
     * @param {number} sequence_num
     * @returns {any}
     */
    receiveSequenceNum(sequence_num) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(sequence_num);
        const ret = wasm.gridcontroller_receiveSequenceNum(this.__wbg_ptr, sequence_num);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Redoes count transactions.
     * @param {number} count
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    redo(count, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(count);
        var ptr0 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_redo(this.__wbg_ptr, count, ptr0, len0, is_ai);
        return ret;
    }
    /**
     * Removes a conditional format
     * @param {string} sheet_id
     * @param {string} conditional_format_id
     * @param {string | null} [cursor]
     */
    removeConditionalFormat(sheet_id, conditional_format_id, cursor) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(conditional_format_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        wasm.gridcontroller_removeConditionalFormat(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
    }
    /**
     * Sets cells numeric_format to normal
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    removeNumericFormat(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_removeNumericFormat(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Removes a validation
     * @param {string} sheet_id
     * @param {string} validation_id
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    removeValidation(sheet_id, validation_id, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(validation_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        wasm.gridcontroller_removeValidation(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
    }
    /**
     * @param {string} sheet_id
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    removeValidationSelection(sheet_id, selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_removeValidationSelection(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * Removes all validations in a sheet
     * @param {string} sheet_id
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    removeValidations(sheet_id, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        wasm.gridcontroller_removeValidations(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
    }
    /**
     * Reruns all code cells in grid.
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    rerunAllCodeCells(cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        var ptr0 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_rerunAllCodeCells(this.__wbg_ptr, ptr0, len0, is_ai);
        return ret;
    }
    /**
     * Reruns one code cell
     * @param {string} sheet_id
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    rerunCodeCell(sheet_id, selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_rerunCodeCell(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * Reruns all code cells in a sheet.
     * @param {string} sheet_id
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    rerunSheetCodeCells(sheet_id, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_rerunSheetCodeCells(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {number} size
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    resizeAllColumns(sheet_id, size, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_resizeAllColumns(this.__wbg_ptr, ptr0, len0, size, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {number} size
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    resizeAllRows(sheet_id, size, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_resizeAllRows(this.__wbg_ptr, ptr0, len0, size, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {string} columns
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    resizeColumns(sheet_id, columns, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(columns, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_resizeColumns(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} rows
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @param {boolean} client_resized
     * @returns {any}
     */
    resizeRows(sheet_id, rows, cursor, is_ai, client_resized) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(rows, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        _assertBoolean(client_resized);
        const ret = wasm.gridcontroller_resizeRows(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai, client_resized);
        return ret;
    }
    /**
     * @param {string} query
     * @param {any} options
     * @returns {any}
     */
    search(query, options) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(query, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_search(this.__wbg_ptr, ptr0, len0, options);
        return ret;
    }
    /**
     * Returns true if a selection intersects with any data table, but allows
     * the anchor cell (top-left) of a code cell (not an import)
     * @param {string} sheet_id
     * @param {string} selection
     * @returns {any}
     */
    selectionIntersectsDataTable(sheet_id, selection) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_selectionIntersectsDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Sets cell align formatting given as an optional [`CellAlign`].
     * @param {string} selection
     * @param {any} align
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setAlign(selection, align, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setAlign(this.__wbg_ptr, ptr0, len0, align, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell bold formatting given as an optional [`bool`].
     * @param {string} selection
     * @param {boolean | null | undefined} bold
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setBold(selection, bold, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(bold)) {
            _assertBoolean(bold);
        }
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setBold(this.__wbg_ptr, ptr0, len0, isLikeNone(bold) ? 0xFFFFFF : bold ? 1 : 0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets border style for the selection within a rectangle.
     * @param {string} selection
     * @param {string} border_selection
     * @param {string | null | undefined} style
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setBorders(selection, border_selection, style, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(border_selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(style) ? 0 : passStringToWasm0(style, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setBorders(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, is_ai);
        return ret;
    }
    /**
     * Sets the code on a cell
     * @param {string} sheet_id
     * @param {string} pos
     * @param {any} language
     * @param {string} code_string
     * @param {string | null | undefined} code_cell_name
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {string | undefined}
     */
    setCellCode(sheet_id, pos, language, code_string, code_cell_name, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(code_string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(code_cell_name) ? 0 : passStringToWasm0(code_cell_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        var ptr4 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len4 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setCellCode(this.__wbg_ptr, ptr0, len0, ptr1, len1, language, ptr2, len2, ptr3, len3, ptr4, len4, is_ai);
        let v6;
        if (ret[0] !== 0) {
            v6 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v6;
    }
    /**
     * changes the decimal places
     * @param {string} selection
     * @param {number} delta
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setCellNumericDecimals(selection, delta, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(delta);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setCellNumericDecimals(this.__wbg_ptr, ptr0, len0, delta, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets a cell to a RichText value with the given spans (as JSON).
     * @param {string} sheet_id
     * @param {number} x
     * @param {number} y
     * @param {string} spans_json
     * @param {string | null} [cursor]
     */
    setCellRichText(sheet_id, x, y, spans_json, cursor) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(x);
        _assertNum(y);
        const ptr1 = passStringToWasm0(spans_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_setCellRichText(this.__wbg_ptr, ptr0, len0, x, y, ptr1, len1, ptr2, len2);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets a cell value given as a [`CellValue`].
     *
     * Returns a [`TransactionSummary`].
     * @param {string} sheet_id
     * @param {number} x
     * @param {number} y
     * @param {string} value
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setCellValue(sheet_id, x, y, value, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(x);
        _assertNum(y);
        const ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setCellValue(this.__wbg_ptr, ptr0, len0, x, y, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets a 2d array of cell values with x and y being the top left corner of the 2d array.
     *
     * Returns a [`TransactionSummary`].
     * @param {string} sheet_id
     * @param {number} x
     * @param {number} y
     * @param {any} values
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setCellValues(sheet_id, x, y, values, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(x);
        _assertNum(y);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setCellValues(this.__wbg_ptr, ptr0, len0, x, y, values, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell render size (used for Html-style cells).
     * @param {string} sheet_pos
     * @param {number} columns
     * @param {number} rows
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setChartSize(sheet_pos, columns, rows, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(columns);
        _assertNum(rows);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setChartSize(this.__wbg_ptr, ptr0, len0, columns, rows, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Sets cells numeric_commas
     * @param {string} selection
     * @param {boolean | null | undefined} commas
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setCommas(selection, commas, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(commas)) {
            _assertBoolean(commas);
        }
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setCommas(this.__wbg_ptr, ptr0, len0, isLikeNone(commas) ? 0xFFFFFF : commas ? 1 : 0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cells numeric_format to currency
     * @param {string} selection
     * @param {string} symbol
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setCurrency(selection, symbol, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(symbol, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setCurrency(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} selection
     * @param {string | null | undefined} date_time
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setDateTimeFormat(selection, date_time, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(date_time) ? 0 : passStringToWasm0(date_time, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setDateTimeFormat(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cells numeric_format to scientific notation
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setExponential(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setExponential(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell fill color given as an optional [`String`].
     * @param {string} selection
     * @param {string | null | undefined} fill_color
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setFillColor(selection, fill_color, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(fill_color) ? 0 : passStringToWasm0(fill_color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setFillColor(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell font size given as an [`i16`].
     * @param {string} selection
     * @param {number} font_size
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setFontSize(selection, font_size, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(font_size);
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setFontSize(this.__wbg_ptr, ptr0, len0, font_size, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {string} selection
     * @param {string} formats
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setFormats(sheet_id, selection, formats, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(formats, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setFormats(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, is_ai);
        return ret;
    }
    /**
     * Sets multiple format entries in a single transaction.
     * Each entry in the array contains a selection string and format properties.
     * @param {string} formats_json
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setFormatsA1(formats_json, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(formats_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setFormatsA1(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} selection
     * @param {string} code_string
     * @param {string | null} [cursor]
     * @returns {any}
     */
    setFormula(sheet_id, selection, code_string, cursor) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(code_string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_setFormula(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
        return ret;
    }
    /**
     * Sets multiple formulas in a single transaction (batched)
     * @param {string} sheet_id
     * @param {any} formulas
     * @param {string | null} [cursor]
     * @returns {any}
     */
    setFormulas(sheet_id, formulas, cursor) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_setFormulas(this.__wbg_ptr, ptr0, len0, formulas, ptr1, len1);
        return ret;
    }
    /**
     * Sets cell italic formatting given as an optional [`bool`].
     * @param {string} selection
     * @param {boolean | null | undefined} italic
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setItalic(selection, italic, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(italic)) {
            _assertBoolean(italic);
        }
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setItalic(this.__wbg_ptr, ptr0, len0, isLikeNone(italic) ? 0xFFFFFF : italic ? 1 : 0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Used to set the sequence_num for multiplayer. This should only be called when receiving the sequence_num
     * directly from the file. Use receiveSequenceNum for all other cases.
     * @param {number} sequence_num
     */
    setMultiplayerSequenceNum(sequence_num) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(sequence_num);
        wasm.gridcontroller_setMultiplayerSequenceNum(this.__wbg_ptr, sequence_num);
    }
    /**
     * Sets cells numeric_format to percentage
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setPercentage(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setPercentage(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} sheet_id
     * @param {string | null | undefined} color
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setSheetColor(sheet_id, color, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(color) ? 0 : passStringToWasm0(color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setSheetColor(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {string} name
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setSheetName(sheet_id, name, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setSheetName(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        return ret;
    }
    /**
     * @param {any} sheet_names_to_color
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    setSheetsColor(sheet_names_to_color, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        var ptr0 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setSheetsColor(this.__wbg_ptr, sheet_names_to_color, ptr0, len0, is_ai);
        return ret;
    }
    /**
     * Sets cell bold formatting given as an optional [`bool`].
     * @param {string} selection
     * @param {boolean | null | undefined} strike_through
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setStrikeThrough(selection, strike_through, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(strike_through)) {
            _assertBoolean(strike_through);
        }
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setStrikeThrough(this.__wbg_ptr, ptr0, len0, isLikeNone(strike_through) ? 0xFFFFFF : strike_through ? 1 : 0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell text color given as an optional [`String`].
     * @param {string} selection
     * @param {string | null | undefined} text_color
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setTextColor(selection, text_color, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(text_color) ? 0 : passStringToWasm0(text_color, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setTextColor(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell bold formatting given as an optional [`bool`].
     * @param {string} selection
     * @param {boolean | null | undefined} underline
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setUnderline(selection, underline, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        if (!isLikeNone(underline)) {
            _assertBoolean(underline);
        }
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setUnderline(this.__wbg_ptr, ptr0, len0, isLikeNone(underline) ? 0xFFFFFF : underline ? 1 : 0, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell vertical align formatting given as an optional [`CellVerticalAlign`].
     * @param {string} selection
     * @param {any} vertical_align
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setVerticalAlign(selection, vertical_align, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setVerticalAlign(this.__wbg_ptr, ptr0, len0, vertical_align, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Sets cell wrap formatting given as an optional [`CellWrap`].
     * @param {string} selection
     * @param {any} wrap
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    setWrap(selection, wrap, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_setWrap(this.__wbg_ptr, ptr0, len0, wrap, ptr1, len1, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * Returns the ID of the sheet at the given index.
     * @param {string} id
     * @returns {number | undefined}
     */
    sheetIdToIndex(id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_sheetIdToIndex(this.__wbg_ptr, ptr0, len0);
        return ret === 0x100000001 ? undefined : ret;
    }
    /**
     * Sort a Data Table
     * @param {string} sheet_id
     * @param {string} pos
     * @param {string | null | undefined} sort_js
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     */
    sortDataTable(sheet_id, pos, sort_js, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        var ptr2 = isLikeNone(sort_js) ? 0 : passStringToWasm0(sort_js, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len2 = WASM_VECTOR_LEN;
        var ptr3 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len3 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_sortDataTable(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3, is_ai);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} selection
     * @param {bigint} max_decimals
     * @returns {any}
     */
    summarizeSelection(selection, max_decimals) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(max_decimals);
        const ret = wasm.gridcontroller_summarizeSelection(this.__wbg_ptr, ptr0, len0, max_decimals);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Undoes count transactions.
     * @param {number} count
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    undo(count, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(count);
        var ptr0 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_undo(this.__wbg_ptr, count, ptr0, len0, is_ai);
        return ret;
    }
    /**
     * Unmerges cells for the selection within a rectangle.
     * @param {string} selection
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    unmergeCells(selection, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_unmergeCells(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Creates or updates a conditional format
     * @param {string} conditional_format
     * @param {string | null} [cursor]
     * @returns {any}
     */
    updateConditionalFormat(conditional_format, cursor) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(conditional_format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_updateConditionalFormat(this.__wbg_ptr, ptr0, len0, ptr1, len1);
        return ret;
    }
    /**
     * Creates or updates a validation and applies it to a selection
     * @param {string} validation
     * @param {string | null | undefined} cursor
     * @param {boolean} is_ai
     * @returns {any}
     */
    updateValidation(validation, cursor, is_ai) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(validation, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(cursor) ? 0 : passStringToWasm0(cursor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertBoolean(is_ai);
        const ret = wasm.gridcontroller_updateValidation(this.__wbg_ptr, ptr0, len0, ptr1, len1, is_ai);
        return ret;
    }
    /**
     * Validates user input against any validation rules.
     * @param {string} sheet_id
     * @param {string} pos
     * @param {string} value
     * @returns {any}
     */
    validateInput(sheet_id, pos, value) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(pos, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        const ret = wasm.gridcontroller_validateInput(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
}
if (Symbol.dispose) GridController.prototype[Symbol.dispose] = GridController.prototype.free;

export class JsA1Context {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsA1Context.prototype);
        obj.__wbg_ptr = ptr;
        JsA1ContextFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsA1ContextFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsa1context_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} context
     */
    constructor(context) {
        const ptr0 = passArray8ToWasm0(context, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsa1context_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        JsA1ContextFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {JsA1Context}
     */
    static newEmpty() {
        const ret = wasm.jsa1context_newEmpty();
        return JsA1Context.__wrap(ret);
    }
}
if (Symbol.dispose) JsA1Context.prototype[Symbol.dispose] = JsA1Context.prototype.free;

export class JsCoordinate {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsCoordinate.prototype);
        obj.__wbg_ptr = ptr;
        JsCoordinateFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsCoordinateFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jscoordinate_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get x() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_jscoordinate_x(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get y() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_jscoordinate_y(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set x(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(arg0);
        wasm.__wbg_set_jscoordinate_x(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set y(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(arg0);
        wasm.__wbg_set_jscoordinate_y(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) JsCoordinate.prototype[Symbol.dispose] = JsCoordinate.prototype.free;

export class JsMergeCells {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsMergeCells.prototype);
        obj.__wbg_ptr = ptr;
        JsMergeCellsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsMergeCellsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsmergecells_free(ptr, 0);
    }
    /**
     * @param {Uint8Array} merge_cells
     * @returns {JsMergeCells}
     */
    static createFromBytes(merge_cells) {
        const ptr0 = passArray8ToWasm0(merge_cells, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsmergecells_createFromBytes(ptr0, len0);
        return JsMergeCells.__wrap(ret);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {Rect | undefined}
     */
    getMergeCellRect(x, y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        const ret = wasm.jsmergecells_getMergeCellRect(this.__wbg_ptr, x, y);
        return ret === 0 ? undefined : Rect.__wrap(ret);
    }
    /**
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @returns {Rect[]}
     */
    getMergeCells(x0, y0, x1, y1) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x0);
        _assertNum(y0);
        _assertNum(x1);
        _assertNum(y1);
        const ret = wasm.jsmergecells_getMergeCells(this.__wbg_ptr, x0, y0, x1, y1);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} x
     * @param {number} y
     * @returns {boolean}
     */
    isMergeCells(x, y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        const ret = wasm.jsmergecells_isMergeCells(this.__wbg_ptr, x, y);
        return ret !== 0;
    }
    constructor() {
        const ret = wasm.jsmergecells_new();
        this.__wbg_ptr = ret >>> 0;
        JsMergeCellsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}
if (Symbol.dispose) JsMergeCells.prototype[Symbol.dispose] = JsMergeCells.prototype.free;

export class JsSelection {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(JsSelection.prototype);
        obj.__wbg_ptr = ptr;
        JsSelectionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsSelectionFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsselection_free(ptr, 0);
    }
    /**
     * @returns {boolean}
     */
    canInsertColumnRow() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_canInsertColumnRow(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {string} sheet_id
     * @param {JsA1Context} context
     */
    checkForTableRef(sheet_id, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_checkForTableRef(this.__wbg_ptr, ptr0, len0, context.__wbg_ptr);
    }
    /**
     * @returns {JsSelection}
     */
    clone() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_clone(this.__wbg_ptr);
        return JsSelection.__wrap(ret);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    contains(x, y, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_contains(this.__wbg_ptr, x, y, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @param {JsMergeCells} merge_cells
     * @returns {boolean}
     */
    containsMergedCells(context, merge_cells) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(merge_cells, JsMergeCells);
        if (merge_cells.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_containsMergedCells(this.__wbg_ptr, context.__wbg_ptr, merge_cells.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    cursorIsOnHtmlImage(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_cursorIsOnHtmlImage(this.__wbg_ptr, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @param {JsA1Context} context
     */
    excludeCells(x0, y0, x1, y1, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x0);
        _assertNum(y0);
        _assertNum(x1);
        _assertNum(y1);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_excludeCells(this.__wbg_ptr, x0, y0, x1, y1, context.__wbg_ptr);
    }
    /**
     * @returns {JsCoordinate}
     */
    getBottomRightCell() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getBottomRightCell(this.__wbg_ptr);
        return JsCoordinate.__wrap(ret);
    }
    /**
     * @param {JsA1Context} context
     * @returns {Uint32Array}
     */
    getColumnsWithSelectedCells(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getColumnsWithSelectedCells(this.__wbg_ptr, context.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array | undefined}
     */
    getContiguousColumns() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getContiguousColumns(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * @returns {Uint32Array | undefined}
     */
    getContiguousRows() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getContiguousRows(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        }
        return v1;
    }
    /**
     * Returns the cursor position (as a JsCoordinate)
     * @returns {JsCoordinate}
     */
    getCursor() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getCursor(this.__wbg_ptr);
        return JsCoordinate.__wrap(ret);
    }
    /**
     * @param {JsA1Context} context
     * @param {JsMergeCells} merge_cells
     * @returns {any}
     */
    getFiniteRefRangeBounds(context, merge_cells) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(merge_cells, JsMergeCells);
        if (merge_cells.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getFiniteRefRangeBounds(this.__wbg_ptr, context.__wbg_ptr, merge_cells.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns the first cell position of the first range in the selection.
     * This is different from the cursor position, which may be elsewhere.
     * For table column selections, this returns the first data cell of that column.
     * @param {JsA1Context} context
     * @returns {JsCoordinate | undefined}
     */
    getFirstRangeStart(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getFirstRangeStart(this.__wbg_ptr, context.__wbg_ptr);
        return ret === 0 ? undefined : JsCoordinate.__wrap(ret);
    }
    /**
     * @returns {any}
     */
    getInfiniteRefRangeBounds() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getInfiniteRefRangeBounds(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {JsA1Context} context
     * @returns {Rect}
     */
    getLargestRectangle(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getLargestRectangle(this.__wbg_ptr, context.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Rect.__wrap(ret[0]);
    }
    /**
     * @param {JsA1Context} context
     * @returns {Rect}
     */
    getLargestUnboundedRectangle(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getLargestUnboundedRectangle(this.__wbg_ptr, context.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return Rect.__wrap(ret[0]);
    }
    /**
     * @returns {string}
     */
    getRanges() {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.jsselection_getRanges(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {JsA1Context} context
     * @returns {Uint32Array}
     */
    getRowsWithSelectedCells(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getRowsWithSelectedCells(this.__wbg_ptr, context.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} from
     * @param {number} to
     * @param {JsA1Context} context
     * @returns {Uint32Array}
     */
    getSelectedColumnRanges(from, to, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(from);
        _assertNum(to);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getSelectedColumnRanges(this.__wbg_ptr, from, to, context.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    getSelectedColumns() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getSelectedColumns(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} from
     * @param {number} to
     * @param {JsA1Context} context
     * @returns {Uint32Array}
     */
    getSelectedRowRanges(from, to, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(from);
        _assertNum(to);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getSelectedRowRanges(this.__wbg_ptr, from, to, context.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @returns {Uint32Array}
     */
    getSelectedRows() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getSelectedRows(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsA1Context} context
     * @returns {number}
     */
    getSelectedTableColumnsCount(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getSelectedTableColumnsCount(this.__wbg_ptr, context.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {string} sheet_id
     * @param {SheetDataTablesCache} data_table_cache
     * @param {JsA1Context} context
     * @returns {any}
     */
    getSelectedTableNames(sheet_id, data_table_cache, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(data_table_cache, SheetDataTablesCache);
        if (data_table_cache.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getSelectedTableNames(this.__wbg_ptr, ptr0, len0, data_table_cache.__wbg_ptr, context.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {string}
     */
    getSheetId() {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.jsselection_getSheetId(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @param {JsA1Context} context
     * @returns {string}
     */
    getSheetName(context) {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            _assertClass(context, JsA1Context);
            if (context.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            const ret = wasm.jsselection_getSheetName(this.__wbg_ptr, context.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * @returns {any}
     */
    getSheetRefRangeBounds() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getSheetRefRangeBounds(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @returns {string | undefined}
     */
    getSingleFullTableSelectionName() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getSingleFullTableSelectionName(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {JsA1Context} context
     * @returns {Rect | undefined}
     */
    getSingleRectangle(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getSingleRectangle(this.__wbg_ptr, context.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : Rect.__wrap(ret[0]);
    }
    /**
     * @param {JsA1Context} context
     * @returns {Rect | undefined}
     */
    getSingleRectangleOrCursor(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getSingleRectangleOrCursor(this.__wbg_ptr, context.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] === 0 ? undefined : Rect.__wrap(ret[0]);
    }
    /**
     * @param {string} table_name
     * @param {JsA1Context} context
     * @returns {any}
     */
    getTableColumnSelection(table_name, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getTableColumnSelection(this.__wbg_ptr, ptr0, len0, context.__wbg_ptr);
        return ret;
    }
    /**
     * @param {string} sheet_id
     * @param {number} col
     * @param {number} row
     * @param {JsA1Context} context
     * @returns {string | undefined}
     */
    getTableNameFromPos(sheet_id, col, row, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(col);
        _assertNum(row);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_getTableNameFromPos(this.__wbg_ptr, ptr0, len0, col, row, context.__wbg_ptr);
        let v2;
        if (ret[0] !== 0) {
            v2 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v2;
    }
    /**
     * @returns {string[]}
     */
    getTablesWithColumnSelection() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_getTablesWithColumnSelection(this.__wbg_ptr);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {boolean} one_cell
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    hasOneColumnRowSelection(one_cell, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertBoolean(one_cell);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_hasOneColumnRowSelection(this.__wbg_ptr, one_cell, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    is1dRange(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_is1dRange(this.__wbg_ptr, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    isAllSelected() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_isAllSelected(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @returns {boolean}
     */
    isColumnRow() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_isColumnRow(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} column
     * @returns {boolean}
     */
    isEntireColumnSelected(column) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(column);
        const ret = wasm.jsselection_isEntireColumnSelected(this.__wbg_ptr, column);
        return ret !== 0;
    }
    /**
     * @param {number} row
     * @returns {boolean}
     */
    isEntireRowSelected(row) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(row);
        const ret = wasm.jsselection_isEntireRowSelected(this.__wbg_ptr, row);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    isMultiCursor(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_isMultiCursor(this.__wbg_ptr, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    isSelectedColumnsFinite(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_isSelectedColumnsFinite(this.__wbg_ptr, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    isSelectedRowsFinite(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_isSelectedRowsFinite(this.__wbg_ptr, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    isSingleSelection(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_isSingleSelection(this.__wbg_ptr, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {string} table_name
     * @param {number} column
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    isTableColumnSelected(table_name, column, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertNum(column);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_isTableColumnSelected(this.__wbg_ptr, ptr0, len0, column, context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {number} col
     * @param {number} row
     * @param {Direction} direction
     * @param {JsA1Context} context
     * @param {JsMergeCells} merge_cells
     */
    keyboardJumpSelectTo(col, row, direction, context, merge_cells) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(col);
        _assertNum(row);
        _assertNum(direction);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(merge_cells, JsMergeCells);
        if (merge_cells.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_keyboardJumpSelectTo(this.__wbg_ptr, col, row, direction, context.__wbg_ptr, merge_cells.__wbg_ptr);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {JsA1Context} context
     * @param {JsMergeCells} merge_cells
     */
    keyboardSelectTo(x, y, context, merge_cells) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(merge_cells, JsMergeCells);
        if (merge_cells.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_keyboardSelectTo(this.__wbg_ptr, x, y, context.__wbg_ptr, merge_cells.__wbg_ptr);
    }
    /**
     * Loads the selection from a JSON string.
     * @param {string} selection
     */
    load(selection) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.jsselection_load(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {boolean} append
     * @param {JsMergeCells} merge_cells
     */
    moveTo(x, y, append, merge_cells) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        _assertBoolean(append);
        _assertClass(merge_cells, JsMergeCells);
        if (merge_cells.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_moveTo(this.__wbg_ptr, x, y, append, merge_cells.__wbg_ptr);
    }
    /**
     * @param {string} sheet_id
     */
    constructor(sheet_id) {
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsselection_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        JsSelectionFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {boolean}
     */
    outOfRange() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_outOfRange(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * @param {string} selection
     * @param {JsA1Context} context
     * @returns {boolean}
     */
    overlapsA1Selection(selection, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_overlapsA1Selection(this.__wbg_ptr, ptr0, len0, context.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] !== 0;
    }
    /**
     * Saves the selection to a JSON string.
     * @returns {string}
     */
    save() {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.jsselection_save(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * Selects the entire sheet.
     * @param {boolean} append
     */
    selectAll(append) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertBoolean(append);
        wasm.jsselection_selectAll(this.__wbg_ptr, append);
    }
    /**
     * @param {number} column
     * @param {boolean} ctrl_key
     * @param {boolean} shift_key
     * @param {boolean} is_right_click
     * @param {number} top
     * @param {JsA1Context} context
     */
    selectColumn(column, ctrl_key, shift_key, is_right_click, top, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(column);
        _assertBoolean(ctrl_key);
        _assertBoolean(shift_key);
        _assertBoolean(is_right_click);
        _assertNum(top);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_selectColumn(this.__wbg_ptr, column, ctrl_key, shift_key, is_right_click, top, context.__wbg_ptr);
    }
    /**
     * @param {number} left
     * @param {number} top
     * @param {number} right
     * @param {number} bottom
     * @param {boolean} append
     */
    selectRect(left, top, right, bottom, append) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(left);
        _assertNum(top);
        _assertNum(right);
        _assertNum(bottom);
        _assertBoolean(append);
        wasm.jsselection_selectRect(this.__wbg_ptr, left, top, right, bottom, append);
    }
    /**
     * @param {number} row
     * @param {boolean} ctrl_key
     * @param {boolean} shift_key
     * @param {boolean} is_right_click
     * @param {number} left
     * @param {JsA1Context} context
     */
    selectRow(row, ctrl_key, shift_key, is_right_click, left, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(row);
        _assertBoolean(ctrl_key);
        _assertBoolean(shift_key);
        _assertBoolean(is_right_click);
        _assertNum(left);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_selectRow(this.__wbg_ptr, row, ctrl_key, shift_key, is_right_click, left, context.__wbg_ptr);
    }
    /**
     * @param {string} sheet_id
     */
    selectSheet(sheet_id) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.jsselection_selectSheet(this.__wbg_ptr, ptr0, len0);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    /**
     * @param {string} table_name
     * @param {string | null | undefined} col
     * @param {number} screen_col_left
     * @param {boolean} shift_key
     * @param {boolean} ctrl_key
     * @param {JsA1Context} context
     */
    selectTable(table_name, col, screen_col_left, shift_key, ctrl_key, context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(col) ? 0 : passStringToWasm0(col, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        _assertNum(screen_col_left);
        _assertBoolean(shift_key);
        _assertBoolean(ctrl_key);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_selectTable(this.__wbg_ptr, ptr0, len0, ptr1, len1, screen_col_left, shift_key, ctrl_key, context.__wbg_ptr);
    }
    /**
     * @param {number} x
     * @param {number} y
     * @param {boolean} append
     * @param {JsA1Context} context
     * @param {JsMergeCells} merge_cells
     */
    selectTo(x, y, append, context, merge_cells) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        _assertBoolean(append);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(merge_cells, JsMergeCells);
        if (merge_cells.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_selectTo(this.__wbg_ptr, x, y, append, context.__wbg_ptr, merge_cells.__wbg_ptr);
    }
    /**
     * Get A1Selection as a JsValue.
     * @returns {any}
     */
    selection() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.jsselection_selection(this.__wbg_ptr);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }
    /**
     * @param {JsA1Context} context
     * @returns {JsCoordinate}
     */
    selectionEnd(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.jsselection_selectionEnd(this.__wbg_ptr, context.__wbg_ptr);
        return JsCoordinate.__wrap(ret);
    }
    /**
     * @param {string} sheet_id
     * @param {string} selection
     * @param {JsA1Context} context
     * @returns {string}
     */
    selectionToSheetRect(sheet_id, selection, context) {
        let deferred4_0;
        let deferred4_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            _assertClass(context, JsA1Context);
            if (context.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            const ret = wasm.jsselection_selectionToSheetRect(this.__wbg_ptr, ptr0, len0, ptr1, len1, context.__wbg_ptr);
            var ptr3 = ret[0];
            var len3 = ret[1];
            if (ret[3]) {
                ptr3 = 0; len3 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred4_0 = ptr3;
            deferred4_1 = len3;
            return getStringFromWasm0(ptr3, len3);
        } finally {
            wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
        }
    }
    /**
     * @param {JsA1Context} context
     */
    setColumnsSelected(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_setColumnsSelected(this.__wbg_ptr, context.__wbg_ptr);
    }
    /**
     * @param {JsA1Context} context
     */
    setRowsSelected(context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        wasm.jsselection_setRowsSelected(this.__wbg_ptr, context.__wbg_ptr);
    }
    /**
     * @param {string | null | undefined} default_sheet_id
     * @param {JsA1Context} context
     * @returns {string}
     */
    toA1String(default_sheet_id, context) {
        let deferred3_0;
        let deferred3_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            var ptr0 = isLikeNone(default_sheet_id) ? 0 : passStringToWasm0(default_sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            _assertClass(context, JsA1Context);
            if (context.__wbg_ptr === 0) {
                throw new Error('Attempt to use a moved value');
            }
            const ret = wasm.jsselection_toA1String(this.__wbg_ptr, ptr0, len0, context.__wbg_ptr);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0; len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }
    /**
     * @returns {string}
     */
    toCursorA1() {
        let deferred2_0;
        let deferred2_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.jsselection_toCursorA1(this.__wbg_ptr);
            var ptr1 = ret[0];
            var len1 = ret[1];
            if (ret[3]) {
                ptr1 = 0; len1 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred2_0 = ptr1;
            deferred2_1 = len1;
            return getStringFromWasm0(ptr1, len1);
        } finally {
            wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
        }
    }
    /**
     * @param {string} table_name
     * @param {string} old_name
     * @param {string} new_name
     */
    updateColumnName(table_name, old_name, new_name) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(old_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ptr2 = passStringToWasm0(new_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len2 = WASM_VECTOR_LEN;
        wasm.jsselection_updateColumnName(this.__wbg_ptr, ptr0, len0, ptr1, len1, ptr2, len2);
    }
    /**
     * @param {string} old_name
     * @param {string} new_name
     */
    updateTableName(old_name, new_name) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ptr0 = passStringToWasm0(old_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(new_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.jsselection_updateTableName(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
}
if (Symbol.dispose) JsSelection.prototype[Symbol.dispose] = JsSelection.prototype.free;

/**
 * Data structure that tracks column widths or row heights in pixel units,
 * optimized for converting between column/row indices and pixel units.
 */
export class Offsets {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        OffsetsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_offsets_free(ptr, 0);
    }
}
if (Symbol.dispose) Offsets.prototype[Symbol.dispose] = Offsets.prototype.free;

export class Placement {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Placement.prototype);
        obj.__wbg_ptr = ptr;
        PlacementFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PlacementFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_placement_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get index() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_placement_index(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get position() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_placement_position(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get size() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_placement_size(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set index(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(arg0);
        wasm.__wbg_set_placement_index(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set position(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.__wbg_set_placement_position(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set size(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.__wbg_set_placement_size(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Placement.prototype[Symbol.dispose] = Placement.prototype.free;

/**
 * Cell position {x, y}.
 */
export class Pos {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Pos.prototype);
        obj.__wbg_ptr = ptr;
        PosFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PosFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pos_free(ptr, 0);
    }
    /**
     * Column
     * @returns {bigint}
     */
    get x() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_pos_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * Row
     * @returns {bigint}
     */
    get y() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_pos_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * Column
     * @param {bigint} arg0
     */
    set x(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertBigInt(arg0);
        wasm.__wbg_set_pos_x(this.__wbg_ptr, arg0);
    }
    /**
     * Row
     * @param {bigint} arg0
     */
    set y(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertBigInt(arg0);
        wasm.__wbg_set_pos_y(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) Pos.prototype[Symbol.dispose] = Pos.prototype.free;

/**
 * Rectangular region of cells.
 */
export class Rect {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Rect.prototype);
        obj.__wbg_ptr = ptr;
        RectFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RectFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_rect_free(ptr, 0);
    }
    /**
     * Lower-right corner.
     * @returns {Pos}
     */
    get max() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_rect_max(this.__wbg_ptr);
        return Pos.__wrap(ret);
    }
    /**
     * Upper-left corner.
     * @returns {Pos}
     */
    get min() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_rect_min(this.__wbg_ptr);
        return Pos.__wrap(ret);
    }
    /**
     * Lower-right corner.
     * @param {Pos} arg0
     */
    set max(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(arg0, Pos);
        if (arg0.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_rect_max(this.__wbg_ptr, ptr0);
    }
    /**
     * Upper-left corner.
     * @param {Pos} arg0
     */
    set min(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(arg0, Pos);
        if (arg0.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_rect_min(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) Rect.prototype[Symbol.dispose] = Rect.prototype.free;

export class RefRangeBounds {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RefRangeBoundsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_refrangebounds_free(ptr, 0);
    }
    /**
     * @returns {CellRefRangeEnd}
     */
    get end() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_refrangebounds_end(this.__wbg_ptr);
        return CellRefRangeEnd.__wrap(ret);
    }
    /**
     * @returns {CellRefRangeEnd}
     */
    get start() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_refrangebounds_start(this.__wbg_ptr);
        return CellRefRangeEnd.__wrap(ret);
    }
    /**
     * @param {CellRefRangeEnd} arg0
     */
    set end(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(arg0, CellRefRangeEnd);
        if (arg0.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_refrangebounds_end(this.__wbg_ptr, ptr0);
    }
    /**
     * @param {CellRefRangeEnd} arg0
     */
    set start(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(arg0, CellRefRangeEnd);
        if (arg0.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_refrangebounds_start(this.__wbg_ptr, ptr0);
    }
}
if (Symbol.dispose) RefRangeBounds.prototype[Symbol.dispose] = RefRangeBounds.prototype.free;

export class ScreenRect {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(ScreenRect.prototype);
        obj.__wbg_ptr = ptr;
        ScreenRectFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ScreenRectFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_screenrect_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get h() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_screenrect_h(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get w() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_screenrect_w(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get x() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_screenrect_x(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get y() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.__wbg_get_screenrect_y(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set h(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.__wbg_set_screenrect_h(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set w(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.__wbg_set_screenrect_w(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set x(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.__wbg_set_screenrect_x(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} arg0
     */
    set y(arg0) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.__wbg_set_screenrect_y(this.__wbg_ptr, arg0);
    }
}
if (Symbol.dispose) ScreenRect.prototype[Symbol.dispose] = ScreenRect.prototype.free;

export class SheetContentCache {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SheetContentCache.prototype);
        obj.__wbg_ptr = ptr;
        SheetContentCacheFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SheetContentCacheFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sheetcontentcache_free(ptr, 0);
    }
    /**
     * @param {number} col
     * @param {number} row
     * @returns {boolean}
     */
    hasContent(col, row) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(col);
        _assertNum(row);
        const ret = wasm.sheetcontentcache_hasContent(this.__wbg_ptr, col, row);
        return ret !== 0;
    }
    /**
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @returns {boolean}
     */
    hasContentInRect(x0, y0, x1, y1) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x0);
        _assertNum(y0);
        _assertNum(x1);
        _assertNum(y1);
        const ret = wasm.sheetcontentcache_hasContentInRect(this.__wbg_ptr, x0, y0, x1, y1);
        return ret !== 0;
    }
    /**
     * @param {Uint8Array} bytes
     */
    constructor(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sheetcontentcache_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        SheetContentCacheFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Creates an empty version of the cache.
     * @returns {SheetContentCache}
     */
    static new_empty() {
        const ret = wasm.sheetcontentcache_new_empty();
        return SheetContentCache.__wrap(ret);
    }
}
if (Symbol.dispose) SheetContentCache.prototype[Symbol.dispose] = SheetContentCache.prototype.free;

export class SheetDataTablesCache {
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SheetDataTablesCache.prototype);
        obj.__wbg_ptr = ptr;
        SheetDataTablesCacheFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SheetDataTablesCacheFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sheetdatatablescache_free(ptr, 0);
    }
    /**
     * Returns what table is the table Pos at the given position.
     * @param {number} x
     * @param {number} y
     * @returns {Pos | undefined}
     */
    getTableInPos(x, y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        _assertNum(y);
        const ret = wasm.sheetdatatablescache_getTableInPos(this.__wbg_ptr, x, y);
        return ret === 0 ? undefined : Pos.__wrap(ret);
    }
    /**
     * Returns all tables in the given rectangle.
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @returns {Pos[]}
     */
    getTablesInRect(x0, y0, x1, y1) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x0);
        _assertNum(y0);
        _assertNum(x1);
        _assertNum(y1);
        const ret = wasm.sheetdatatablescache_getTablesInRect(this.__wbg_ptr, x0, y0, x1, y1);
        var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {JsSelection} js_selection
     * @param {JsA1Context} a1_context
     * @returns {boolean}
     */
    hasCodeCellInSelection(js_selection, a1_context) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertClass(js_selection, JsSelection);
        if (js_selection.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        _assertClass(a1_context, JsA1Context);
        if (a1_context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.sheetdatatablescache_hasCodeCellInSelection(this.__wbg_ptr, js_selection.__wbg_ptr, a1_context.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Returns whether the rect has any type of table
     * @param {number} x0
     * @param {number} y0
     * @param {number} x1
     * @param {number} y1
     * @returns {boolean}
     */
    hasTableInRect(x0, y0, x1, y1) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x0);
        _assertNum(y0);
        _assertNum(x1);
        _assertNum(y1);
        const ret = wasm.sheetdatatablescache_hasTableInRect(this.__wbg_ptr, x0, y0, x1, y1);
        return ret !== 0;
    }
    /**
     * @param {Uint8Array} bytes
     */
    constructor(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sheetdatatablescache_new(ptr0, len0);
        this.__wbg_ptr = ret >>> 0;
        SheetDataTablesCacheFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {SheetDataTablesCache}
     */
    static new_empty() {
        const ret = wasm.sheetdatatablescache_new_empty();
        return SheetDataTablesCache.__wrap(ret);
    }
}
if (Symbol.dispose) SheetDataTablesCache.prototype[Symbol.dispose] = SheetDataTablesCache.prototype.free;

export class SheetId {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SheetIdFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sheetid_free(ptr, 0);
    }
}
if (Symbol.dispose) SheetId.prototype[Symbol.dispose] = SheetId.prototype.free;

export class SheetOffsets {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SheetOffsets.prototype);
        obj.__wbg_ptr = ptr;
        SheetOffsetsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SheetOffsetsFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sheetoffsets_free(ptr, 0);
    }
    /**
     * Cancels a resize operation.
     */
    cancelResize() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        wasm.sheetoffsets_cancelResize(this.__wbg_ptr);
    }
    /**
     * Returns a rectangle with the screen coordinates for a cell
     * @param {number} column
     * @param {number} row
     * @returns {ScreenRect}
     */
    getCellOffsets(column, row) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(column);
        _assertNum(row);
        const ret = wasm.sheetoffsets_getCellOffsets(this.__wbg_ptr, column, row);
        return ScreenRect.__wrap(ret);
    }
    /**
     * @param {number} x
     * @returns {number}
     */
    getColumnFromScreen(x) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.sheetoffsets_getColumnFromScreen(this.__wbg_ptr, x);
        return ret;
    }
    /**
     * gets the screen coordinate and size for a row. Returns a [`Placement`]
     * @param {number} column
     * @returns {Placement}
     */
    getColumnPlacement(column) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(column);
        const ret = wasm.sheetoffsets_getColumnPlacement(this.__wbg_ptr, column);
        return Placement.__wrap(ret);
    }
    /**
     * gets the column and row based on the pixels' coordinates. Returns a (column, row) index
     * @param {number} x
     * @param {number} y
     * @returns {string}
     */
    getColumnRowFromScreen(x, y) {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            const ret = wasm.sheetoffsets_getColumnRowFromScreen(this.__wbg_ptr, x, y);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * gets the column width. Returns a f32
     * @param {number} x
     * @returns {number}
     */
    getColumnWidth(x) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        const ret = wasm.sheetoffsets_getColumnWidth(this.__wbg_ptr, x);
        return ret;
    }
    /**
     * @param {number} column
     * @param {number} row
     * @param {number} width
     * @param {number} height
     * @returns {string}
     */
    getRectCellOffsets(column, row, width, height) {
        let deferred1_0;
        let deferred1_1;
        try {
            if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
            _assertNum(this.__wbg_ptr);
            _assertNum(column);
            _assertNum(row);
            _assertNum(width);
            _assertNum(height);
            const ret = wasm.sheetoffsets_getRectCellOffsets(this.__wbg_ptr, column, row, width, height);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Returns and removes the transient resize for the current offset.
     * Use this on the local SheetOffsets to get the resize to apply to the Grid's SheetOffsets.
     *
     * Returns a [`TransientResize` || undefined]
     * @returns {string | undefined}
     */
    getResizeToApply() {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.sheetoffsets_getResizeToApply(this.__wbg_ptr);
        let v1;
        if (ret[0] !== 0) {
            v1 = getStringFromWasm0(ret[0], ret[1]).slice();
            wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        }
        return v1;
    }
    /**
     * @param {number} y
     * @returns {number}
     */
    getRowFromScreen(y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.sheetoffsets_getRowFromScreen(this.__wbg_ptr, y);
        return ret;
    }
    /**
     * gets the row height from a row index
     * @param {number} y
     * @returns {number}
     */
    getRowHeight(y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(y);
        const ret = wasm.sheetoffsets_getRowHeight(this.__wbg_ptr, y);
        return ret;
    }
    /**
     * gets the screen coordinate and size for a pixel y-coordinate. Returns a [`Placement`]
     * @param {number} row
     * @returns {Placement}
     */
    getRowPlacement(row) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(row);
        const ret = wasm.sheetoffsets_getRowPlacement(this.__wbg_ptr, row);
        return Placement.__wrap(ret);
    }
    /**
     * gets the screen coordinate and size for a pixel x-coordinate. Returns a [`Placement`]
     * @param {number} x
     * @returns {Placement}
     */
    getXPlacement(x) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.sheetoffsets_getXPlacement(this.__wbg_ptr, x);
        return Placement.__wrap(ret);
    }
    /**
     * gets the screen coordinate and size for a pixel y-coordinate. Returns a [`Placement`]
     * @param {number} y
     * @returns {Placement}
     */
    getYPlacement(y) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        const ret = wasm.sheetoffsets_getYPlacement(this.__wbg_ptr, y);
        return Placement.__wrap(ret);
    }
    /**
     * Resizes a column transiently; the operation must be committed using
     * `commitResize()` or canceled using `cancelResize()`. If `size` is `null`
     * then the column width is reset.
     * @param {number} column
     * @param {number | null} [size]
     */
    resizeColumnTransiently(column, size) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(column);
        if (!isLikeNone(size)) {
            _assertNum(size);
        }
        wasm.sheetoffsets_resizeColumnTransiently(this.__wbg_ptr, column, !isLikeNone(size), isLikeNone(size) ? 0 : size);
    }
    /**
     * Resizes a row transiently; the operation must be committed using
     * `commitResize()` or canceled using `cancelResize()`. If `size` is `null`
     * then the row height is reset.
     * @param {number} row
     * @param {number | null} [size]
     */
    resizeRowTransiently(row, size) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(row);
        if (!isLikeNone(size)) {
            _assertNum(size);
        }
        wasm.sheetoffsets_resizeRowTransiently(this.__wbg_ptr, row, !isLikeNone(size), isLikeNone(size) ? 0 : size);
    }
    /**
     * Sets the column width. Returns the old width.
     * @param {number} x
     * @param {number} width
     * @returns {number}
     */
    setColumnWidth(x, width) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(x);
        const ret = wasm.sheetoffsets_setColumnWidth(this.__wbg_ptr, x, width);
        return ret;
    }
    /**
     * Resets the row height. Returns the old height.
     * @param {number} y
     * @param {number} height
     * @returns {number}
     */
    setRowHeight(y, height) {
        if (this.__wbg_ptr == 0) throw new Error('Attempt to use a moved value');
        _assertNum(this.__wbg_ptr);
        _assertNum(y);
        const ret = wasm.sheetoffsets_setRowHeight(this.__wbg_ptr, y, height);
        return ret;
    }
}
if (Symbol.dispose) SheetOffsets.prototype[Symbol.dispose] = SheetOffsets.prototype.free;

export class SheetOffsetsWasm {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SheetOffsetsWasmFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_sheetoffsetswasm_free(ptr, 0);
    }
    /**
     * @returns {SheetOffsets}
     */
    static empty() {
        const ret = wasm.sheetoffsetswasm_empty();
        return SheetOffsets.__wrap(ret);
    }
    /**
     * @param {string} data
     * @returns {SheetOffsets}
     */
    static load(data) {
        const ptr0 = passStringToWasm0(data, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.sheetoffsetswasm_load(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return SheetOffsets.__wrap(ret[0]);
    }
}
if (Symbol.dispose) SheetOffsetsWasm.prototype[Symbol.dispose] = SheetOffsetsWasm.prototype.free;

export class ViewportBuffer {
    constructor() {
        throw new Error('cannot invoke `new` directly');
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ViewportBufferFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_viewportbuffer_free(ptr, 0);
    }
}
if (Symbol.dispose) ViewportBuffer.prototype[Symbol.dispose] = ViewportBuffer.prototype.free;

/**
 * Applies a date format to a date from CellValue.to_edit()
 * Note: this will likely change, but for now we hardcode the formats
 *    CellValue::Date(d) => d.format("%m/%d/%Y").to_string(),
 *    CellValue::Time(t) => t.format("%-I:%M %p").to_string(),
 *    CellValue::DateTime(t) => t.format("%m/%d/%Y %-I:%M %p").to_string(),
 * @param {string} date
 * @param {string} format
 * @returns {string | undefined}
 */
export function applyFormatToDateTime(date, format) {
    const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.applyFormatToDateTime(ptr0, len0, ptr1, len1);
    let v3;
    if (ret[0] !== 0) {
        v3 = getStringFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v3;
}

/**
 * @param {string} cell_ref_range
 * @param {boolean} show_table_headers_for_python
 * @param {JsA1Context} context
 * @returns {any}
 */
export function cellRefRangeToRefRangeBounds(cell_ref_range, show_table_headers_for_python, context) {
    const ptr0 = passStringToWasm0(cell_ref_range, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertBoolean(show_table_headers_for_python);
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.cellRefRangeToRefRangeBounds(ptr0, len0, show_table_headers_for_python, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} formula_string
 * @param {JsA1Context} context
 * @param {string} sheet_id
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
export function checkFormula(formula_string, context, sheet_id, x, y) {
    const ptr0 = passStringToWasm0(formula_string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ptr1 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertNum(x);
    _assertNum(y);
    const ret = wasm.checkFormula(ptr0, len0, context.__wbg_ptr, ptr1, len1, x, y);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {string} column
 * @returns {bigint | undefined}
 */
export function columnNameToIndex(column) {
    const ptr0 = passStringToWasm0(column, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.columnNameToIndex(ptr0, len0);
    return ret[0] === 0 ? undefined : ret[1];
}

/**
 * Converts a ConditionalFormatRule to a formula string.
 * Takes a JSON-serialized ConditionalFormatRule and an anchor cell reference (e.g., "A1", "B2").
 * Returns the formula string (e.g., "ISBLANK(B2)", "B2>5").
 * @param {string} rule_json
 * @param {string} anchor
 * @returns {string}
 */
export function conditionalFormatRuleToFormula(rule_json, anchor) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(rule_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(anchor, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.conditionalFormatRuleToFormula(ptr0, len0, ptr1, len1);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * Converts a table reference to an A1 range.
 * @param {string} table_name
 * @param {string} current_sheet_id
 * @param {JsA1Context} context
 * @returns {string}
 */
export function convertTableToRange(table_name, current_sheet_id, context) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(current_sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.convertTableToRange(ptr0, len0, ptr1, len1, context.__wbg_ptr);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * Converts a table reference to a position.
 * @param {string} table_name
 * @param {JsA1Context} context
 * @returns {any}
 */
export function convertTableToSheetPos(table_name, context) {
    const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.convertTableToSheetPos(ptr0, len0, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Converts a date-time string to an i64 for use in date_time validations.
 * Expects the date-time to be in the format of %Y-%m-%d %H:%M:%S.
 * @param {string} date
 * @returns {bigint}
 */
export function dateTimeToNumber(date) {
    const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.dateTimeToNumber(ptr0, len0);
    return ret;
}

/**
 * Returns a formatted version of the date string. The date is expected to
 * be in the format of %Y-%m-%d.
 * @param {string} date
 * @param {string | null} [format]
 * @returns {string}
 */
export function formatDate(date, format) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(format) ? 0 : passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.formatDate(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Returns a formatted version of the date string. The date is expected to
 * be in the format of %Y-%m-%d %H:%M:%S.
 * @param {string} date
 * @param {string | null} [format]
 * @returns {string}
 */
export function formatDateTime(date, format) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(format) ? 0 : passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.formatDateTime(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Returns a formatted version of the time string. The date is expected to be
 * in the format DEFAULT_DATE_TIME_FORMAT.
 * @param {string} date
 * @param {string | null} [format]
 * @returns {string}
 */
export function formatTime(date, format) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        var ptr1 = isLikeNone(format) ? 0 : passStringToWasm0(format, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        const ret = wasm.formatTime(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {JsA1Context} context
 * @returns {any}
 */
export function getTableInfo(context) {
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.getTableInfo(context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

export function hello() {
    wasm.hello();
}

/**
 * Returns the SheetPos after a jump (ctrl/cmd + arrow key)
 * @param {string} sheet_id
 * @param {number} col
 * @param {number} row
 * @param {Direction} direction
 * @param {SheetContentCache} content_cache
 * @param {SheetDataTablesCache} table_cache
 * @param {JsA1Context} context
 * @param {JsMergeCells} merge_cells
 * @returns {Pos}
 */
export function jumpCursor(sheet_id, col, row, direction, content_cache, table_cache, context, merge_cells) {
    const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertNum(col);
    _assertNum(row);
    _assertNum(direction);
    _assertClass(content_cache, SheetContentCache);
    if (content_cache.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    _assertClass(table_cache, SheetDataTablesCache);
    if (table_cache.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    _assertClass(merge_cells, JsMergeCells);
    if (merge_cells.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.jumpCursor(ptr0, len0, col, row, direction, content_cache.__wbg_ptr, table_cache.__wbg_ptr, context.__wbg_ptr, merge_cells.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return Pos.__wrap(ret[0]);
}

/**
 * Returns the SheetPos after a move (arrow key)
 * @param {string} sheet_id
 * @param {number} col
 * @param {number} row
 * @param {Direction} direction
 * @param {SheetDataTablesCache} table_cache
 * @param {JsA1Context} context
 * @param {JsMergeCells} merge_cells
 * @returns {Pos}
 */
export function moveCursor(sheet_id, col, row, direction, table_cache, context, merge_cells) {
    const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertNum(col);
    _assertNum(row);
    _assertNum(direction);
    _assertClass(table_cache, SheetDataTablesCache);
    if (table_cache.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    _assertClass(merge_cells, JsMergeCells);
    if (merge_cells.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.moveCursor(ptr0, len0, col, row, direction, table_cache.__wbg_ptr, context.__wbg_ptr, merge_cells.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return Pos.__wrap(ret[0]);
}

/**
 * @param {string} sheet_id
 * @returns {string}
 */
export function newAllSelection(sheet_id) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.newAllSelection(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} sheet_id
 * @param {bigint} x0
 * @param {bigint} y0
 * @param {bigint} x1
 * @param {bigint} y1
 * @returns {string}
 */
export function newRectSelection(sheet_id, x0, y0, x1, y1) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertBigInt(x0);
        _assertBigInt(y0);
        _assertBigInt(x1);
        _assertBigInt(y1);
        const ret = wasm.newRectSelection(ptr0, len0, x0, y0, x1, y1);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {string} sheet_id
 * @param {number} x
 * @param {number} y
 * @returns {JsSelection}
 */
export function newSingleSelection(sheet_id, x, y) {
    const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertNum(x);
    _assertNum(y);
    const ret = wasm.newSingleSelection(ptr0, len0, x, y);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return JsSelection.__wrap(ret[0]);
}

/**
 * Converts a number to a date string to the default date format.
 * @param {bigint} number
 * @returns {string | undefined}
 */
export function numberToDate(number) {
    _assertBigInt(number);
    const ret = wasm.numberToDate(number);
    let v1;
    if (ret[0] !== 0) {
        v1 = getStringFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v1;
}

/**
 * Converts a number to a time string to the default time format.
 * @param {number} number
 * @returns {string | undefined}
 */
export function numberToTime(number) {
    _assertNum(number);
    const ret = wasm.numberToTime(number);
    let v1;
    if (ret[0] !== 0) {
        v1 = getStringFromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v1;
}

/**
 * @param {string} formula_string
 * @param {JsA1Context} context
 * @param {string} sheet_id
 * @param {number} x
 * @param {number} y
 * @returns {any}
 */
export function parseFormula(formula_string, context, sheet_id, x, y) {
    const ptr0 = passStringToWasm0(formula_string, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ptr1 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertNum(x);
    _assertNum(y);
    const ret = wasm.parseFormula(ptr0, len0, context.__wbg_ptr, ptr1, len1, x, y);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * Returns a date string in the format of %Y-%m-%d %H:%M:%S. Returns an empty
 * string if unable to parse the date or time string.
 * @param {string} date
 * @param {string} time
 * @returns {string}
 */
export function parseTime(date, time) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(time, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        const ret = wasm.parseTime(ptr0, len0, ptr1, len1);
        deferred3_0 = ret[0];
        deferred3_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * @param {any} _text_model
 * @param {any} _position
 * @param {any} _context
 * @param {any} _token
 * @returns {any}
 */
export function provideCompletionItems(_text_model, _position, _context, _token) {
    const ret = wasm.provideCompletionItems(_text_model, _position, _context, _token);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} text_model
 * @param {any} position
 * @param {any} _token
 * @returns {any}
 */
export function provideHover(text_model, position, _token) {
    const ret = wasm.provideHover(text_model, position, _token);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {any} rect
 * @returns {string}
 */
export function rectToA1(rect) {
    let deferred2_0;
    let deferred2_1;
    try {
        const ret = wasm.rectToA1(rect);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {Uint8Array} binary_ops
 * @returns {JsSelection | undefined}
 */
export function scheduledTaskDecode(binary_ops) {
    const ptr0 = passArray8ToWasm0(binary_ops, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.scheduledTaskDecode(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] === 0 ? undefined : JsSelection.__wrap(ret[0]);
}

/**
 * Computes the code for a selection. If sheet_id and selection are not
 * provided, then all code cells in the file are computed.
 * @param {JsSelection | null} [selection]
 * @returns {any}
 */
export function scheduledTaskEncode(selection) {
    let ptr0 = 0;
    if (!isLikeNone(selection)) {
        _assertClass(selection, JsSelection);
        if (selection.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        ptr0 = selection.__destroy_into_raw();
    }
    const ret = wasm.scheduledTaskEncode(ptr0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} sheet_id
 * @param {string} selection
 * @param {JsA1Context} context
 * @returns {any}
 */
export function selectionToSheetRect(sheet_id, selection, context) {
    const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.selectionToSheetRect(ptr0, len0, ptr1, len1, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * @param {string} sheet_id
 * @param {string} selection
 * @param {JsA1Context} context
 * @returns {string}
 */
export function selectionToSheetRectString(sheet_id, selection, context) {
    let deferred4_0;
    let deferred4_1;
    try {
        const ptr0 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passStringToWasm0(selection, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        _assertClass(context, JsA1Context);
        if (context.__wbg_ptr === 0) {
            throw new Error('Attempt to use a moved value');
        }
        const ret = wasm.selectionToSheetRectString(ptr0, len0, ptr1, len1, context.__wbg_ptr);
        var ptr3 = ret[0];
        var len3 = ret[1];
        if (ret[3]) {
            ptr3 = 0; len3 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred4_0 = ptr3;
        deferred4_1 = len3;
        return getStringFromWasm0(ptr3, len3);
    } finally {
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
 * @param {string} a1
 * @param {string} default_sheet_id
 * @param {JsA1Context} context
 * @returns {JsSelection}
 */
export function stringToSelection(a1, default_sheet_id, context) {
    const ptr0 = passStringToWasm0(a1, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(default_sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.stringToSelection(ptr0, len0, ptr1, len1, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return JsSelection.__wrap(ret[0]);
}

/**
 * Converts a time to an i32 for use in time validations. Expects the time to
 * be in the format of %H:%M:%S.
 * @param {string} time
 * @returns {number}
 */
export function timeToNumber(time) {
    const ptr0 = passStringToWasm0(time, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.timeToNumber(ptr0, len0);
    return ret;
}

/**
 * @param {string} reference
 * @returns {string}
 */
export function toggleReferenceTypes(reference) {
    let deferred3_0;
    let deferred3_1;
    try {
        const ptr0 = passStringToWasm0(reference, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.toggleReferenceTypes(ptr0, len0);
        var ptr2 = ret[0];
        var len2 = ret[1];
        if (ret[3]) {
            ptr2 = 0; len2 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred3_0 = ptr2;
        deferred3_1 = len2;
        return getStringFromWasm0(ptr2, len2);
    } finally {
        wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
}

/**
 * Attempts to convert a user's input to an i64 for use in date_time validation.
 * @param {string} date
 * @returns {bigint | undefined}
 */
export function userDateToNumber(date) {
    const ptr0 = passStringToWasm0(date, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.userDateToNumber(ptr0, len0);
    return ret[0] === 0 ? undefined : ret[1];
}

/**
 * Attempts to convert a user's input to an i32 for use in time validation.
 * @param {string} time
 * @returns {number | undefined}
 */
export function userTimeToNumber(time) {
    const ptr0 = passStringToWasm0(time, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.userTimeToNumber(ptr0, len0);
    return ret === 0x100000001 ? undefined : ret;
}

/**
 * @param {string} table_name
 * @param {number} index
 * @param {string} column_name
 * @param {JsA1Context} context
 * @returns {boolean}
 */
export function validateColumnName(table_name, index, column_name, context) {
    const ptr0 = passStringToWasm0(table_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    _assertNum(index);
    const ptr1 = passStringToWasm0(column_name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.validateColumnName(ptr0, len0, index, ptr1, len1, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {string} name
 * @param {string} sheet_id
 * @param {JsA1Context} context
 * @returns {boolean}
 */
export function validateSheetName(name, sheet_id, context) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.validateSheetName(ptr0, len0, ptr1, len1, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {string} name
 * @param {string} sheet_id
 * @param {number} x
 * @param {number} y
 * @param {JsA1Context} context
 * @returns {boolean}
 */
export function validateTableName(name, sheet_id, x, y, context) {
    const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(sheet_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    _assertNum(x);
    _assertNum(y);
    _assertClass(context, JsA1Context);
    if (context.__wbg_ptr === 0) {
        throw new Error('Attempt to use a moved value');
    }
    const ret = wasm.validateTableName(ptr0, len0, ptr1, len1, x, y, context.__wbg_ptr);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return ret[0] !== 0;
}

/**
 * @param {number} x
 * @param {number} y
 * @returns {string}
 */
export function xyToA1(x, y) {
    let deferred2_0;
    let deferred2_1;
    try {
        _assertNum(x);
        _assertNum(y);
        const ret = wasm.xyToA1(x, y);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

/**
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @returns {string}
 */
export function xyxyToA1(x0, y0, x1, y1) {
    let deferred2_0;
    let deferred2_1;
    try {
        _assertNum(x0);
        _assertNum(y0);
        _assertNum(x1);
        _assertNum(y1);
        const ret = wasm.xyxyToA1(x0, y0, x1, y1);
        var ptr1 = ret[0];
        var len1 = ret[1];
        if (ret[3]) {
            ptr1 = 0; len1 = 0;
            throw takeFromExternrefTable0(ret[2]);
        }
        deferred2_0 = ptr1;
        deferred2_1 = len1;
        return getStringFromWasm0(ptr1, len1);
    } finally {
        wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
    }
}

//#endregion

//#region wasm imports
import * as import1 from "../web-workers/quadraticCore/worker/rustCallbacks.ts"
import * as import2 from "../web-workers/quadraticCore/worker/rustCallbacks.ts"
import * as import3 from "../web-workers/quadraticCore/worker/rustCallbacks.ts"
import * as import4 from "../web-workers/quadraticCore/worker/rustCallbacks.ts"

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_8c4e43fe74559d73: function() { return logError(function (arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return ret;
        }, arguments); },
        __wbg_Number_04624de7d0e8332d: function() { return logError(function (arg0) {
            const ret = Number(arg0);
            return ret;
        }, arguments); },
        __wbg_String_8f0eb39a4a4c2f66: function() { return logError(function (arg0, arg1) {
            const ret = String(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg___wbindgen_bigint_get_as_i64_8fcf4ce7f1ca72a2: function(arg0, arg1) {
            const v = arg1;
            const ret = typeof(v) === 'bigint' ? v : undefined;
            if (!isLikeNone(ret)) {
                _assertBigInt(ret);
            }
            getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_boolean_get_bbbb1c18aa2f5e25: function(arg0) {
            const v = arg0;
            const ret = typeof(v) === 'boolean' ? v : undefined;
            if (!isLikeNone(ret)) {
                _assertBoolean(ret);
            }
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_0bc8482c6e3508ae: function(arg0, arg1) {
            const ret = debugString(arg1);
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_47fa6863be6f2f25: function(arg0, arg1) {
            const ret = arg0 in arg1;
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_is_bigint_31b12575b56f32fc: function(arg0) {
            const ret = typeof(arg0) === 'bigint';
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_is_function_0095a73b8b156f76: function(arg0) {
            const ret = typeof(arg0) === 'function';
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_is_object_5ae8e5880f2c1fbd: function(arg0) {
            const val = arg0;
            const ret = typeof(val) === 'object' && val !== null;
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_is_string_cd444516edc5b180: function(arg0) {
            const ret = typeof(arg0) === 'string';
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_is_undefined_9e4d92534c42d778: function(arg0) {
            const ret = arg0 === undefined;
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_jsval_eq_11888390b0186270: function(arg0, arg1) {
            const ret = arg0 === arg1;
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_9dd77d8cd6671811: function(arg0, arg1) {
            const ret = arg0 == arg1;
            _assertBoolean(ret);
            return ret;
        },
        __wbg___wbindgen_number_get_8ff4255516ccad3e: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'number' ? obj : undefined;
            if (!isLikeNone(ret)) {
                _assertNum(ret);
            }
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_72fb696202c56729: function(arg0, arg1) {
            const obj = arg1;
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_be289d5034ed271b: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg_addUnsentTransaction_bb5a28c3717ec3de: function() { return logError(function (arg0, arg1, arg2, arg3, arg4) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg2;
                deferred1_1 = arg3;
                addUnsentTransaction(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), arg4 >>> 0);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            }
        }, arguments); },
        __wbg_bind_29ba380591735d8c: function() { return logError(function (arg0, arg1, arg2) {
            const ret = arg0.bind(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_call_389efe28435a9388: function() { return handleError(function (arg0, arg1) {
            const ret = arg0.call(arg1);
            return ret;
        }, arguments); },
        __wbg_done_57b39ecd9addfe81: function() { return logError(function (arg0) {
            const ret = arg0.done;
            _assertBoolean(ret);
            return ret;
        }, arguments); },
        __wbg_entries_58c7934c745daac7: function() { return logError(function (arg0) {
            const ret = Object.entries(arg0);
            return ret;
        }, arguments); },
        __wbg_error_7534b8e9a36f1ab4: function() { return logError(function (arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                console.error(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_from_bddd64e7d5ff6941: function() { return logError(function (arg0) {
            const ret = Array.from(arg0);
            return ret;
        }, arguments); },
        __wbg_getRandomValues_1c61fac11405ffdc: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getRandomValues_2a91986308c74a93: function() { return handleError(function (arg0, arg1) {
            globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_getTime_1e3cd1391c5c3995: function() { return logError(function (arg0) {
            const ret = arg0.getTime();
            return ret;
        }, arguments); },
        __wbg_getTimezoneOffset_81776d10a4ec18a8: function() { return logError(function (arg0) {
            const ret = arg0.getTimezoneOffset();
            return ret;
        }, arguments); },
        __wbg_get_9b94d73e6221f75c: function() { return logError(function (arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            return ret;
        }, arguments); },
        __wbg_get_b3ed3ad4be2bc8ac: function() { return handleError(function (arg0, arg1) {
            const ret = Reflect.get(arg0, arg1);
            return ret;
        }, arguments); },
        __wbg_get_index_253dd2a9e007656d: function() { return logError(function (arg0, arg1) {
            const ret = arg0[arg1 >>> 0];
            _assertNum(ret);
            return ret;
        }, arguments); },
        __wbg_get_with_ref_key_1dc361bd10053bfe: function() { return logError(function (arg0, arg1) {
            const ret = arg0[arg1];
            return ret;
        }, arguments); },
        __wbg_instanceof_ArrayBuffer_c367199e2fa2aa04: function() { return logError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            _assertBoolean(ret);
            return ret;
        }, arguments); },
        __wbg_instanceof_Map_53af74335dec57f4: function() { return logError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Map;
            } catch (_) {
                result = false;
            }
            const ret = result;
            _assertBoolean(ret);
            return ret;
        }, arguments); },
        __wbg_instanceof_Uint8Array_9b9075935c74707c: function() { return logError(function (arg0) {
            let result;
            try {
                result = arg0 instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            _assertBoolean(ret);
            return ret;
        }, arguments); },
        __wbg_isArray_d314bb98fcf08331: function() { return logError(function (arg0) {
            const ret = Array.isArray(arg0);
            _assertBoolean(ret);
            return ret;
        }, arguments); },
        __wbg_isSafeInteger_bfbc7332a9768d2a: function() { return logError(function (arg0) {
            const ret = Number.isSafeInteger(arg0);
            _assertBoolean(ret);
            return ret;
        }, arguments); },
        __wbg_iterator_6ff6560ca1568e55: function() { return logError(function () {
            const ret = Symbol.iterator;
            return ret;
        }, arguments); },
        __wbg_jsA1Context_3bc79e0bf10e4f06: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsA1Context(v0);
        }, arguments); },
        __wbg_jsAddSheet_810cd38bb6d46ff2: function() { return logError(function (arg0, arg1, arg2) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsAddSheet(v0, arg2 !== 0);
        }, arguments); },
        __wbg_jsBordersSheet_7e300dbb71a3c73a: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsBordersSheet(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsClientMessage_24dceb0819b2b971: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg2;
                deferred1_1 = arg3;
                jsClientMessage(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            }
        }, arguments); },
        __wbg_jsCodeRunningState_215a63cb395133a8: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg2;
                deferred1_1 = arg3;
                jsCodeRunningState(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            }
        }, arguments); },
        __wbg_jsConnection_127952bb07e503eb: function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            let deferred2_0;
            let deferred2_1;
            let deferred3_0;
            let deferred3_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg4;
                deferred1_1 = arg5;
                deferred2_0 = arg6;
                deferred2_1 = arg7;
                deferred3_0 = arg9;
                deferred3_1 = arg10;
                jsConnection(getStringFromWasm0(arg0, arg1), arg2, arg3, getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7), arg8, getStringFromWasm0(arg9, arg10));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
                wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
            }
        }, arguments); },
        __wbg_jsDeleteSheet_0643bf31618123d3: function() { return logError(function (arg0, arg1, arg2) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                jsDeleteSheet(getStringFromWasm0(arg0, arg1), arg2 !== 0);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsHashRenderFills_175b80fcebcac268: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsHashRenderFills(v0);
        }, arguments); },
        __wbg_jsHashesDirtyFills_bc25578d2e32d77a: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsHashesDirtyFills(v0);
        }, arguments); },
        __wbg_jsHashesDirty_5d8ad2035e0ee133: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsHashesDirty(v0);
        }, arguments); },
        __wbg_jsHashesRenderCells_e9a28ee892680106: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsHashesRenderCells(v0);
        }, arguments); },
        __wbg_jsHtmlOutput_0faab61454cdc9d7: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsHtmlOutput(v0);
        }, arguments); },
        __wbg_jsImportProgress_f3aaa9745bb2f8fa: function() { return logError(function (arg0, arg1, arg2, arg3) {
            jsImportProgress(getStringFromWasm0(arg0, arg1), arg2 >>> 0, arg3 >>> 0);
        }, arguments); },
        __wbg_jsMergeCells_d7cadf70de44c7fc: function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                var v2 = getArrayU8FromWasm0(arg4, arg5).slice();
                wasm.__wbindgen_free(arg4, arg5 * 1, 1);
                jsMergeCells(getStringFromWasm0(arg0, arg1), v1, v2);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsOffsetsModified_09ca83917c44374a: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsOffsetsModified(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsRequestRowHeights_27d547bf387ac63f: function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            let deferred2_0;
            let deferred2_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg2;
                deferred1_1 = arg3;
                deferred2_0 = arg4;
                deferred2_1 = arg5;
                jsRequestRowHeights(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            }
        }, arguments); },
        __wbg_jsRequestTransactions_505df30b1e3c7f5e: function() { return logError(function (arg0) {
            jsRequestTransactions(BigInt.asUintN(64, arg0));
        }, arguments); },
        __wbg_jsRunJavascript_fce8c980a634eaee: function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            let deferred2_0;
            let deferred2_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg4;
                deferred1_1 = arg5;
                deferred2_0 = arg6;
                deferred2_1 = arg7;
                const ret = jsRunJavascript(getStringFromWasm0(arg0, arg1), arg2, arg3, getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
                return ret;
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            }
        }, arguments); },
        __wbg_jsRunPython_039c15e06a2373c4: function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            let deferred2_0;
            let deferred2_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg4;
                deferred1_1 = arg5;
                deferred2_0 = arg6;
                deferred2_1 = arg7;
                const ret = jsRunPython(getStringFromWasm0(arg0, arg1), arg2, arg3, getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
                return ret;
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
                wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
            }
        }, arguments); },
        __wbg_jsSendContentCache_fbb4f0836b87f4c8: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSendContentCache(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSendDataTablesCache_024687e000eed7c8: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSendDataTablesCache(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSendImage_ba3338a91f6999ac: function() { return logError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                let v1;
                if (arg6 !== 0) {
                    v1 = getStringFromWasm0(arg6, arg7).slice();
                    wasm.__wbindgen_free(arg6, arg7 * 1, 1);
                }
                jsSendImage(getStringFromWasm0(arg0, arg1), arg2, arg3, arg4, arg5, v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSendTransaction_e1ad308315e4c084: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSendTransaction(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSetCursor_fcc042f6472b0a88: function() { return logError(function (arg0, arg1) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                jsSetCursor(getStringFromWasm0(arg0, arg1));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSheetBoundsUpdate_6b95e82bda5b4de6: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsSheetBoundsUpdate(v0);
        }, arguments); },
        __wbg_jsSheetCodeCells_96bee85bd4793cae: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSheetCodeCells(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSheetConditionalFormats_92ed4bd82fdd4634: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSheetConditionalFormats(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSheetInfoUpdate_906c8bba3627efb2: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsSheetInfoUpdate(v0);
        }, arguments); },
        __wbg_jsSheetInfo_6056da591c7b032f: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsSheetInfo(v0);
        }, arguments); },
        __wbg_jsSheetMetaFills_c25960e4198c0f69: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSheetMetaFills(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsSheetValidations_6fbacd4fea83f3b4: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                var v1 = getArrayU8FromWasm0(arg2, arg3).slice();
                wasm.__wbindgen_free(arg2, arg3 * 1, 1);
                jsSheetValidations(getStringFromWasm0(arg0, arg1), v1);
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
            }
        }, arguments); },
        __wbg_jsTransactionEnd_e86ad0a74bb8121f: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg2;
                deferred1_1 = arg3;
                jsTransactionEnd(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            }
        }, arguments); },
        __wbg_jsTransactionStart_36607fa0d5e85b6b: function() { return logError(function (arg0, arg1, arg2, arg3) {
            let deferred0_0;
            let deferred0_1;
            let deferred1_0;
            let deferred1_1;
            try {
                deferred0_0 = arg0;
                deferred0_1 = arg1;
                deferred1_0 = arg2;
                deferred1_1 = arg3;
                jsTransactionStart(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
            } finally {
                wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
                wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
            }
        }, arguments); },
        __wbg_jsUndoRedo_7305c71ee356e79e: function() { return logError(function (arg0, arg1) {
            jsUndoRedo(arg0 !== 0, arg1 !== 0);
        }, arguments); },
        __wbg_jsUpdateCodeCells_25ea0c77e2e101c6: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsUpdateCodeCells(v0);
        }, arguments); },
        __wbg_jsUpdateHtml_474701ab5da8df7e: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsUpdateHtml(v0);
        }, arguments); },
        __wbg_jsValidationWarnings_1596da14884c242f: function() { return logError(function (arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_free(arg0, arg1 * 1, 1);
            jsValidationWarnings(v0);
        }, arguments); },
        __wbg_length_32ed9a279acd054c: function() { return logError(function (arg0) {
            const ret = arg0.length;
            _assertNum(ret);
            return ret;
        }, arguments); },
        __wbg_length_35a7bace40f36eac: function() { return logError(function (arg0) {
            const ret = arg0.length;
            _assertNum(ret);
            return ret;
        }, arguments); },
        __wbg_log_20491909b1115842: function() { return logError(function (arg0, arg1) {
            console.log(getStringFromWasm0(arg0, arg1));
        }, arguments); },
        __wbg_new_0_73afc35eb544e539: function() { return logError(function () {
            const ret = new Date();
            return ret;
        }, arguments); },
        __wbg_new_245cd5c49157e602: function() { return logError(function (arg0) {
            const ret = new Date(arg0);
            return ret;
        }, arguments); },
        __wbg_new_361308b2356cecd0: function() { return logError(function () {
            const ret = new Object();
            return ret;
        }, arguments); },
        __wbg_new_3eb36ae241fe6f44: function() { return logError(function () {
            const ret = new Array();
            return ret;
        }, arguments); },
        __wbg_new_72c627ba80de1c21: function() { return logError(function (arg0) {
            const ret = new Int32Array(arg0);
            return ret;
        }, arguments); },
        __wbg_new_8a6f238a6ece86ea: function() { return logError(function () {
            const ret = new Error();
            return ret;
        }, arguments); },
        __wbg_new_ca409f861989e0c5: function() { return logError(function (arg0) {
            const ret = new SharedArrayBuffer(arg0 >>> 0);
            return ret;
        }, arguments); },
        __wbg_new_dca287b076112a51: function() { return logError(function () {
            const ret = new Map();
            return ret;
        }, arguments); },
        __wbg_new_dd2b680c8bf6ae29: function() { return logError(function (arg0) {
            const ret = new Uint8Array(arg0);
            return ret;
        }, arguments); },
        __wbg_next_3482f54c49e8af19: function() { return handleError(function (arg0) {
            const ret = arg0.next();
            return ret;
        }, arguments); },
        __wbg_next_418f80d8f5303233: function() { return logError(function (arg0) {
            const ret = arg0.next;
            return ret;
        }, arguments); },
        __wbg_now_a3af9a2f4bbaa4d1: function() { return logError(function () {
            const ret = Date.now();
            return ret;
        }, arguments); },
        __wbg_pos_new: function() { return logError(function (arg0) {
            const ret = Pos.__wrap(arg0);
            return ret;
        }, arguments); },
        __wbg_prototypesetcall_bdcdcc5842e4d77d: function() { return logError(function (arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
        }, arguments); },
        __wbg_rect_new: function() { return logError(function (arg0) {
            const ret = Rect.__wrap(arg0);
            return ret;
        }, arguments); },
        __wbg_set_1eb0999cf5d27fc8: function() { return logError(function (arg0, arg1, arg2) {
            const ret = arg0.set(arg1, arg2);
            return ret;
        }, arguments); },
        __wbg_set_3f1d0b984ed272ed: function() { return logError(function (arg0, arg1, arg2) {
            arg0[arg1] = arg2;
        }, arguments); },
        __wbg_set_f43e577aea94465b: function() { return logError(function (arg0, arg1, arg2) {
            arg0[arg1 >>> 0] = arg2;
        }, arguments); },
        __wbg_slice_8bbd46adb2100583: function() { return logError(function (arg0, arg1, arg2) {
            const ret = arg0.slice(arg1 >>> 0, arg2 >>> 0);
            return ret;
        }, arguments); },
        __wbg_stack_0ed75d68575b0f3c: function() { return logError(function (arg0, arg1) {
            const ret = arg1.stack;
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        }, arguments); },
        __wbg_value_0546255b415e96c1: function() { return logError(function (arg0) {
            const ret = arg0.value;
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000001: function() { return logError(function (arg0) {
            // Cast intrinsic for `F64 -> Externref`.
            const ret = arg0;
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000002: function() { return logError(function (arg0) {
            // Cast intrinsic for `I64 -> Externref`.
            const ret = arg0;
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000003: function() { return logError(function (arg0, arg1) {
            // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
            const ret = getArrayU8FromWasm0(arg0, arg1);
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000004: function() { return logError(function (arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        }, arguments); },
        __wbindgen_cast_0000000000000005: function() { return logError(function (arg0) {
            // Cast intrinsic for `U64 -> Externref`.
            const ret = BigInt.asUintN(64, arg0);
            return ret;
        }, arguments); },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./quadratic_core_bg.js": import0,
        "./snippets/quadratic-core-d2b9da3108908123/../quadratic-client/src/app/web-workers/quadraticCore/worker/rustCallbacks.ts": import1,
        "./snippets/quadratic-core-d2b9da3108908123/../quadratic-client/src/app/web-workers/quadraticCore/worker/rustCallbacks.ts": import2,
        "./snippets/quadratic-core-d2b9da3108908123/../quadratic-client/src/app/web-workers/quadraticCore/worker/rustCallbacks.ts": import3,
        "./snippets/quadratic-core-d2b9da3108908123/../quadratic-client/src/app/web-workers/quadraticCore/worker/rustCallbacks.ts": import4,
    };
}


//#endregion
const CellRefCoordFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cellrefcoord_free(ptr >>> 0, 1));
const CellRefRangeEndFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cellrefrangeend_free(ptr >>> 0, 1));
const EmptyValuesCacheFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_emptyvaluescache_free(ptr >>> 0, 1));
const GridControllerFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_gridcontroller_free(ptr >>> 0, 1));
const JsA1ContextFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsa1context_free(ptr >>> 0, 1));
const JsCoordinateFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jscoordinate_free(ptr >>> 0, 1));
const JsMergeCellsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsmergecells_free(ptr >>> 0, 1));
const JsSelectionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsselection_free(ptr >>> 0, 1));
const OffsetsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_offsets_free(ptr >>> 0, 1));
const PlacementFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_placement_free(ptr >>> 0, 1));
const PosFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pos_free(ptr >>> 0, 1));
const RectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_rect_free(ptr >>> 0, 1));
const RefRangeBoundsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_refrangebounds_free(ptr >>> 0, 1));
const ScreenRectFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_screenrect_free(ptr >>> 0, 1));
const SheetContentCacheFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sheetcontentcache_free(ptr >>> 0, 1));
const SheetDataTablesCacheFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sheetdatatablescache_free(ptr >>> 0, 1));
const SheetIdFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sheetid_free(ptr >>> 0, 1));
const SheetOffsetsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sheetoffsets_free(ptr >>> 0, 1));
const SheetOffsetsWasmFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_sheetoffsetswasm_free(ptr >>> 0, 1));
const ViewportBufferFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_viewportbuffer_free(ptr >>> 0, 1));


//#region intrinsics
function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

function _assertBigInt(n) {
    if (typeof(n) !== 'bigint') throw new Error(`expected a bigint argument, found ${typeof(n)}`);
}

function _assertBoolean(n) {
    if (typeof(n) !== 'boolean') {
        throw new Error(`expected a boolean argument, found ${typeof(n)}`);
    }
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
}

function _assertNum(n) {
    if (typeof(n) !== 'number') throw new Error(`expected a number argument, found ${typeof(n)}`);
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getDataViewMemory0();
    const result = [];
    for (let i = ptr; i < ptr + 4 * len; i += 4) {
        result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
    }
    wasm.__externref_drop_slice(ptr, len);
    return result;
}

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function logError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        let error = (function () {
            try {
                return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
            } catch(_) {
                return "<failed to stringify thrown value>";
            }
        }());
        console.error("wasm-bindgen: imported JS function that was not marked as `catch` threw an error:", error);
        throw e;
    }
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    for (let i = 0; i < array.length; i++) {
        const add = addToExternrefTable0(array[i]);
        getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (typeof(arg) !== 'string') throw new Error(`expected a string argument, found ${typeof(arg)}`);
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);
        if (ret.read !== arg.length) throw new Error('failed to pass whole string');
        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;


//#endregion

//#region wasm loading
let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('quadratic_core_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
//#endregion
export { wasm as __wasm }
