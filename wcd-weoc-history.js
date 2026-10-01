class WcdHistory {
    constructor({
        element = false,
        view = false,
        pdf = wcd.pdf,
        children = false,
        loading_element = false
    }) {
        console.log('testing')
        this.element = element;
        this.view = view;
        this.parent_dataid = wcd.dataid;
        this.pdf = pdf;
        this.children = children;
        this.loading_element = loading_element;
        this.mainDataArray = [];
        if (this.loading_element) {
            wcd.loading.small.show('Loading history...', this.loading_element);
        }
        if (parseInt(this.parent_dataid) > 0) {
            this.createMainHistoryElement();
            console.log('a', mobileBreakpoint.matches);
            this.getData({
                action_type: this.children ? 'Get_All_Data' : 'Get_Data',
                api_view: this.view,
                record: false,
                object: {
                    endpoint: `board/${wcd.board}/display/${this.view}/${this.parent_dataid}`
                }
            }).then(() => {

                console.log('xyz', this.mainDataArray);

                if (this.mainDataArray.some(obj => obj.hasOwnProperty('error_msg')) === true) {
                    // TODO: REDO THE FOLLOWING LOGIC.  MAKE SURE TO INCLUDE FOR DESKTOP AND MOBILE.
                    // taco this.errorHandler(this.mainDataArray.filter(obj => obj.hasOwnProperty('error_msg')));
                    // taco this.configureDataTables();
                } else {
                    !!mobileBreakpoint.matches ? this.createHistoryCard() : this.createHistoryTable();
                    mobileBreakpoint.addEventListener('change', (event) => {
                        !!event.matches ? this.createHistoryCard() : this.createHistoryTable();
                    });
                }
            });
        }
    }

    createMainHistoryElement() {
        const card = document.createElement('div');
        const cardHeader = document.createElement('div');
        const cardSubheader = document.createElement('div');
        const cardSubSearch = document.createElement('div');
        const cardRow = document.createElement('div');
        const cardCol1 = document.createElement('div');
        const cardCol2 = document.createElement('div');
        const cardBody = document.createElement('div');
        card.id = 'history-card';
        card.classList.add('dflex', 'card', 'mt-2');
        cardHeader.classList.add('card-header', 'ml-auto');
        cardRow.classList.add('row');
        cardCol1.classList.add('col');
        cardCol2.classList.add('col');
        cardSubSearch.classList.add('input-group', 'input-group-sm', 'searchArea');
        cardCol1.innerHTML = 'History Section';
        cardCol2.appendChild(cardSubSearch);
        cardRow.appendChild(cardCol1);
        if (this.pdf === false) {
            cardRow.appendChild(cardCol2);
        }
        cardSubheader.classList.add('justify-content-between', 'align-items-center');
        cardSubheader.appendChild(cardRow);
        cardHeader.appendChild(cardSubheader);
        card.appendChild(cardHeader);
        cardBody.classList.add('card-body');
        cardBody.id = 'history-body-card';
        // TODO: MOVE THIS LINE, cardBody.appendChild(this.createTable()); AT THE END OF GENERATING this.mainDataArray.
        card.appendChild(cardBody);
        this.element.parentNode.insertBefore(card, this.element);
        this.element.remove();
        this.element = card;
    }

    createHistoryTable() {
        console.log('test j;lkj;lkj 1223')
        const parentEle = document.getElementById('history-body-card');
        parentEle.innerHTML = '';
        parentEle.appendChild(this.createTable());
        this.createRecordHistoryTableRows();
    }

    createHistoryCard() {
        const parentEle = document.getElementById('history-body-card');
        parentEle.innerHTML = '';
        this.mainDataArray.forEach((item) => {
            const divWrapper = document.createElement('div');
            const divRow = document.createElement('div');
            const divCol1 = document.createElement('div');
            const divCol2 = document.createElement('div');
            const divCol3 = document.createElement('div');
            const span1Col1 = document.createElement('span');
            const span2Col1 = document.createElement('span');
            const span1Col2 = document.createElement('span');
            const span2Col2 = document.createElement('span');
            const span1Col3 = document.createElement('span');
            const span2Col3 = document.createElement('span');
            divWrapper.classList.add('mb-3', 'mt-3', 'ms-3', 'me-3');
            divRow.classList.add('row', 'data-row', 'border');
            divCol1.classList.add('col-12', 'py-1');
            divCol2.classList.add('col-12', 'py-1');
            divCol3.classList.add('col-12', 'py-1');
            span1Col1.classList.add('fw-bold', 'me-2');
            span1Col1.innerHTML = 'Creator';
            span2Col1.innerHTML = `${item.username} / ${item.positionname}</i>`;
            span1Col2.classList.add('fw-bold', 'me-2');
            span1Col2.innerHTML = 'Date/Time';
            span2Col2.innerHTML = item.entrydate;
            span1Col3.classList.add('fw-bold', 'me-2');
            span1Col3.innerHTML = 'Source';
            span2Col3.innerHTML = item.tablename;
            divCol1.appendChild(span1Col1);
            divCol1.appendChild(span2Col1);
            divCol2.appendChild(span1Col2);
            divCol2.appendChild(span2Col2);
            divCol3.appendChild(span1Col3);
            divCol3.appendChild(span2Col3);
            divRow.appendChild(divCol1);
            divRow.appendChild(divCol2);
            divRow.appendChild(divCol3);
            divWrapper.appendChild(divRow);
            parentEle.appendChild(divWrapper);
        });
    }

    createTable() {
        const div = document.createElement('div');
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const thr = document.createElement('tr');
        const thd1 = document.createElement('th');
        const thd2 = document.createElement('th');
        const thd3 = document.createElement('th');
        const thd4 = document.createElement('th');
        const thd5 = document.createElement('th');
        const tbody = document.createElement('tbody');
        const span = document.createElement('span')
        const infoIcon = document.createElement('i');
        div.classList.add('table-responsive-sm');
        infoIcon.classList.add('bs-tooltip');
        infoIcon.setAttribute('data-bs-toggle', 'tooltip');
        infoIcon.setAttribute('data-bs-placement', 'top');
        infoIcon.setAttribute('title', 'Click on the details icon to view record details');
        infoIcon.classList.add('material-symbols-outlined');
        infoIcon.textContent = 'info';
        span.innerHTML = 'Comment ';
        // TODO: REDO BELOW LOGIC, this.pdf === false.
        if (this.pdf === false) {
            table.classList.add('table', 'table-sm', 'table-striped');
            // taco table.classList.add('table', 'table-sm', 'table-striped', 'wcdConvertCard');
        } else {
            table.classList.add('table', 'table-sm', 'table-striped');
        }
        table.id = 'history_table';
        thead.classList.add('table-dark');
        thd1.innerHTML = 'Creator';
        thd2.innerHTML = 'Date/Time';
        thd3.innerHTML = 'Source';
        thd4.appendChild(span);
        if (this.pdf === false) {
            thd4.appendChild(infoIcon);
        }
        thd4.style.width = '35%';
        thd5.style.width = '5%';
        thr.appendChild(thd1);
        thr.appendChild(thd2);
        thr.appendChild(thd3);
        thr.appendChild(thd4);
        if (this.pdf === false) {
            thr.appendChild(thd5);
        }
        thead.appendChild(thr);
        table.appendChild(thead);
        tbody.id = 'history-tbody';
        table.appendChild(tbody);
        div.appendChild(table);
        return div;
    }

    getDataHistory({
        api_view,
        record,
        object
    }) {
        return wcd.apiCall(object).then((dataResults) => {
            if (dataResults.length > 0) {
                dataResults.unshift(record);
                return Promise.resolve(this.getRecordChanges(dataResults));
            } else {
                return Promise.resolve(this.getRecordChanges([record]));
            }
        }).catch((error) => {
            this.mainDataArray.push({
                api_view: api_view,
                error_msg: error.toString().trim()
            });
        });
    }

    getRecordChanges(historyArray) {
        let dataHistoryArray = [];
        for (let i = historyArray.length - 1; i >= 0; i--) {
            if (i === historyArray.length - 1) {
                let newOriginalHistoryObject = {};
                let origHistoryRecord = historyArray[i];
                origHistoryRecord.entrydate = !!origHistoryRecord.custom_dt_entry ? this.formatDateTime(origHistoryRecord.custom_dt_entry) : this.formatDateTime(origHistoryRecord.entrydate);
                let sysFullOriginalRecord = origHistoryRecord;
                if (!!origHistoryRecord.custom_dt_entry) {
                    delete origHistoryRecord.custom_dt_entry;
                }
                for (const key of Object.keys(origHistoryRecord)) {
                    let newHistOrgObjVal;
                    const historyOriginalRecordVal = origHistoryRecord[key] === '' || origHistoryRecord[key] === 'undefined' || origHistoryRecord[key] === undefined || origHistoryRecord[key] === null ? '' : origHistoryRecord[key];
                    newOriginalHistoryObject['origrecord'] = 'Yes';
                    newOriginalHistoryObject['fullrecord'] = sysFullOriginalRecord;
                    if (key.indexOf('date') > -1 || key.indexOf('Date') > -1) {
                        newHistOrgObjVal = historyOriginalRecordVal === '' ? '' : this.formatDateTime(historyOriginalRecordVal);
                    } else if (key.indexOf('þAttachment') > -1) {
                        newHistOrgObjVal = parseInt(historyOriginalRecordVal) === 0 || historyOriginalRecordVal === '' || historyOriginalRecordVal === null ? '' : 'File Attached';
                    } else if (key.indexOf('þMoney') > -1) {
                        newHistOrgObjVal = wcd.formatCurrency(historyOriginalRecordVal);
                    } else {
                        newHistOrgObjVal = historyOriginalRecordVal === '' ? '' : historyOriginalRecordVal;
                    }
                    newOriginalHistoryObject[key] = newHistOrgObjVal;
                }
                dataHistoryArray.push(newOriginalHistoryObject);
            } else {
                let historyRecord = historyArray[i];
                let previousHistoryRecord = historyArray[i + 1];
                let newHistoryObject = {};
                let sysTableName = historyRecord.tablename;
                let sysUsername = historyRecord.username;
                let sysPositionName = historyRecord.positionname;
                let sysPrevdataId = historyRecord.prevdataid;
                let sysFullRecord = historyRecord;
                for (const key of Object.keys(historyRecord)) {
                    if (key === 'entrydate') {
                        newHistoryObject['entrydate'] = !!historyRecord.custom_dt_entry ? this.formatDateTime(historyRecord.custom_dt_entry) : this.formatDateTime(historyRecord.entrydate);
                        newHistoryObject['tablename'] = sysTableName;
                        newHistoryObject['username'] = sysUsername;
                        newHistoryObject['positionname'] = sysPositionName;
                        newHistoryObject['prevdataid'] = sysPrevdataId;
                        newHistoryObject['origrecord'] = 'No';
                        newHistoryObject['fullrecord'] = sysFullRecord;
                        if (!!historyRecord.custom_dt_entry) {
                            delete historyRecord.custom_dt_entry;
                        }
                    } else {
                        const historyRecordVal = historyRecord[key] === '' || historyRecord[key] === 'undefined' || historyRecord[key] === undefined || historyRecord[key] === null ? '' : historyRecord[key];
                        const previousHistoryRecordVal = previousHistoryRecord[key] === '' || previousHistoryRecord[key] === 'undefined' || previousHistoryRecord[key] === undefined || previousHistoryRecord[key] === null ? '' : previousHistoryRecord[key];
                        if (historyRecordVal !== previousHistoryRecordVal) {
                            if (key == 'history_comment') {
                                newHistoryObject[key] = historyRecordVal;
                            } else {
                                let prevHistVal;
                                let histVal;
                                if (key.indexOf('date') > -1 || key.indexOf('Date') > -1) {
                                    prevHistVal = previousHistoryRecordVal === '' ? 'No Field Value' : this.formatDateTime(previousHistoryRecordVal);
                                } else if (key.indexOf('þAttachment') > -1) {
                                    prevHistVal = parseInt(previousHistoryRecordVal) === 0 || previousHistoryRecordVal === '' || previousHistoryRecordVal === null ? 'No File Attached' : 'File Attached';
                                } else if (key.indexOf('þMoney') > -1) {
                                    prevHistVal = wcd.formatCurrency(previousHistoryRecordVal);
                                } else {
                                    prevHistVal = previousHistoryRecordVal === '' ? 'No Field Value' : previousHistoryRecordVal;
                                }
                                if (key.indexOf('date') > -1 || key.indexOf('Date') > -1) {
                                    histVal = historyRecordVal === '' ? 'No Field Value' : this.formatDateTime(historyRecordVal);
                                } else if (key.indexOf('þAttachment') > -1) {
                                    histVal = parseInt(historyRecordVal) === 0 || historyRecordVal === '' || historyRecordVal === null ? 'No File Attached' : 'File Attached';
                                } else if (key.indexOf('þMoney') > -1) {
                                    histVal = wcd.formatCurrency(historyRecordVal);
                                } else {
                                    histVal = historyRecordVal === '' ? 'No Field Value' : historyRecordVal;
                                }
                                newHistoryObject[key] = `Changed from '${prevHistVal}' to '${histVal}'.`;
                            }
                        }
                    }
                }
                dataHistoryArray.push(newHistoryObject);
            }
        }
        return dataHistoryArray.reverse();
    }

    getData({
        action_type = false,
        api_view = false,
        record = false,
        object = false
    }) {
        return wcd.apiCall(object).then((dataResults) => {
            if (action_type === 'Get_Data') {
                let getDataPromiseArray = [];
                dataResults.forEach((item, index) => {
                    if (index === 0) {
                        getDataPromiseArray.push(
                            this.getDataHistory({
                                api_view: api_view,
                                record: item,
                                object: {
                                    data: {},
                                    endpoint: `board/${wcd.board}/display/${api_view}/history/${item.dataid}`,
                                    headers: {
                                        'X-Paging-Page': '1',
                                        'X-Paging-PageSize': '50'
                                    }
                                }
                            }).then((parentDataResults) => {
                                parentDataResults.forEach((item) => {
                                    this.mainDataArray.push(item);
                                });
                            })
                        );
                    }
                });
                return Promise.allSettled(getDataPromiseArray);
            } else if (action_type === 'Get_All_Data') {
                let getAllDataPromiseArray = [];
                dataResults.forEach((item, index) => {
                    if (index === 0) {
                        getAllDataPromiseArray.push(
                            this.getDataHistory({
                                api_view: api_view,
                                record: item,
                                object: {
                                    data: {},
                                    endpoint: `board/${wcd.board}/display/${api_view}/history/${item.dataid}`,
                                    headers: {
                                        'X-Paging-Page': '1',
                                        'X-Paging-PageSize': '50'
                                    }
                                }
                            }).then((parentDataResults) => {
                                parentDataResults.forEach((item) => {
                                    this.mainDataArray.push(item);
                                });
                            })
                        );
                    } else {
                        getAllDataPromiseArray.push(
                            this.getData({
                                action_type: 'Get_All_Data',
                                api_view: item.api_view,
                                record: false,
                                object: {
                                    endpoint: `board/${wcd.board}/display/${item.api_view}/${item.dataid}`
                                }
                            })
                        );

                    }
                });
                return Promise.allSettled(getAllDataPromiseArray);
            }
        }).catch((error) => {
            this.mainDataArray.push({
                api_view: api_view,
                error_msg: error.toString().trim()
            });
        });
    }

    createRecordHistoryTableRows() {
        this.mainDataArray.sort((date1, date2) => {
            return new Date(date2.entrydate) - new Date(date1.entrydate);
        });
        this.createTableRows(this.mainDataArray);
    }

    createTableRows(dataResults) {
        const tbody = document.getElementById('history-tbody');
        dataResults.forEach((item) => {
            if (Object.keys(item).length > 8) {
                let tr = document.createElement('tr');
                let td1 = document.createElement('td');
                let td2 = document.createElement('td');
                let td3 = document.createElement('td');
                let td4 = document.createElement('td');
                let td5 = document.createElement('td');
                let divComment = document.createElement('div');
                let detailsLink = document.createElement('a');
                let detailsIcon = document.createElement('i');
                detailsLink.classList.add('bs-tooltip');
                detailsLink.setAttribute('data-bs-toggle', 'tooltip');
                detailsLink.setAttribute('data-bs-placement', 'top');
                detailsLink.setAttribute('title', 'View');
                detailsLink.setAttribute('data-json-record', JSON.stringify(item.fullrecord));
                detailsLink.setAttribute('onclick', 'viewRecordDetails(this)');
                detailsIcon.classList.add('material-symbols-outlined');
                detailsIcon.textContent = 'visibility';
                detailsLink.appendChild(detailsIcon);
                td1.innerHTML = `${item.username}<br><i>${item.positionname}</i>`;
                td2.innerHTML = item.entrydate;
                td3.innerHTML = item.tablename;
                let fieldChangesContent = '';
                for (const key in item) {
                    if (key.indexOf('fk_table') === -1 && key !== 'dataid' && key !== 'prevdataid' && key !== 'subscribername' && key !== 'entrydate' && key !== 'tablename' && key !== 'username' && key !== 'positionname' && key !== 'origrecord' && key !== 'history_comment' && key !== 'fullrecord' && key.indexOf('RemoveExp') === -1) {
                        if (item[key] !== '') {
                            const preFieldLabel = key.indexOf('þAttachment') > -1 ? key.replace(/þAttachment/g, '') : (key.indexOf('þMoney') > -1 ? key.replace(/þMoney/g, '') : key);
                            const fieldLabel = preFieldLabel.replace(/_/g, ' ');
                            const fieldChanges = `${fieldLabel}: ${item[key]}<br>`;
                            fieldChangesContent += fieldChanges;
                        }
                    } else if (key === 'history_comment') {
                        fieldChangesContent += `Comment: ${item[key]}<br>`;
                    }
                }
                divComment.innerHTML = fieldChangesContent.replace(/<br>$/, '');
                if (this.pdf === false) {
                    td4.appendChild(divComment);
                    if (divComment.innerHTML.length > 250) {
                        requestAnimationFrame(() => {
                            this.applyClampline({ element: td4, force: true, show: false });
                        });
                    }
                } else {
                    td4.innerHTML = fieldChangesContent.replace(/<br>$/, '');
                }
                td5.appendChild(detailsLink);
                td1.setAttribute('data-wcdspread_label', 'Creator');
                td2.setAttribute('data-wcdspread_label', 'Date/Time');
                td3.setAttribute('data-wcdspread_label', 'Source');
                td4.setAttribute('data-wcdspread_label', 'Comment');
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                if (this.pdf === false) {
                    tr.appendChild(td5);
                }
                tbody.appendChild(tr);
                const tltElements = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tltElements.map((element) => {
                    return new bootstrap.Tooltip(element);
                });
            }
        });
        return this.configureDataTables();
    }

    reConfigureClamplineHeight() {
        document.querySelectorAll('.clampline').forEach((element) => {
            element.children[0].style.setProperty('max-height', '125px');
            element.children[1].addEventListener('click', (btn) => {
                if (btn.target.innerHTML === 'compress') {
                    element.children[0].style.removeProperty('max-height');
                } else {
                    element.children[0].style.setProperty('max-height', '125px');
                }
            });
        });
    }

    configureDataTables() {
        if (this.pdf === false) {
            document.getElementById('history_table').classList.add('convertTable');
            if ($.fn.DataTable.isDataTable('#history_table') === false) {
                const dtCallback = (() => {
                    this.reConfigureClamplineHeight();
                });
                this.configureDT('Details');
                setTimeout(() => {
                    dtCallback();
                }, 350);
                $('#history_table').on('draw.dt', () => {
                    dtCallback();
                });
            }
            wcd.loading.hide();
        }
    }

    configureDT() {
        if ($('.convertTable').length == 1) {
            let headers = $('.convertTable th');
            let colDefs = [];
            headers.each(function (ind, header) {
                colDefs.push({
                    targets: ind,
                    name: header.innerText
                });
            });
            $('.convertTable').DataTable({
                lengthChange: false,
                autoWidth: false,
                pageLength: 10,
                order: [],
                columnDefs: [].concat(colDefs)
            });
        }
        document.querySelectorAll('.dataTable').forEach((element) => {
            element.classList.remove('convertTable');
        });
    }

    applyClampline({
        element = false,
        force = false,
        show = false
    }) {
        if (element) {
            if (element.clientHeight > 32 || force) {
                element.querySelectorAll('td').forEach(td => {
                    td.childNodes.forEach(child => {
                        if (child.constructor == Text) {
                            let wrapper = document.createElement('div');
                            let text = child;
                            td.insertBefore(wrapper, text);
                            wrapper.appendChild(text);
                        }
                    });
                });
                let collapseButton = document.createElement('div');
                collapseButton.classList.add('clamplineBtn', 'material-symbols-outlined');
                if (!element.classList.contains('show') && show == false) {
                    element.classList.add('clCollapsed');
                    collapseButton.innerText = 'expand';
                    collapseButton.classList.add('clExpand');
                    collapseButton.setAttribute('data-bs-original-title', 'Show More');
                    new bootstrap.Tooltip(collapseButton, { trigger: "hover" });
                } else {
                    collapseButton.classList.add('clCollapse');
                    collapseButton.innerText = 'compress';
                    collapseButton.setAttribute('data-bs-original-title', 'Show Less');
                    new bootstrap.Tooltip(collapseButton, { trigger: "hover" });
                }
                collapseButton.addEventListener("click", function () {
                    let button = this;
                    const tooltipInstance = bootstrap.Tooltip.getInstance(button);
                    button.parentElement.classList.toggle('clCollapsed');
                    if (button.parentElement.classList.contains('clCollapsed')) {
                        button.classList.add('clExpand');
                        button.innerText = 'expand';
                        button.classList.remove('clCollapse');
                        button.setAttribute('data-bs-original-title', 'Show More');
                        tooltipInstance.hide();
                        setTimeout(() => {
                            tooltipInstance.show();
                        }, 300);
                    } else {
                        button.classList.remove('clExpand');
                        button.classList.add('clCollapse');
                        button.innerText = 'compress';
                        button.setAttribute('data-bs-original-title', 'Show Less');
                        tooltipInstance.hide();
                        setTimeout(() => {
                            tooltipInstance.show();
                        }, 300);
                    }
                });
                element.appendChild(collapseButton);
                element.classList.add('clampline');
            } else {
                element.classList.remove('clampline');
            }
        }
    }

    formatDateTime(field) {
        let date;
        if (field.indexOf('T') > -1) {
            const isoString = new Date(field + 'Z').toISOString();
            date = new Date(isoString);
        } else {
            date = new Date(field);
        }
        const formatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        return formatter.format(date).replace(',', '');
    }

    async errorHandler(dataResults) {
        let apiViews = '';
        let apiViewsArray = [];
        let errorMsgArray = [];
        dataResults.forEach((item) => {
            apiViewsArray.push(item.api_view);
            errorMsgArray.push(item.error_msg);
        });
        const viewsArray = [...new Set(apiViewsArray)];
        const errorMsg = [...new Set(errorMsgArray)].toString();
        viewsArray.forEach((itemView) => {
            apiViews += `• ${itemView}<br>`;
        });
        const modalResults = await wcd.buildModal({
            type: 'action',
            title: errorMsg,
            body: errorMsg === 'Error: 400:' ? `You do not have sufficient permissions to perform the requested operation.<br><br>The following views are required:<br>${apiViews}` : (errorMsg === 'Error: 500:' ? `An unrecoverable error has occurred. See the WebEOC error log for an error description<br><br>The following views may have issues:<br>${apiViews}` : errorMsg),
            footer: [{
                text: 'Close',
                color: 'danger',
                icon: 'warning'
            }],
            validate: false
        });
        if (modalResults === false || modalResults !== false) {
            return errorMsg;
        }
    }

}

