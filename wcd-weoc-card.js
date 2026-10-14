class WcdListCard {

    constructor() {
        // Check if an <table> element exists with the '.wcdConvertCard' class.
        if (document.querySelectorAll('.wcdConvertCard').length > 0) {
            this.createCardTable(document.querySelector('.wcdConvertCard'));
        }
    }

    createCardTable(table) {
        this.createDivWrapper(table);
        this.createCardDivHeaders(table);
        this.createCardDivDataRows(table);
        document.getElementById('div-card-wrapper').classList.remove('d-none')
        // Remove <table> element.
        table.remove();
    }

    createDivWrapper(table) {
        const divWrapper = document.createElement('div');
        divWrapper.id = 'div-card-wrapper';
        divWrapper.classList.add('d-none', 'mb-3', 'mt-3', 'ms-3', 'me-3');
        return table.parentNode.insertBefore(divWrapper, table);
    }

    createCardDivHeaders(table) {
        const divCardWrapper = document.getElementById('div-card-wrapper');
        const thead = table.querySelector('thead');
        // Create header row.
        const divHeaderRow = document.createElement('div');
        divHeaderRow.id = 'div-card-header-wrapper';
        divHeaderRow.classList.add('row', 'header-row', 'border', 'd-none', 'd-md-flex');
        // Loop through table's '<thead>' tag, build columns.
        thead.querySelectorAll('tr').forEach((tr) => {
            tr.querySelectorAll('th').forEach((th) => {
                // Adding header row columns.
                const divHeaderRowCol = document.createElement('div');
                divHeaderRowCol.className += th.classList.contains('wcdConvertCardExclude') ? 'col-sm-1 py-1 click-exclude text-end' : 'col fw-bold py-1';
                while (th.firstChild) {
                    divHeaderRowCol.appendChild(th.firstChild);
                }
                divHeaderRow.appendChild(divHeaderRowCol);
            });
        });
        divCardWrapper.appendChild(divHeaderRow);
    }

    createCardDivDataRows(table) {
        const divCardHeaderWrapper = document.getElementById('div-card-header-wrapper');
        const tbody = table.querySelector('tbody');
        // Loop through table's '<body>' tag, and build data rows.
        tbody.querySelectorAll('tr').forEach((tr) => {
            // Create data row.
            const divDataRow = document.createElement('div');
            divDataRow.classList.add('row', 'data-row', 'border-start', 'border-end', 'border-bottom');
            tr.querySelectorAll('td:not(.wcdConvertCardExclude)').forEach((td) => {
                // Adding data row columns    
                const divDataRowCol = document.createElement('div');
                if (td.classList.contains('click-exclude')) { // Action buttons/links/icons (i.e. details, edit, delete, etc).
                    divDataRowCol.classList.add('col-sm-1', 'py-1', 'click-exclude', 'text-end');
                    while (td.firstChild) {
                        divDataRowCol.appendChild(td.firstChild);
                    }
                    divDataRow.appendChild(divDataRowCol);
                } else {
                    divDataRowCol.classList.add('col', 'py-1');
                    const spanDataRowLabel = document.createElement('span');
                    const spanDataRowData = document.createElement('span');
                    spanDataRowLabel.classList.add('fw-bold', 'me-2');
                    spanDataRowLabel.textContent = td.getAttribute('data-wcdspread_label');
                    while (td.firstChild) {
                        spanDataRowData.appendChild(td.firstChild);
                    }
                    divDataRowCol.appendChild(spanDataRowLabel);
                    divDataRowCol.appendChild(spanDataRowData);
                    divDataRow.appendChild(divDataRowCol);
                }

            });
            divCardHeaderWrapper.parentNode.insertBefore(divDataRow, divCardHeaderWrapper.nextSibling);
        });
    }
    
}