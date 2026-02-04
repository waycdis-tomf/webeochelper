class WcdHistory {
    constructor({
        element = false,
        view = false,
        pdf = false,
        children = false,
        loading_element = false
    }) {
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
        this.createCard();
        this.getData({
            action_type: this.children ? 'Get_All_Data' : 'Get_Data',
            api_view: this.view,
            record: false,
            object: {
                endpoint: `board/${wcd.board}/display/${this.view}/${this.parent_dataid}`
            }
        }).then(() => {
            if (this.mainDataArray.some(obj => obj.hasOwnProperty('error_msg')) === true) {
                this.errorHandler(this.mainDataArray.filter(obj => obj.hasOwnProperty('error_msg')));
                this.configureDataTables();
            } else {
                this.createRecordHistoryTableRows();
            }
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
        table.classList.add('table', 'table-sm', 'table-striped');
        table.id = 'history-table';
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

    createCard() {
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
        cardBody.appendChild(this.createTable());
        card.appendChild(cardBody);
        this.element.parentNode.insertBefore(card, this.element);
        this.element.remove();
        this.element = card;
    }

    formatDateTime(field) {
        const dateTime = new Date(field);
        const hours = dateTime.getHours().toString().padStart(2, '0');
        const minutes = dateTime.getMinutes().toString().padStart(2, '0');
        const seconds = dateTime.getSeconds().toString().padStart(2, '0');
        const year = dateTime.getFullYear();
        const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
        const day = dateTime.getDate().toString().padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
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
                let sysFullOriginalRecord = origHistoryRecord;
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
                        newHistoryObject['entrydate'] = this.formatDateTime(historyRecord.entrydate);
                        newHistoryObject['tablename'] = sysTableName;
                        newHistoryObject['username'] = sysUsername;
                        newHistoryObject['positionname'] = sysPositionName;
                        newHistoryObject['prevdataid'] = sysPrevdataId;
                        newHistoryObject['origrecord'] = 'No';
                        newHistoryObject['fullrecord'] = sysFullRecord;
                    } else {
                        const historyRecordVal = historyRecord[key] === '' || historyRecord[key] === 'undefined' || historyRecord[key] === undefined || historyRecord[key] === null ? '' : historyRecord[key];
                        const previousHistoryRecordVal = previousHistoryRecord[key] === '' || previousHistoryRecord[key] === 'undefined' || previousHistoryRecord[key] === undefined || previousHistoryRecord[key] === null ? '' : previousHistoryRecord[key];
                        if (historyRecordVal !== previousHistoryRecordVal) {
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
            console.log('Object.keys(item)', Object.keys(item));
            console.log('Object.keys(item).length', Object.keys(item).length);
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
                detailsIcon.classList.add('material-symbols-outlined');
                detailsIcon.textContent = 'visibility';
                detailsLink.appendChild(detailsIcon);
                td1.innerHTML = `${item.username}<br><i>${item.positionname}</i>`;
                td2.innerHTML = item.entrydate;
                td3.innerHTML = item.tablename;
                let fieldChangesContent = '';
                for (const key in item) {
                    if (key.indexOf('fk_table') === -1 && key !== 'dataid' && key !== 'prevdataid' && key !== 'subscribername' && key !== 'entrydate' && key !== 'tablename' && key !== 'username' && key !== 'positionname' && key !== 'origrecord' && key !== 'fullrecord' && key.indexOf('RemoveExp') === -1) {
                        if (item[key] !== '') {
                            const preFieldLabel = key.indexOf('þAttachment') > -1 ? key.replace(/þAttachment/g, '') : (key.indexOf('þMoney') > -1 ? key.replace(/þMoney/g, '') : key);
                            const fieldLabel = preFieldLabel.replace(/_/g, ' ');
                            const fieldChanges = `${fieldLabel}: ${item[key]}<br>`;
                            fieldChangesContent += fieldChanges;
                        }
                    }
                }
                divComment.innerHTML = fieldChangesContent.replace(/<br>$/, '');
                if (this.pdf === false) {
                    let br = divComment.querySelectorAll('br');
                    td4.appendChild(divComment);
                    if (br.length > 2) {
                        requestAnimationFrame(() => {
                            gf_applyClampline({ element: td4, force: true, show: false });
                        });
                    }
                } else {
                    td4.innerHTML = fieldChangesContent.replace(/<br>$/, '');
                }
                td5.appendChild(detailsLink);
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                console.log('this.pdf', this.pdf)
                if (this.pdf === false) {
                    tr.appendChild(td5);
                }
                tbody.appendChild(tr);
                detailsLink.addEventListener('click', () => {
                    this.viewDetails(item.fullrecord);
                });
                const tltElements = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                tltElements.map((element) => {
                    return new bootstrap.Tooltip(element);
                });
            }
        });
        return this.configureDataTables();
    }

    viewDetails(item) {
        let bodyContents = '';
        for (const key in item) {
            if (key.indexOf('fk_table') === -1 && key !== 'dataid' && key !== 'prevdataid' && key !== 'subscribername' && key !== 'entrydate' && key !== 'tablename' && key !== 'username' && key !== 'positionname' && key.indexOf('RemoveExp') === -1) {
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
            document.getElementById('history-table').classList.add('convertTable');
            if ($.fn.DataTable.isDataTable('#history-table') === false) {
                const dtCallback = (() => {
                    this.reConfigureClamplineHeight();
                })
                configureDT('Details');
                setTimeout(() => {
                    dtCallback();
                }, 350);
                $('#history-table').on('draw.dt', () => {
                    dtCallback();
                });
            }
            wcd.loading.hide();
        }
    }
}

wcd.addMod({
    id: 'history',
    name: 'WAYCDIS History',
    entities: [],
    version: '0.1'
});

document.addEventListener("DOMContentLoaded", function () {
    let defaultElement = document.querySelector('#wcd-history');
    if (defaultElement && defaultElement.dataset.wcdView) {
        let children = false;
        if (defaultElement.dataset.wcdChildren) children = true;
        let pdf = false;
        if (defaultElement.dataset.wcdPDF) pdf = true;
        wcd.history = new WcdHistory({
            element: defaultElement,
            view: defaultElement.dataset.wcdView,
            pdf: pdf,
            children: children
        });
    }
    
});

// Add following code to the view.
/* wcd.history = new WcdHistory(
    '', // The element in which the history element will be added after.
    '', // Parent API view.
    '', // Header element id.
    '', // PDF status, returns 'true' or 'false'.
    true // Include children (False excludes any children records).
); */