wcd.addMod({
    id: 'history',
    name: 'WAYCDIS History',
    entities: [],
    version: '0.1'
});

const mobileBreakpoint = window.matchMedia('(max-width: 575.98px)');

document.addEventListener('DOMContentLoaded', function () {
    let defaultElement = document.querySelector('#wcd-history');
    console.log('defaultElement', defaultElement);
    if (defaultElement && defaultElement.dataset.wcdView) {
        let children = false;
        if (defaultElement.dataset.wcdChildren) children = true;
        wcd.history = new WcdHistory({
            element: defaultElement,
            view: defaultElement.dataset.wcdView,
            children: children
        });
    }
});

function viewRecordDetails(element) {
    let bodyContents = '';
    const item = JSON.parse(element.getAttribute('data-json-record'));
    for (const key in item) {
        if (key.indexOf('fk_table') === -1 && key !== 'dataid' && key !== 'prevdataid' && key !== 'subscribername' && key !== 'entrydate' && key !== 'tablename' && key !== 'username' && key !== 'positionname' && key !== 'history_comment' && key.indexOf('RemoveExp') === -1) {
            if (item[key] !== '') {
                let itemKey;
                let itemVal;
                const origItemVal = item[key] === '' || item[key] === 'undefined' || item[key] === undefined || item[key] === null ? '' : item[key];
                if (key.indexOf('date') > -1 || key.indexOf('Date') > -1) {
                    itemKey = key;
                    itemVal = origItemVal === '' ? '' : this.formatDateTime(origItemVal);
                } else if (key.indexOf('þAttachment') > -1) {
                    itemKey = key.replace(/þAttachment/g, '');
                    itemVal = parseInt(origItemVal) === 0 || origItemVal === '' || origItemVal === null ? 'No File Attached' : 'File Attached';
                } else if (key.indexOf('þMoney') > -1) {
                    itemKey = key.replace(/þMoney/g, '');
                    itemVal = wcd.formatCurrency(origItemVal);
                } else {
                    itemKey = key;
                    itemVal = origItemVal === '' ? 'No Field Value' : origItemVal;
                }
                const fieldLabel = itemKey.replace(/_/g, ' ');
                const fieldChanges = `${fieldLabel}: ${itemVal}<br>`;
                bodyContents += fieldChanges;
            }
        } else if (key === 'history_comment') {
            bodyContents += `Added comment: '${item[key]}'<br>`;
        }
    }
    return wcd.buildModal({
        type: 'action',
        title: 'Record Details',
        body: bodyContents.replace(/<br>$/, ''),
        footer: [{
            text: 'Close',
            color: 'success',
            icon: 'close'
        }],
        validate: false
    });
}

// Add following code to the view.
/*
    <div id="wcd-history" data-wcd-view="History_Viewlink" data-wcd-children="yes">
        <viewlink name="History_Viewlink" />
    </div>
    ## To use a custom date/time field instead of using WebEOC's 'entrydate' add the following expression (named 'custom_dt_entry') in the 'History_Viewlink' view: <expression name="custom_dt_entry">sample_custom_date_time_field</expression>
    ## id - Should always be 'wcd-history'.
    ## data-view - The name of the viewlink that will be used to fetch data.
    ## data-wcd-children - Include children.
*/