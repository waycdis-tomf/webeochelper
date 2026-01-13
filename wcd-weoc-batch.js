class WcdListBatch {

    constructor() {
        this.apiView = false;
        // Check if an <table> element exists with the '.wcdListBatch' class.
        if (document.querySelectorAll('.wcdListBatch').length > 0) {
            this.createDropdownEditTrigger();
            this.showHideDropdownEditTriggers();
        }
    }

    // Create dropdown edit section trigger.
    createDropdownEditTrigger() {
        document.querySelectorAll('.wcdListBatch').forEach((table) => {
            // Identify the html <table> element id and the API view used to updated cell/field data.
            this.apiView = table.getAttribute('data-wcdlistbatch_apiview');
            // Loop through all <td> using '.wcdListBatchSelectCheckbox' class, build checkboxes.      
            table.querySelectorAll('.wcdListBatchSelectCheckbox').forEach((td) => {
                const divCheckbox = document.createElement('div');
                divCheckbox.classList.add('form-check', 'd-flex', 'align-items-center');
                const checkbox = document.createElement('input');
                checkbox.setAttribute('type', 'checkbox');
                checkbox.classList.add('select-checkbox', 'form-check-input');
                checkbox.id = `checkbox_${td.getAttribute('data-dataid')}`;
                divCheckbox.appendChild(checkbox);
                td.appendChild(divCheckbox);
            });
            // Loop through table's '<thead>' tag, build and identify column headers and fields types.            
            table.querySelectorAll('thead tr').forEach((tr) => {
                tr.querySelectorAll('th:not(.wcdListBatchExclude)').forEach((th) => {
                    if (th.querySelector('div') !== null) {
                        return this.createLink(th.querySelector('span'), table);
                    }
                });
            });
        });
    }

    // Show/hide dropdown edit trigger icons.
    showHideDropdownEditTriggers() {
        document.querySelectorAll('.select-checkbox').forEach((element) => {
            element.addEventListener('click', () => {
                document.querySelectorAll('.edit-fields-link').forEach((link) => {
                    if (document.querySelectorAll('.select-checkbox:checked').length > 0) {
                        link.classList.remove('d-none');
                        document.querySelectorAll('.dropdown-edit-section').forEach((dropdownMenu) => {
                            if (dropdownMenu.querySelectorAll('li').length === 1) {
                                dropdownMenu.classList.remove('d-none');
                            } else {
                                dropdownMenu.querySelector('li').classList.remove('d-none');
                            }
                        });
                    } else {
                        link.classList.add('d-none');
                        document.querySelectorAll('.dropdown-edit-section').forEach((dropdownMenu) => {
                            if (dropdownMenu.querySelectorAll('li').length === 1) {
                                dropdownMenu.classList.add('d-none');
                            } else {
                                dropdownMenu.querySelector('li').classList.add('d-none');
                            }
                        });
                        document.querySelectorAll('.edit-section').forEach((div) => {
                            div.remove();
                        });
                    }
                });
            });
        });
    }

    /**
     * Create field components.
     * Section will include form fields to update records.
     * @constructor
     * @param { object } object - Objet contains the 'dropdown_menu' element, 'field_type', 'field_name', 'field_label', 'field_options' keys and values.
     */
    createFieldComponents(object) {
        const toastHeader = document.createElement('div');
        const toastHeaderStrongLabel = document.createElement('strong');
        const toastHeaderBtn = document.createElement('button');
        const toastBody = document.createElement('div');
        const divFirstRow = document.createElement('div');
        const divFirstRowCol = document.createElement('div');
        const divErrorMsg = document.createElement('div');
        const hrDivider = document.createElement('hr');
        const divSecondRow = document.createElement('div');
        const divSecondRowCol = document.createElement('div');
        const divSecondRowColBtn = document.createElement('button');
        const fieldLabel = document.createElement('label');
        toastHeader.classList.add('toast-header');
        toastHeaderStrongLabel.classList.add('me-auto');
        toastHeaderStrongLabel.innerHTML = 'Batch Update';
        toastHeaderBtn.setAttribute('type', 'button');
        toastHeaderBtn.classList.add('btn-close');
        toastBody.classList.add('toast-body');
        divFirstRow.classList.add('row', 'mt-2', 'mb-2', 'ms-2', 'me-2');
        divFirstRowCol.classList.add('col');
        divErrorMsg.classList.add('mt-3', 'mb-3', 'text-danger', 'text-center', 'd-none');
        divErrorMsg.innerHTML = '<small><i>Field is required.</i></small>';
        hrDivider.classList.add('border', 'mt-3', 'mb-3');
        divSecondRow.classList.add('row', 'mt-2', 'mb-2', 'ms-2', 'me-2');
        divSecondRowCol.classList.add('col');
        divSecondRowColBtn.classList.add('btn', 'btn-sm', 'btn-outline-success', 'd-flex', 'align-items-center', 'float-end');
        divSecondRowColBtn.setAttribute('type', 'button');
        divSecondRowColBtn.innerHTML = '<i class="material-symbols-outlined me-1">check_circle</i> Update';
        divSecondRowCol.appendChild(divSecondRowColBtn);
        fieldLabel.classList.add('form-label', 'fw-bold');
        fieldLabel.setAttribute('for', object.field_name);
        fieldLabel.innerHTML = object.field_label;
        divFirstRowCol.appendChild(fieldLabel);
        if (object.field_type === 'text') {
            const textField = document.createElement('input');
            textField.setAttribute('type', 'text');
            textField.setAttribute('placeholder', 'Enter a new value');
            textField.id = object.field_name;
            textField.classList.add('form-control');
            divFirstRowCol.appendChild(textField);
        } else if (object.field_type === 'calendar') {
            const dateField = document.createElement('input');
            dateField.setAttribute('onclick', 'this.showPicker();');
            dateField.setAttribute('type', 'datetime-local');
            dateField.id = object.field_name;
            dateField.classList.add('form-control');
            divFirstRowCol.appendChild(dateField);
        } else if (object.field_type === 'dropdown') {
            const selectField = document.createElement('select');
            selectField.classList.add('form-control', 'selectpicker', 'border');
            selectField.id = object.field_name;
            selectField.setAttribute('title', 'Choose One...');
            selectField.setAttribute('data-style', 'shadow-sm');
            selectField.setAttribute('data-container', 'body');
            object.field_options.split('þ').forEach((item) => {
                const option = document.createElement('option');
                option.textContent = item;
                option.value = item;
                selectField.appendChild(option);
            });
            divFirstRowCol.appendChild(selectField);
            $(selectField).selectpicker({
                allowClear: false,
                container: '',
                liveSearch: true,
            });
        } else if (object.field_type === 'money') {
            const moneyField = document.createElement('input');
            moneyField.setAttribute('type', 'money');
            moneyField.setAttribute('placeholder', 'Enter a new value');
            moneyField.id = object.field_name;
            moneyField.classList.add('form-control');
            divFirstRowCol.appendChild(moneyField);
        }
        toastHeader.appendChild(toastHeaderStrongLabel);
        toastHeader.appendChild(toastHeaderBtn);
        divFirstRow.appendChild(divFirstRowCol);
        divSecondRow.appendChild(divSecondRowCol);
        toastBody.appendChild(divFirstRow);
        toastBody.appendChild(divErrorMsg);
        toastBody.appendChild(hrDivider);
        toastBody.appendChild(divSecondRow);
        object.dropdown_menu.appendChild(toastHeader);
        object.dropdown_menu.appendChild(toastBody);
    }

    /**
     * Create dropdown edit div.
     * Section will include form fields to update records.
     * @constructor
     * @param { object } object - Objet contains the 'table', 'field_type', 'field_name', 'field_label', 'field_options' and 'dropdown_id' keys and values.
     */
    createDropdownEditSection(object) {
        if (document.querySelectorAll('.edit-section') && document.querySelectorAll('.edit-section').length > 0) {
            document.querySelectorAll('.edit-section').forEach((div) => {
                div.remove();
            });
            document.querySelectorAll('.edit-fields-link').forEach((item) => {
                item.classList.remove('d-none');
                item.classList.remove('active');
                item.classList.remove('disabled');
            });
        } else {
            const toastContainer = document.createElement('div');
            const toastDialog = document.createElement('div');
            toastContainer.classList.add('toast-container', 'position-fixed', 'top-50', 'start-50', 'translate-middle', 'bottom-0', 'end-0', 'p-3', 'edit-section');
            toastDialog.classList.add('toast');
            toastDialog.setAttribute('role', 'alert');
            toastDialog.setAttribute('aria-live', 'assertive');
            toastDialog.setAttribute('aria-atomic', 'true');
            toastDialog.setAttribute('data-bs-autohide', 'false');
            toastDialog.id = object.dropdown_id;
            this.createFieldComponents({
                dropdown_menu: toastDialog,
                field_type: object.field_type,
                field_name: object.field_name,
                field_label: object.field_label,
                field_options: object.field_options
            });
            toastContainer.appendChild(toastDialog);
            const toastTrigger = bootstrap.Toast.getOrCreateInstance(toastDialog);
            toastTrigger.show();
            return object.table.parentNode.insertBefore(toastContainer, object.table);
        }
    }

    /**
     * Batch update records process.
     * @constructor
     * @param { element } field - Field containing field type and value.
     * @param { element } btn - Element that will be displaying spinner icon.
     */
    async batchUpateRecords(field, btn) {
        let dataObjectArray = [];
        const fieldName = field.id;
        let fieldValue;
        btn.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>';
        document.querySelectorAll('.select-checkbox:checked').forEach((checkbox) => {
            if (field.type === 'money') {
                const strip$ = field.value.toString().replace(/\$/g, '');
                fieldValue = strip$.replace(/,/g, '');
            } else if (field.type === 'datetime-local' || field.type === 'date') {
                fieldValue = new Date(field.value);
            } else {
                fieldValue = field.value;
            }
            dataObjectArray.push({
                dataid: checkbox.id.substring(checkbox.id.indexOf('_') + 1),
                [fieldName]: fieldValue
            });
        });
        try {
            await wcd.apiCall({
                endpoint: `board/${wcd.board}/input/${this.apiView}/batch`,
                data: dataObjectArray
            });
            dataObjectArray.length = 0;
            btn.innerHTML = '<i class="material-symbols-outlined me-1">check_circle</i>';
            document.querySelectorAll('.edit-section').forEach((div) => {
                div.remove();
            });
            parent.pageBoard.Refresh();
        } catch (error) {
            throw new Error(error);
        }
    }

    // Dropdown section form button actions (cancel and save buttons).
    dropdownEditTriggerActions() {
        document.querySelectorAll('.edit-section').forEach((div) => {
            let field;
            const errorMsg = div.querySelector('.text-danger');
            div.querySelectorAll('.btn-close').forEach((btnClose) => {
                btnClose.addEventListener('click', () => {
                    div.remove();
                    document.querySelectorAll('.edit-fields-link').forEach((item) => {
                        item.classList.remove('d-none');
                        item.classList.remove('active');
                        item.classList.remove('disabled');
                    });
                });
            });
            div.querySelectorAll('.row:nth-child(1)').forEach((row) => {
                row.querySelectorAll('.col').forEach((formElement) => {
                    const col = formElement.querySelector(':nth-child(2)');
                    if (col.querySelector(':nth-child(1)') !== null) {
                        field = col.querySelector(':nth-child(1)');
                    } else {
                        field = formElement.querySelector(':nth-child(2)');
                    }
                });
            });
            div.querySelectorAll('.row:nth-child(4)').forEach((row) => {
                row.querySelectorAll('.col').forEach((formElement) => {
                    formElement.querySelector(':nth-child(1)').addEventListener('click', () => {
                        if (field.value === '') {
                            field.classList.remove('is-valid');
                            field.classList.add('is-invalid');
                            errorMsg.classList.remove('d-none');
                            return false;
                        } else {
                            field.classList.remove('is-invalid');
                            field.classList.add('is-valid');
                            errorMsg.classList.add('d-none');
                            this.batchUpateRecords(field, formElement.querySelector(':nth-child(1)'));
                        }
                    });
                });
            });
        });
    }

    /**
     * Create links in all applicable table headers.
     * Links will have the ability to create 'dropdown edit section' and update record.
     * @constructor
     * @param { element } span - The element the link element will be added after.
     * @param { element } table - The element the toast element will be added belore.
     */
    createLink(span, table) {
        const dropdownDiv = document.createElement('div');
        const dropdownLink = document.createElement('a');
        const dropdownMenu = document.createElement('ul');
        const dropdownFirstItem = document.createElement('li');
        const dropdownFirstItemLink = document.createElement('a');
        const th = span.parentElement.parentElement;
        const updateField = th.getAttribute('data-wcdlistbatch_field');
        dropdownDiv.classList.add('dropdown', 'dropdown-edit-section');
        dropdownLink.classList.add('link');
        dropdownLink.setAttribute('href', '#');
        dropdownLink.setAttribute('role', 'button');
        dropdownLink.setAttribute('data-bs-toggle', 'dropdown');
        dropdownLink.setAttribute('ara-expanded', 'false');
        dropdownLink.innerHTML = `<i class="material-symbols-outlined ms-1 me-1">more_vert</i>`;
        dropdownMenu.classList.add('dropdown-menu');
        dropdownFirstItemLink.classList.add('dropdown-item', 'edit-fields-link', 'd-none');
        dropdownFirstItemLink.textContent = 'Batch Update';
        dropdownFirstItem.appendChild(dropdownFirstItemLink);
        dropdownMenu.appendChild(dropdownFirstItem);
        if (span.querySelector('a')) {
            const sortLink = span.querySelector('a');
            span.textContent = sortLink.textContent;
            sortLink.remove();
            const sortLinkAsc = document.createElement('a');
            const sortLinkDesc = document.createElement('a');
            const dropdownSecondItem = document.createElement('li');
            const dropdownThirdItem = document.createElement('li');
            sortLinkAsc.classList.add('dropdown-item', 'sorting', 'sorting_asc');
            sortLinkAsc.setAttribute('webeoc-sortfield', updateField);
            sortLinkAsc.setAttribute('href', '#');
            sortLinkAsc.setAttribute('onclick', `BoardScript.SortByField('${updateField}', '')`);
            sortLinkAsc.textContent = 'Sort ASC';
            sortLinkDesc.classList.add('dropdown-item', 'sorting', 'sorting_desc');
            sortLinkDesc.setAttribute('webeoc-sortfield', updateField);
            sortLinkDesc.setAttribute('href', '#');
            sortLinkDesc.setAttribute('onclick', `BoardScript.SortByField('${updateField}', '')`);
            sortLinkDesc.textContent = 'Sort DESC';
            dropdownSecondItem.appendChild(sortLinkAsc);
            dropdownThirdItem.appendChild(sortLinkDesc);
            dropdownMenu.appendChild(dropdownSecondItem);
            dropdownMenu.appendChild(dropdownThirdItem);
        }
        dropdownDiv.appendChild(dropdownLink);
        dropdownDiv.appendChild(dropdownMenu);
        span.parentNode.insertBefore(dropdownDiv, span.nextSibling);
        if (dropdownMenu.querySelectorAll('li').length === 1) {
            dropdownDiv.classList.add('d-none');
        }
        dropdownLink.addEventListener('click', () => {
            document.querySelectorAll('.edit-section').forEach((editSection) => {
                editSection.remove();
            });
        });
        dropdownFirstItemLink.addEventListener('click', () => {
            const fieldLabel = span.textContent;
            const dropdownId = `dropdownedit_${fieldLabel.replace(/ /g, '_')}`;
            this.createDropdownEditSection({
                table: table,
                field_type: th.getAttribute('data-wcdlistbatch_type') === null ? 'text' : th.getAttribute('data-wcdlistbatch_type'),
                field_name: updateField,
                field_label: fieldLabel,
                field_options: th.getAttribute('data-wcdlistbatch_type') === 'dropdown' ? th.getAttribute('data-wcdlistbatch_source') : null,
                dropdown_id: dropdownId
            });
            this.dropdownEditTriggerActions();
        });
    }

    /*
        Instructions:
        Add the '.wcdListBatch' class to the <table> element.
        Add the 'data-wcdlistbatch_apiview' attribute which contains API view for batch update process.
        Add the following data attributes to any <th> elements required for batch update process.
        Add the class '.wcdListBatchExclude' to exclude any <th> from batch update process.
        ----- data-wcdlistbatch_field - Field that will be updated.
        ----- data-wcdlistbatch_type - Field type.  Supported types are 'calendar', 'dropdown', and 'money'.  Default type is 'text' (not required).
        Each <th> will contain a <div> and text content will be wrapped by a <span>.
        
        Example:
        <table class="wcdListBatch" data-wcdlistbatch_apiview="Input_View">
            <thead>
                <tr>
                    <if test="/data/@pdf = 'false'">
                        <th class="wcdListBatchExclude" />
                    </if>
                    <th data-wcdlistbatch_field="example_text_field">
                        <div class="d-flex align-items-center">
                            <span>
                                <sortlink field="example_text_field">Example Text Field</sortlink>
                            </span>
                        </div>
                    </th>
                    <th data-wcdlistbatch_type="calendar" data-wcdlistbatch_field="example_date_field">
                        <div class="d-flex align-items-center">
                            <span>Example Date Field</span>
                        </div>
                    </th>
                    <th data-wcdlistbatch_type="money" data-wcdlistbatch_field="main_money_field">
                        <div class="d-flex align-items-center">
                            <span>Example Money Field</span>
                        </div>
                    </th>
                    <if test="/data/@pdf = 'false'">
                        <th class="wcdListBatchExclude" width="5%" />
                    </if>
                </tr>
            </thead>
            <tbody class="table-group-divider">
                ...
            </tbody>
        </table>   
    */

}