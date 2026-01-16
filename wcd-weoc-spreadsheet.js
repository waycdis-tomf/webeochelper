class WcdSpread {

    constructor() {
        this.univerCoreObject = {
            boardPreferencesArray: [],
            headerArray: [],
            fieldArray: [],
            dataArray: [],
            readOnlyPermission: false,
            readOnlyDropdownPermission: false,
        };
        this.univerDataObject = {
            type: '',
            cellDataId: '',
            cellColumn: '',
            cellRow: '',
            rows: [],
            data: []
        };
        this.initialize();
    }

    /**
     * Create board dropdown data object or.
     * Dropdowns will be created in the 'User_Preferences' board, in the 'UP_Board_Config' table.
     * @constructor
     * @param { string } table - The '<table />' element containing the 'data-wcdspread_type', 'data-wcdspread_field' and 'data-wcdspread_source' attributes.
     */
    createDropdownsDataObjectProcess(table) {
        let dataObjectArray = [];
        table.querySelectorAll('thead tr').forEach((tr) => {
            let dataObject = {
                board: wcd.board
            };
            let objectArray = [];
            tr.querySelectorAll('th:not(.wcdExcludeDropdown)').forEach((th, index) => {
                if (th.getAttribute('data-wcdspread_type') === 'dropdown') {
                    objectArray.push({
                        field: th.getAttribute('data-wcdspread_field'),
                        source: th.getAttribute('data-wcdspread_source')
                    });
                }
                dataObject.dropdowns = JSON.stringify(objectArray);
            });
            dataObjectArray.push(dataObject);
        });
        this.createDropdowns(dataObjectArray);
    }

    /**
     * Create board dropdowns.
     * Dropdowns will be created in the 'User_Preferences' board, in the 'UP_Board_Config' table.
     * @constructor
     * @param { array } array - Array of data object containing 'board', 'field' and 'source'.
     */
    async createDropdowns(array) {
        let dataObjectArray = [];
        array.forEach((item) => {
            dataObjectArray.push({
                up_board_name: item.board,
                up_board_remove: '',
                up_board_dropdowns: item.dropdowns
            });
        });
        wcd.apiCall({
            endpoint: 'board/User_Preferences/input/UP_ZW_Board_Config/batch',
            data: dataObjectArray
        }).then(() => {
            parent.pageBoard.Refresh();
        });
    }

    /**
     * Create board preferences data array.
     * Dropdowns will be created in the 'User_Preferences' board, in the 'UP_Board_Config' table.
     * @constructor
     * @param { string } bps - Board preference content.
     */
    createBoardPreferenceData(bps) {
        bps.split('¤¤').filter(Boolean).forEach((item) => {
            if (item.split('þþ')[1] === wcd.board) {
                let dataObject = {
                    id: item.split('þþ')[0],
                    board: item.split('þþ')[1],
                    source: JSON.parse(item.split('þþ')[2])
                };
                this.univerCoreObject.boardPreferencesArray.push(dataObject);
            }
        });
    }

    /**
     * Get dropdown source.
     * Loop through the 'boardPreferenceArray' and get the dropdown options to be used in the spreadsheet, per dropdown column.
     * @constructor
     * @param { string } th - The <th> that contains data attribute such as 'data-wcdspread_type' and 'data-wcdspread_field'.
     */
    getDropdownSource(th) {
        if (th.getAttribute('data-wcdspread_type') === 'dropdown' && !th.classList.contains('wcdExcludeDropdown')) {
            let bpDataObject = {};
            if (this.univerCoreObject.boardPreferencesArray.length > 0) {
                this.univerCoreObject.boardPreferencesArray.forEach((item) => {
                    item.source.forEach((sourceItem) => {
                        if (sourceItem.field === th.getAttribute('data-wcdspread_field')) {
                            bpDataObject.id = item.id;
                            bpDataObject.source = sourceItem.source;
                        }
                    });
                });
            }
            return Object.keys(bpDataObject).length === 0 ? false : bpDataObject;
        } else {
            return false;
        }
    }

    // Create spreadsheet, data. Assign value to the 'apiView', 'columncount', and 'rowCount' variables. 
    createSpreadsheetData() {
        document.querySelectorAll('.wcdSpread').forEach((table) => {
            /*
            't' identifies the type of columm.
            t: 1 means string
            t: 2 means number
            t: 3 means boolean (value v should be 0 or 1)
            t: 4 means force text 
            */
            if (table.getAttribute('data-wcdspread_boardpermissions') !== 'false') {
                this.univerCoreObject.readOnlyPermission = table.getAttribute('data-wcdspread_boardpermissions').split('þ').includes('Spreadsheet_RO') ? true : false;
                this.univerCoreObject.readOnlyDropdownPermission = table.getAttribute('data-wcdspread_boardpermissions').split('þ').includes('Spreadsheet_Dropdown_RO') ? true : false;
            }
            this.univerCoreObject.apiView = table.getAttribute('data-wcdspread_apiview');
            this.univerCoreObject.columnCount = table.getAttribute('data-wcdspread_columncount') ? parseInt(table.getAttribute('data-wcdspread_columncount')) : 300; // Number of column (increase or decrease number if needed).
            this.univerCoreObject.rowCount = table.getAttribute('data-wcdspread_rowcount') ? parseInt(table.getAttribute('data-wcdspread_rowcount')) + 2 : 300; // Number of rows (increase or decrease number if needed);
            table.querySelectorAll('thead tr').forEach((tr) => {
                this.univerCoreObject.headerArray.push({
                    v: 'Data ID'
                });
                tr.querySelectorAll('th').forEach((th, index) => {
                    const bpDataObject = this.getDropdownSource(th);
                    this.univerCoreObject.fieldArray.push({
                        index: index + 1,
                        field: th.getAttribute('data-wcdspread_field'),
                        source: {
                            id: bpDataObject !== false ? bpDataObject.id : false,
                            dropdown: bpDataObject !== false ? bpDataObject.source : th.getAttribute('data-wcdspread_source')
                        },
                        type: th.getAttribute('data-wcdspread_type') ? th.getAttribute('data-wcdspread_type') : false,
                    });
                    this.univerCoreObject.headerArray.push({
                        v: th.textContent.trim(),
                        t: 2
                    });
                });
            });
            table.querySelectorAll('tbody tr').forEach((tr, index) => {
                let objectArray = [];
                objectArray.push({
                    v: tr.getAttribute('data-wcdspread_dataid'),
                    t: 2
                })
                tr.querySelectorAll('td').forEach((td) => {
                    if (td.getAttribute('data-wcdspread_type') && td.getAttribute('data-wcdspread_type') === 'calendar') {
                        objectArray.push({
                            v: this.convertDateToSerialNumber(td.textContent.trim()),
                            t: 2,
                            s: {
                                n: {
                                    pattern: 'mm/dd/yyyy',
                                },
                            }
                        });
                    } else if (td.getAttribute('data-wcdspread_type') && td.getAttribute('data-wcdspread_type') === 'money') {
                        objectArray.push({
                            v: td.textContent.trim(),
                            t: 2,
                            s: {
                                n: {
                                    pattern: '"$"#,##0.00',
                                },
                            }
                        });
                    } else {
                        objectArray.push({
                            v: td.textContent.trim(),
                        });
                    }
                });
                this.univerCoreObject.dataArray.push(objectArray);
            });
        });
    }

    /**
     * Convert date value to serial number.
     * @constructor
     * @param { string } dateValue - Provided date value, to be converted into serial number.
     */
    convertDateToSerialNumber(dateValue) {
        const date = new Date(dateValue);
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        return Math.floor((utcDate - excelEpoch.getTime()) / (1000 * 60 * 60 * 24));
    }

    /**
     * Conver serial number to date.
     * @constructor
     * @param { number } serialValue - Provided serial number, to be converted into date.
     */
    convertSerialNumberToDate(serialValue) {
        let excelEpoch = new Date(1899, 11, 30);
        let dateValue = new Date(excelEpoch.getTime() + serialValue * 24 * 60 * 60 * 1000);
        return dateValue;
    }

    /**
     * Identify column lettering based on provided column number.
     * @constructor
     * @param { number } num - Provided column number.
     */
    colNumber(num) {
        let result = '';
        const letA = 'A'.charCodeAt(0);
        const letZ = 'Z'.charCodeAt(0);
        const len = letZ - letA + 1;
        while (num >= 0) {
            result = String.fromCharCode(num % len + letA) + result;
            num = Math.floor(num / len) - 1;
        }
        return result;
    }

    // Add lettering to header columns.
    columnLettering() {
        this.univerCoreObject.fieldArray.forEach((item) => {
            for (let i = 0; this.univerCoreObject.columnCount > i; i++) {
                if (i === item.index) {
                    item['column'] = this.colNumber(i);
                    item['rows'] = this.univerCoreObject.rowCount;
                }
            }
        });
    }

    /**
     * Add lettering to header columns.
     * @constructor
     * @param { object } worksheet - Univer sheets component.
     * @param { string } univerAPI - Univer sheets API.
     */
    columnRules(worksheet, univerAPI) {
        this.univerCoreObject.fieldArray.forEach((item) => {
            if (item.type === 'dropdown' && item.source.dropdown !== false) { // rule for 'dropdown' data types.
                const dropdownRange = worksheet.getRange(`${item.column}2:${item.column}${item.rows}`);
                const dropdownRule = univerAPI.newDataValidation().requireValueInList(item.source.dropdown.split('þ')).setOptions({
                    allowBlank: true,
                    showErrorMessage: true,
                    error: 'Please select a valid option from the dropdown list.',
                    errorStyle: univerAPI.Enum.DataValidationErrorStyle.STOP,
                }).build();
                return dropdownRange.setDataValidation(dropdownRule);
            } else if (item.type === 'money') { // rule for 'money' data types.
                const moneyRange = worksheet.getRange(`${item.column}2:${item.column}${item.rows}`);
                const moneyRule = univerAPI.newDataValidation().requireNumberGreaterThan(-3).setOptions({
                    allowBlank: true,
                    showErrorMessage: true,
                    error: 'Please enter a valid number.',
                    errorStyle: univerAPI.Enum.DataValidationErrorStyle.STOP,
                }).build();
                return moneyRange.setDataValidation(moneyRule);
            } else if (item.type === 'calendar') { // rule for 'date' data types.
                const calendarRange = worksheet.getRange(`${item.column}2:${item.column}${item.rows}`);
                const requiredAfterDate = new Date('01/01/1985');
                const calendarRule = univerAPI.newDataValidation().requireDateAfter(requiredAfterDate).setOptions({
                    allowBlank: true,
                    showErrorMessage: true,
                    error: 'Please enter a valid date.',
                    errorStyle: univerAPI.Enum.DataValidationErrorStyle.STOP,
                }).build();
                return calendarRange.setDataValidation(calendarRule);
            }
        });
    }

    // Format value to '"$"#,##0.00'.
    moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    // Format value to 'mm/dd/yyyy'.
    dateFormatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    /**
     * Get values between start and end numbers.
     * @constructor
     * @param { number } num1 - Start number.
     * @param { number } num2 - End number.
     */
    getValuesBetween(num1, num2) {
        const lowNum = Math.min(num1, num2);
        const highNum = Math.max(num1, num2);
        const result = [];
        const start = lowNum + 1;
        const end = highNum - 1;
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    }

    /**
     * Copy/paste rows.
     * Add new rows after the end-user high-lights multiple row(s) and copy/pasta into new row(s).
     * @constructor
     * @param { string } univerAPI - Univer sheets API.
     * @param { object } params - Call back parameters from the 'BeforeClipboardPaste' event.
     */
    async copyPasteRows(univerAPI, params) {
        params.cancel = true; // Cancel event.
        let dataObjectArray = [];
        let pWorksheet = params.worksheet;
        let text = params.text; // Text from clipboard.
        let rawDataArray = [];
        if (text && text.trim().length) {
            let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
            let lines = normalized.split('\n');
            lines.forEach((item) => {
                rawDataArray.push(item.split('\t')); // Cells: [A, B, C, etc].
            });
        }
        pWorksheet.insertRows(this.univerCoreObject.rowCount, rawDataArray.length); // Add more additional blank rows for copy/pasta of existing rows.
        let trimmedDataArray = [];
        rawDataArray.forEach((item) => {
            if (item.length > 1) {
                trimmedDataArray.push(item.slice(1)); // Remove column A (Data ID column).
            }
        });
        for (let i = 0; i < trimmedDataArray.length; i++) {
            let updatedRowCount = this.univerCoreObject.rowCount - 1;
            let rowValuesArray = trimmedDataArray[i];
            let rowRange = pWorksheet.getRange(updatedRowCount + i, 1, 1, rowValuesArray.length);
            let dataObject = {};
            let displayDataArray = [];
            rowValuesArray.forEach((item, index) => {
                let field;
                let newCellValue;
                let displayCellValue;
                let cellValue = item.trim();
                let columnNumber = index + 1;
                this.univerCoreObject.fieldArray.forEach((obj) => {
                    if (parseInt(obj.index) === columnNumber) {
                        field = obj.field;
                        if (obj.type === 'dropdown' || obj.type === false) {
                            newCellValue = cellValue === null || cellValue === '' || cellValue === undefined ? '' : cellValue;
                            displayCellValue = cellValue;
                        } else if (obj.type === 'money') {
                            if (cellValue === null || cellValue === '' || cellValue === undefined) {
                                newCellValue = 0;
                                displayCellValue = 0;
                            } else {
                                const strip$ = cellValue.toString().replace(/\$/g, '');
                                newCellValue = parseInt(strip$.replace(/,/g, ''));
                                displayCellValue = this.moneyFormatter.format(newCellValue);
                            }
                        } else if (obj.type === 'calendar') {
                            if (cellValue === null || cellValue === '' || cellValue === undefined || cellValue === 'NaN') {
                                newCellValue = '';
                                displayCellValue = '';
                            } else {
                                newCellValue = new Date(cellValue);
                                displayCellValue = this.dateFormatter.format(newCellValue);
                            }

                        }
                        dataObject[field] = newCellValue;
                        displayDataArray.push(displayCellValue);
                    }
                });
            });
            rowRange.setValues([displayDataArray]);
            dataObjectArray.push(dataObject);
        }
        const rowsArray = this.getValuesBetween(this.univerCoreObject.rowCount - 1, rawDataArray.length + this.univerCoreObject.rowCount);
        this.univerCoreObject.rowCount = rawDataArray.length + this.univerCoreObject.rowCount;
        const response = await wcd.apiCall({
            endpoint: `board/${wcd.board}/input/${this.univerCoreObject.apiView}/batch`,
            data: dataObjectArray
        });
        response.forEach((responseItem, responseIndex) => {
            rowsArray.forEach((rowsItem, rowsIndex) => {
                if (responseIndex === rowsIndex) {
                    const row = pWorksheet.getRange(`A${rowsItem.toString()}`);
                    row.setValue(responseItem.dataid.toString());
                }
            });
        });
        // Update 'rows' property with updated 'rowCount' value.
        this.univerCoreObject.fieldArray.forEach((item) => {
            item.rows = this.univerCoreObject.rowCount;
        });
        // Reinitialize column rules.
        this.columnRules(pWorksheet, univerAPI);
        this.univerDataObject.type = '';
        this.univerDataObject.cellDataId = '';
        this.univerDataObject.cellColumn = '';
        this.univerDataObject.cellRow = '';




    }

    /**
     * Inline cell edit.
     * @constructor
     * @param { string } action - Action type, new or edit.
     * @param { object } worksheet - Univer sheets component.
     * @param { string } univerAPI - Univer sheets API.
     * @param { object } params - Call back parameters from the 'SheetValueChanged' event.
     */
    async inlineCellAddEdit(worksheet, univerAPI, params) {
        let newCellValue = '';
        let dataObjectArray = [];
        if (this.univerDataObject.type === 'copy/paste/new/individual' || this.univerDataObject.type === 'copy/paste/edit/individual') {
            let field = '';
            const cellValue = params.text;
            const row = this.univerDataObject.cellRow;
            const column = this.univerDataObject.cellColumn;
            const dataid = this.univerDataObject.cellDataId;
            const rowRange = worksheet.getRange(row, column);
            this.univerCoreObject.fieldArray.forEach((obj) => {
                if (parseInt(obj.index) === column) {
                    field = obj.field;
                    if (obj.type === 'dropdown' || obj.type === false) {
                        newCellValue = cellValue === null || cellValue === '' || cellValue === undefined ? '' : cellValue;
                    } else if (obj.type === 'money') {
                        rowRange.setNumberFormat('"$"#,##0.00');
                        if (cellValue === null || cellValue === '' || cellValue === undefined) {
                            newCellValue = 0;
                        } else {
                            const strip$ = cellValue.toString().replace(/\$/g, '');
                            newCellValue = parseInt(strip$.replace(/,/g, ''));
                        }
                    } else if (obj.type === 'calendar') {
                        rowRange.setNumberFormat('mm/dd/yyyy');
                        if (cellValue === null || cellValue === '' || cellValue === undefined) {
                            newCellValue = '';
                        } else {
                            newCellValue = this.convertSerialNumberToDate(cellValue);
                        }
                    }
                }
            });
            let dataObject = {
                [field]: newCellValue
            };
            if (this.univerDataObject.type === 'copy/paste/edit/individual') {
                dataObject.dataid = dataid;
            }
            dataObjectArray.push(dataObject);
            const response = await wcd.apiCall({
                endpoint: `board/${wcd.board}/input/${this.univerCoreObject.apiView}/batch`,
                data: dataObjectArray
            });
            if (this.univerDataObject.type === 'copy/paste/new/individual') {
                worksheet.getRange(row, 0).setValue(response[0].dataid.toString());
                worksheet.insertRows(this.univerCoreObject.rowCount, 1);
                this.univerCoreObject.rowCount = this.univerCoreObject.rowCount + 1;
                // Update 'rows' property with updated 'rowCount' value.
                this.univerCoreObject.fieldArray.forEach((item) => {
                    item.rows = this.univerCoreObject.rowCount;
                });
            }
            // Reinitialize column rules.
            this.columnRules(worksheet, univerAPI);
            this.univerDataObject.type = '';
            this.univerDataObject.cellDataId = '';
            this.univerDataObject.cellColumn = '';
            this.univerDataObject.cellRow = '';
        } else {
            Object.entries(params.payload.params.cellValue).forEach((item) => {
                Object.entries(item[1]).forEach((key) => {
                    let field = '';
                    let cellValue = key[1].v;
                    if (cellValue !== null) {
                        let row = parseInt(item[0]);
                        let column = parseInt(Object.keys(item[1])[0]);
                        let dataid = worksheet.getRange(`A${parseInt(item[0]) + 1}`).getValue();
                        let rowRange = worksheet.getRange(row, column);
                        this.univerCoreObject.fieldArray.forEach((obj) => {
                            if (parseInt(obj.index) === column) {
                                field = obj.field;
                                if (obj.type === 'dropdown' || obj.type === false) {
                                    newCellValue = cellValue === null || cellValue === '' || cellValue === undefined ? '' : cellValue;
                                } else if (obj.type === 'money') {
                                    rowRange.setNumberFormat('"$"#,##0.00');
                                    if (cellValue === null || cellValue === '' || cellValue === undefined) {
                                        newCellValue = 0;
                                    } else {
                                        const strip$ = cellValue.toString().replace(/\$/g, '');
                                        newCellValue = parseInt(strip$.replace(/,/g, ''));
                                    }
                                } else if (obj.type === 'calendar') {
                                    rowRange.setNumberFormat('mm/dd/yyyy');
                                    if (cellValue === null || cellValue === '' || cellValue === undefined) {
                                        newCellValue = '';
                                    } else {
                                        newCellValue = this.convertSerialNumberToDate(cellValue);
                                    }
                                }
                            }
                        });
                        let dataObject = {
                            [field]: newCellValue
                        };
                        if (this.univerDataObject.type === 'edit' || this.univerDataObject.type === 'fill/handle') {
                            dataObject.dataid = dataid;
                        }
                        dataObjectArray.push(dataObject);
                    }
                });
            });
            if (dataObjectArray.length > 0) {
                return await wcd.apiCall({
                    endpoint: `board/${wcd.board}/input/${this.univerCoreObject.apiView}/batch`,
                    data: dataObjectArray
                });
            }
        }
    }

    // Initialize Univer sheets.    
    async initSpreadsheet() {
        const { createUniver } = UniverPresets;
        const { LocaleType, mergeLocales } = UniverCore;
        const { UniverSheetsCorePreset } = UniverPresetSheetsCore;
        const { UniverSheetsDataValidationPreset } = UniverPresetSheetsDataValidation;
        const { univerAPI } = createUniver({
            locale: LocaleType.EN_US,
            locales: {
                [LocaleType.EN_US]: mergeLocales(
                    UniverPresetSheetsCoreEnUS,
                    UniverPresetSheetsDataValidationEnUS
                )
            },
            presets: [
                UniverSheetsCorePreset({
                    container: 'app',
                    toolbar: false,
                    contextMenu: true,
                    formulaBar: false,
                    footer: true,
                }),
                UniverSheetsDataValidationPreset({
                    showEditOnDropdown: this.univerCoreObject.readOnlyDropdownPermission === true ? false : true // If true, end-users will not be able to add/update/delete dropdown options.
                })
            ],
        });
        // Store the Univer instance.
        this.univerCoreObject.univer = univerAPI;
        univerAPI.toggleDarkMode(document.querySelector('body').getAttribute('data-bs-theme') === 'light' ? false : true);
        let workbookDataOptions = {
            id: 'sheet-1-id',
            name: `${wcd.board} Spreadsheet`,
            cellData: this.univerCoreObject.dataArray,
            defaultColumnWidth: 200,
            columnCount: this.univerCoreObject.columnCount,
            rowCount: this.univerCoreObject.rowCount
        };
        const workbookData = {
            id: 'workbook-data',
            sheets: {
                'sheet-1-id': workbookDataOptions,
            },
        };
        // Apply column lettering to 'fieldArray' array.
        this.columnLettering();
        this.univerCoreObject.dataArray.unshift(this.univerCoreObject.headerArray);
        // Create workbook spread sheet.
        univerAPI.createWorkbook(workbookData);
        const workbook = univerAPI.getActiveWorkbook();
        const worksheet = workbook.getActiveSheet();
        const worksheetRange = worksheet.getRange(`${this.univerCoreObject.fieldArray[0].column}1:${this.univerCoreObject.fieldArray.at(-1).column}1`);
        const worksheetPermission = worksheetRange.getRangePermission();
        const workbookpermission = workbook.getPermission();
        const unitId = workbook.getId();
        const subUnitId = worksheet.getSheetId();
        // Set spreadsheet to 'read-only' if 'Spreadsheet_RO' board permission tag is applied.
        if (this.univerCoreObject.readOnlyPermission === true) {
            await workbookpermission.addWorksheetBasePermission(unitId, subUnitId);
            const editPerm = workbookpermission.permissionPointsDefinition.WorksheetEditPermission;
            workbookpermission.setWorksheetPermissionPoint(unitId, subUnitId, editPerm, false);
        }
        // Set range protection permission.
        await worksheetPermission.protect({
            name: 'Default Protected Range',
            allowEdit: true,
            allowViewByOthers: false
        });
        // Restrict 'edit/delete' permissions on first row.
        await worksheetPermission.setPoint(univerAPI.Enum.RangePermissionPoint.Edit, false);
        await worksheetPermission.setPoint(univerAPI.Enum.RangePermissionPoint.Delete, false);
        await worksheetPermission.setPoint(univerAPI.Enum.RangePermissionPoint.View, true);
        // Hide Data ID column.
        worksheet.hideColumns(0, 1);
        // Set left justify for all rows and columns.
        worksheet.setDefaultStyle({
            ht: 1
        });
        // Apply column rules.
        this.columnRules(worksheet, univerAPI);
        univerAPI.onBeforeCommandExecute((event) => {
            if (event.id.includes('move-rows')) { // Disabling 'row moving' action.
                throw new Error('Row moving is disabled.');
            } else if (event.id === 'sheet.command.auto-fill') { // Disabling horizontal auto-fill action.
                if (event.params.sourceRange.startColumn !== event.params.targetRange.endColumn) {
                    throw new Error('Horizontal auto-fill is disabled.');
                } else {
                    this.univerDataObject.type = 'fill/handle'
                }
            } else if (event.id === 'univer.command.cut') { // Disabling 'cut' functionality.
                throw new Error('Cut functionality is disabled.');
            }
        });
        // For dropdown columns that can be modified, look for any dropdown option updates/additions and update record in 'User_Preferences' board.
        univerAPI.addEvent(univerAPI.Event.BeforeSheetDataValidationCriteriaUpdate, async (params) => {
            const dropdownSource = params.newCriteria.formula1.replace(/,/g, 'þ');
            const startColumn = params.rule.rule.ranges[0].startColumn;
            let dataObjectArray = []
            this.univerCoreObject.fieldArray.forEach(async (item) => {
                if (item.index === startColumn) {
                    if (dropdownSource !== item.source.dropdown) {
                        this.univerCoreObject.boardPreferencesArray.forEach((bpItem) => {
                            bpItem.source.forEach((bpSource) => {
                                if (bpSource.field === item.field) {
                                    item.source.dropdown = dropdownSource;
                                    bpSource.source = dropdownSource;
                                }
                            });
                        });
                        this.univerCoreObject.boardPreferencesArray.forEach((item) => {
                            dataObjectArray.push({
                                dataid: item.id,
                                up_board_dropdowns: JSON.stringify(item.source)
                            });
                        });
                        wcd.apiCall({
                            endpoint: 'board/User_Preferences/input/UP_ZW_Board_Config/batch',
                            data: dataObjectArray
                        });
                    }
                }
            });
        });
        // Identify if inline cell click action is new or edit record.
        univerAPI.addEvent(univerAPI.Event.CellClicked, (params) => {
            this.univerDataObject.cellColumn = params.column;
            this.univerDataObject.cellRow = params.row;
            if (this.univerDataObject.type === '') { // If action type is blank, then either a new record is added or updated.
                if (worksheet.getRange(params.row, 0).getValue() === null) {
                    this.univerDataObject.type = 'new';
                    this.univerDataObject.cellDataId = '';
                } else {
                    this.univerDataObject.type = 'edit';
                    this.univerDataObject.cellDataId = worksheet.getRange(params.row, 0).getValue();
                }
            } else if (this.univerDataObject.type === 'copy/paste/new/individual' || this.univerDataObject.type === 'copy/paste/edit/individual') { // If action type is copy/paste, then new either a new record is added or updated.
                if (worksheet.getRange(params.row, 0).getValue() === null) {
                    this.univerDataObject.type = 'copy/paste/new/individual';
                    this.univerDataObject.cellDataId = '';
                } else {
                    this.univerDataObject.type = 'copy/paste/edit/individual';
                    this.univerDataObject.cellDataId = worksheet.getRange(params.row, 0).getValue();
                }
            }
        });
        // Build data objects for 'univerDataObject' array, before clipboard change.
        univerAPI.addEvent(univerAPI.Event.BeforeClipboardChange, async (params) => {
            const startColumn = params.fromRange._range.startColumn;
            const endColumn = params.fromRange._range.endColumn;
            if (startColumn === endColumn) {
                if (this.univerDataObject.type === 'new') {
                    this.univerDataObject.type = 'copy/paste/new/individual';
                } else if (this.univerDataObject.type === 'edit') {
                    this.univerDataObject.type = 'copy/paste/edit/individual';
                }
            } else {
                this.univerDataObject.type = 'copy/paste/new/multiple';
            }
        });
        // Build data objects for 'univerDataObject' array, before pasting data in cells.
        univerAPI.addEvent(univerAPI.Event.BeforeClipboardPaste, async (params) => {
            if (this.univerDataObject.type === 'new' || this.univerDataObject.type === 'edit' || this.univerDataObject.type === 'copy/paste/new/individual' || this.univerDataObject.type === 'copy/paste/edit/individual') {
                this.inlineCellAddEdit(params.worksheet, univerAPI, params);
            } else if (this.univerDataObject.type === 'copy/paste/new/multiple') {
                this.copyPasteRows(univerAPI, params);
            }
        });
        // Add/update records, via inline edit or via handle fill.
        univerAPI.addEvent(univerAPI.Event.SheetValueChanged, async (params) => {
            const cellRange = worksheet.getRange(params.effectedRanges[0]._range.startRow, 0);
            if (cellRange.getValue() === null && this.univerDataObject.type === 'new') {
                const response = await this.inlineCellAddEdit(worksheet, univerAPI, params);
                this.univerDataObject.type = '';
                this.univerDataObject.cellDataId = '';
                this.univerDataObject.cellColumn = '';
                this.univerDataObject.cellRow = '';
                cellRange.setValue(response[0].dataid.toString());
                worksheet.insertRows(this.univerCoreObject.rowCount, 1);
                this.univerCoreObject.rowCount = this.univerCoreObject.rowCount + 1;
                // Update 'rows' property with updated 'rowCount' value.
                this.univerCoreObject.fieldArray.forEach((item) => {
                    item.rows = this.univerCoreObject.rowCount;
                });
                // Reinitialize column rules.
                this.columnRules(worksheet, univerAPI);
            } else if (cellRange.getValue() !== null && this.univerDataObject.type === 'edit' || this.univerDataObject.type === 'fill/handle') {
                await this.inlineCellAddEdit(worksheet, univerAPI, params);
                this.univerDataObject.type = '';
                this.univerDataObject.cellDataId = '';
                this.univerDataObject.cellColumn = '';
                this.univerDataObject.cellRow = '';
            }
        });
    }

    // Initialize.
    initialize() {
        BoardScript.Refreshing.Disable();
        parent.pageBoard.HideFooter();
        document.querySelectorAll('.wcdSpread').forEach((table) => {
            const includeBps = table.getAttribute('data-wcdspread_includeboardpreferences');
            const bps = table.getAttribute('data-wcdspread_boardpreferences') !== null || table.getAttribute('data-wcdspread_boardpreferences') !== 'null' ? table.getAttribute('data-wcdspread_boardpreferences') : null;
            // Create dropdowns in 'User_Preferences' board.
            if (includeBps === 'true' && bps === null) {
                this.createDropdownsDataObjectProcess(table);
            } else if (includeBps === 'false' || includeBps === 'true' && bps !== null) {
                if (includeBps === 'true' && bps !== null) {
                    this.createBoardPreferenceData(bps);
                }
                this.createSpreadsheetData();
                this.initSpreadsheet();
            }
        });
    }

}