//Object class to manipulate the loading status indicator
class wcdLoader {
    constructor(size) {
        this.size = size;
    }

    show(text = 'Loading...', element_header_id) {
        this.element = document.createElement("div");
        this.element.classList.add(this.size, 'wcdLoad');

        this.textElement = '';
        if (this.size == 'small') {
            this.textElement = document.createElement("div");
        } else {
            this.textElement = document.createElement("h1");
        }
        this.textElement.innerText = text;

        this.iconElement = document.createElement("div");
        this.iconElement.classList.add('loader');

        this.element.appendChild(this.iconElement);
        this.element.appendChild(this.textElement);

        if (this.size == 'small') {
            document.querySelector(element_header_id === false ? '#hsemaHeader' : element_header_id).appendChild(this.element);
        } else {
            document.body.appendChild(this.element);
            document.body.classList.add('wcdIsLoading');
        }
    }
}

//Object class for date-time workings
class wcdDates {
    constructor() {
        this.timezone = '';
    }
}

//This is the main WAYCDIS WebEOC library. It has the base functions for interacting with WebEOC and allows for the creation of the "wcd" object to be used.
class wcdLibrary {
    constructor({ version = "Unknown" }) {
        this.version = version; //Sets a version of the library
        this.modules = {}; //Where WCD mods get stored by ID

        this.invalidFields = false; //A global array that shows what form fields were invalid
        this.originalData = {}; //An object with all current form elements and their name and value into an object. Useful for determining values at load

        let params = new URLSearchParams(window.location.search);
        let queryParams = {};

        params.forEach((value, key) => {
            queryParams[key] = value;
        });

        // Sets various parameters based on the current WebEOC record to be used
        this.dataid = queryParams.dataid;
        this.relateddataid = queryParams.relateddataid;
        this.viewid = queryParams.viewid;
        this.tableid = queryParams.tableid;
        this.uvid = queryParams.uvid;
        this.incidentid = queryParams.incidentid;

        this.topCP = parent;
        let safeGuard = 0;
        let succeed = true;

        while (this.topCP.location.href.indexOf('controlpanel.aspx') == -1) {
            if (safeGuard >= 10) {
                succeed = false;
                break;
            }
            safeGuard += 1;
            this.topCP = this.topCP.parent;
        }

        if (succeed) {
            this.username = this.topCP.document.querySelector('#htmlUsername').innerText;
            this.positionname = this.topCP.document.querySelector('#role-switcher').innerText;
            this.incidentname = this.topCP.document.querySelector('#incident-switcher').innerText;
        } else {
            this.username = 'PDF';
            this.positionname = 'PDF';
            this.incidentname = 'PDF';
        }

        this.instanceName = window.location.pathname.split("/")[1]; //Will show the web app path on the default web site (ie, eoc7 by default)
        this.webeocURL =
            window.location.protocol +
            "//" +
            window.location.host +
            "/" +
            this.instanceName; //The main URL including instance name "http(s)://webeoc.domain.name/eoc7"
        this.bdURL = this.webeocURL + "/boards/boarddata.ashx"; //URL needed to pull board data
        this.apiURL = this.webeocURL + "/api/rest.svc/"; //URL of API service for endpoints

        document.addEventListener("DOMContentLoaded", () => {
            this.setBoardData(); //Will set additional board data on load
            this.setOriginalData(); //Sets the original data on load
        });
    }

    //Adds a WCD module into this library
    addMod(module) {
        this.modules[module.id] = module;
    }

    initLoaders() {
        this.loading = {
            large: new wcdLoader('large'),
            small: new wcdLoader('small'),

            hide() {
                if (!!wcd.loading.small.element) {
                    wcd.loading.small.element.remove();
                }
                if (!!wcd.loading.large.element) {
                    wcd.loading.large.element.remove();
                }
                document.body.classList.remove('wcdIsLoading');
            }
        };
    }

    //Refreshes originalData with everything on the screen
    setOriginalData() {
        Object.assign(this.originalData, this.getFormData(document.querySelector('body'), true));
    }

    parseJSON(jsonString) {
        return JSON.parse(jsonString, (key, value) => {
            if (value.constructor == String) {
                const dtTest = new Date(value);
                if (!isNaN(dtTest) && value == dtTest.toISOString()) {
                    return dtTest;
                } else {
                    return value;
                }
            } else {
                return value;
            }
        });
    }

    formatDT(date) {
        const formatter = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return formatter.format(date);
    }

    //Utilizes bootstrap form validation to flag all elements
    validateFormData(element = document.querySelector('body')) {
        let passed = true;
        let arrFailedValidity = [];

        let arrNodeList = [];
        element.querySelectorAll('input:not([type=search]),textarea,select').forEach(formElement => {
            let isHidden = false;
            this.getHiddenElements().forEach(hiddenElement => {
                if (hiddenElement == formElement) isHidden = true;
            });
            //if ((!formElement.dataset.wcdHiddenCt || formElement.dataset.wcdHiddenCt == 0) && !!formElement.name) {
            if (!isHidden) {
                arrNodeList.push(formElement);
            }
        });

        arrNodeList.forEach(formElement => {
            if (formElement.checkValidity()) {
                let nextSibling = formElement.nextSibling;
                if (formElement.classList.contains('selectpicker')) {
                    nextSibling = formElement.parentNode.nextSibling;
                }
                if ((!!nextSibling) && (nextSibling.constructor === HTMLDivElement) && nextSibling.classList.contains('invalid-feedback')) {
                    nextSibling.style.display = "none";
                }
            } else {
                let nextSibling = formElement.nextSibling;
                if (formElement.classList.contains('selectpicker')) {
                    nextSibling = formElement.parentNode.nextSibling;
                }
                if ((!!nextSibling) && (nextSibling.constructor === HTMLDivElement) && nextSibling.classList.contains('invalid-feedback')) {
                    nextSibling.style.display = "block";
                }

                arrFailedValidity.push(formElement);
                if (passed) passed = false;
            }
        });

        if (passed) {
            element.querySelectorAll(".invalid-alert").forEach((ele) => {
                ele.style.display = "none";
            });
            this.invalidFields = false;
            element.classList.remove("invalid", "was-validated");
        } else {
            element.querySelectorAll(".invalid-alert").forEach((ele) => {
                ele.style.display = "block";
            });
            this.invalidFields = arrFailedValidity;
            element.classList.add("invalid", "was-validated");
        }
        return passed;
    }

    //Clear's the class that applies bootstrap's form validation
    clearFormValidation(element = document.querySelector('body')) {
        element.querySelectorAll(".invalid-alert").forEach((ele) => {
            ele.style.display = "none";
        });
        this.invalidFields = false;
        element.classList.remove("was-validated");
    }

    getHiddenElements() {
        return document.querySelectorAll('.wcdHidden input:not([type=search]),.wcdHidden textarea,.wcdHidden select')
    }

    //Gets any visible form elements in the element specified
    getVisibleFormFields(element = document.querySelector('body')) {
        let arrNodeList = [];
        element.querySelectorAll('input:not([type=search]):not([type=submit]),textarea,select').forEach(formElement => {
            if (!!formElement.name) {
                let isHidden = false;
                this.getHiddenElements().forEach(hiddenElement => {
                    if (hiddenElement == formElement) isHidden = true;
                });
                //if ((!formElement.dataset.wcdHiddenCt || formElement.dataset.wcdHiddenCt == 0) && !!formElement.name) {
                if (!isHidden) {
                    arrNodeList.push(formElement);
                }
            }
        });
        return arrNodeList;
    }

    //Gets all form elements, hidden or not in the element specified
    getAllFormFields(element = document.querySelector('body')) {
        let arrNodeList = [];
        element.querySelectorAll('input:not([type=search]):not([type=submit]),textarea,select').forEach(formElement => {
            if (!!formElement.name) {
                arrNodeList.push(formElement);
            }
        });
        return arrNodeList;
    }

    //Parses elements and acquires form data from them. Will be an object with "fields" and "folders" properties
    getFormData(element = document.querySelector('body'), allFields = false) {
        let dataObject = {};
        let webeocFields = ['CSRFToken', 'files', 'positionid', 'userid', 'viewtype', 'we_incidentname', '_webeoc_hash_save', 'dataid', 'pluginrecordid', 'cmdSave', 'textFieldForIECompatibility', '_weoc_savebuttonredirect', 'board', 'table', 'view'];

        let arrFormElements = [];
        let objFiles = {};

        if (allFields) {
            arrFormElements = this.getAllFormFields(element);
        } else {
            arrFormElements = this.getVisibleFormFields(element);
        }

        arrFormElements.forEach(formElement => {
            if (webeocFields.indexOf(formElement.name) == -1 && !formElement.classList.contains('ignoreField')) {
                let value = null;
                switch (formElement.tagName.toLowerCase()) {
                    case 'input':
                        switch (formElement.type.toLowerCase()) {
                            case 'number':
                                if (!!formElement.value) value = formElement.value;
                                break;
                            case 'checkbox':
                                if (formElement.checked) value = formElement.value;
                                break;
                            case 'radio':
                                if (formElement.checked) value = formElement.value;
                                break;
                            case 'file':
                                if (formElement.files.length > 0) {
                                    objFiles[formElement.name] = formElement.files[0];
                                    value = 'file';
                                } else if (!this.originalData && !!document.querySelector('input[name="' + formElement.name + '_webeoc_existingid"]')) {
                                    value = document.querySelector('input[name="' + formElement.name + '_webeoc_existingid"]').value.split('-')[0];
                                } else if (!!wcd.files && !!wcd.files.getFile(formElement.name) && !!wcd.files.getFile(formElement.name).originalFile && !wcd.files.getFile(formElement.name).loaded) {
                                    value = '0';
                                } else if (!!this.originalData && !!this.originalData[formElement.name + '_webeoc_existingid']) {
                                    value = '0';
                                } else {
                                    value = 'file';
                                }
                                break;
                            default:
                                if (!!formElement.value) value = formElement.value;
                                break;
                        }
                        break;
                    case 'textarea':
                        if (!!formElement.value) value = formElement.value;
                        break;
                    case 'select':
                        let arrValues = [];
                        if (formElement.hasAttribute('multiple')) {
                            formElement.querySelectorAll('option:checked').forEach(option => {
                                if (!!(option.value ? option.value : option.innerText)) arrValues.push(option.value ? option.value : option.innerText);
                            });
                        } else {
                            if (!!formElement.value) arrValues.push(formElement.value);
                        }
                        if (arrValues.length > 0) value = arrValues.join(',');
                        break;
                }
                if (!dataObject[formElement.name] && value !== 'file') {
                    dataObject[formElement.name] = value;
                }
            }
        });

        return { fields: dataObject, files: objFiles };
    }

    //Gets values that are different from originalData from the formdata handed to it
    getChangedValues(formData = this.getFormData(document.querySelector('body'))) {
        let dataObject = {};
        Object.keys(this.originalData.fields).forEach(key => {
            if (!!formData.fields[key]) {
                let value = this.originalData.fields[key];
                if ((formData.fields[key] && (formData.fields[key] != value || this.dataid == 0))) {
                    dataObject[key] = formData.fields[key];
                    delete formData.fields[key];
                } else if (!formData.fields[key] && (!!value)) {
                    let newValue = null;
                    let field = document.querySelector('*[name="' + key + '"]');
                    if (field.hasAttribute('type') && field.getAttribute('type') == 'number') {
                        newValue = '0';
                    }
                    dataObject[key] = newValue;
                } else {
                    delete formData.fields[key];
                }
            }
        });
        Object.keys(formData.fields).forEach(key => {
            if ((formData.fields[key] != this.originalData.fields[key])) {
                dataObject[key] = formData.fields[key];
            }
        })
        return { fields: dataObject, files: formData.files };
    }

    //Modular JS call to emulate the idea behind jQuery's AJAX
    httpCall({
        type,//POST, GET, DELETE...
        url,
        data = false,
        user = false,
        pass = false,
        contentType = false,
        headers = false
    } = {}) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            if (user) {
                xhr.open(type, url, true, user, pass);
            } else {
                xhr.open(type, url, true);
            }

            if (contentType) xhr.setRequestHeader("Content-Type", contentType);
            if (!!headers) {
                for (let key in headers) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && 300 > xhr.status) {
                    resolve(xhr);
                } else {
                    reject(new Error(`${xhr.status}: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error("HTTP error"));

            if (type == "POST") {
                xhr.send(data);
            } else {
                xhr.send();
            }
        });
    }

    apiCall({ endpoint, data = false, filter = false, attachment = false, headers = false } = {}) {
        let type = data || filter || attachment ? "POST" : "GET";
        let body = false;
        let contentType = "application/json";

        if (type == "POST") {
            if (data) {
                body = JSON.stringify({ data: JSON.stringify(data) });
            } else if (filter) {
                if (filter.constructor === String) {
                    body = JSON.stringify({ viewFilter: filter });
                } else {
                    body = JSON.stringify({ customFilter: filter })
                        .replace("<", "&lt;")
                        .replace("&", "&amp;");
                }
            } else if (attachment) {
                body = attachment;
                contentType = false;
            }
        }

        return this.httpCall({
            type: type,
            url: this.apiURL + endpoint,
            data: body,
            contentType: contentType,
            headers: headers
        }).then(response => {
            if (!!response.responseText) {
                return JSON.parse(response.responseText);
            } else {
                return response.responseText;
            }
        });
    }

    objToFormData(obj) {
        let formData = new FormData();
        Object.keys(obj).forEach(key => {
            formData.append(key, obj[key]);
        });
        return formData;
    }

    objToQueryString(obj) {
        return new URLSearchParams(obj).toString();
    }

    async reloadElement(elementID = false) {
        if (elementID) {
            let objURLQS = this.objToQueryString({
                command: 'DATA',
                dataid: this.dataid,
                incidentid: this.incidentid,
                uvid: this.uvid,
                relateddataid: this.relateddataid,
                tableid: this.tableid,
                viewid: this.viewid
            });
            try {
                let response = await this.httpCall({
                    type: 'GET',
                    url: this.bdURL + '?' + objURLQS,
                    contentType: 'application/x-www-form-urlencoded'
                });
                let mainHTML = response.responseText.split('</' + 'head>')[1];
                mainHTML.replace('</' + 'html>', '');
                let newDocument = document.createElement('div');
                newDocument.innerHTML = mainHTML;
                if (elementID.constructor == String) {
                    elementID = [elementID];
                }
                elementID.forEach(id => {
                    let newElement = newDocument.querySelector('#' + id);
                    let oldElement = document.querySelector('#' + id);
                    let oldParent = oldElement.parentNode;
                    oldElement.outerHTML = newElement.outerHTML;
                    if (!!wcd.files) {
                        wcd.files.addFiles(oldParent.querySelector('#' + id));
                    }
                });
                return Promise.resolve();
            } catch (e) {
                return Promise.reject('Failed to load page.');
            }
        }
    }

    /* Currently Unused, saving for possible future use
    reloadElement2(elementID = false) {
      let dPrm = new Promise((resolve, reject) => {
        let callback = function(response) {
          let mainHTML = response.responseText.split('</'+'head>')[1];
          mainHTML.replace('</'+'html>', '');
          let newDocument = document.createElement('div');
          newDocument.innerHTML = mainHTML;
          let newElement = newDocument.querySelector('#' + elementID);
          let oldElement = document.querySelector('#' + elementID);
          let oldParent = oldElement.parentNode;
          oldElement.outerHTML = newElement.outerHTML;
          if (!!wcd.files) {
            wcd.files.addFiles(oldParent.querySelector('#' + elementID));
          }
          resolve();
        }
        parent.pageBoard.BoardMgr._GetBoard(parent.pageBoard.BoardMgr.IncidentID, parent.pageBoard.BoardMgr.getViewID(), null, null, null, null, null, callback)
      });
  
      return dPrm;
    }
    */

    buildModal({
        type = 'info',//info/alert/action
        title = 'Example Title',//string
        body = 'Example Body',//string/html 
        footer = [{
            text: 'Example Title',
            color: 'primary',
            icon: false
        }],//object array
        validate = false //validate fields in modal body.
    }) {
        let dPrm = new Promise((resolve, reject) => {
            let modal = document.createElement('div');
            modal.classList.add('modal');
            let modalDialog = document.createElement('div');
            modalDialog.classList.add('modal-dialog', 'modal-dialog-centered', 'modal-lg');
            let modalContent = document.createElement('div');
            modalContent.classList.add('modal-content');

            let modalHeader = document.createElement('div');
            modalHeader.classList.add('modal-header');
            let dismissButton = document.createElement('div');
            dismissButton.setAttribute("role", "button");
            dismissButton.classList.add("material-symbols-outlined");
            dismissButton.innerText = 'close';

            let modalTitle = document.createElement('span');
            modalTitle.classList.add('modal-title');
            if (!!title) {
                modalTitle.innerText = title;
            }
            modalHeader.appendChild(modalTitle);

            modalHeader.appendChild(dismissButton);
            modalContent.appendChild(modalHeader);

            let modalBody = document.createElement('div');
            modalBody.classList.add('modal-body');
            if (!!body) {
                if (body.constructor == String) {
                    modalBody.innerHTML = body;
                } else {
                    modalBody.appendChild(body);
                }
            }
            modalContent.appendChild(modalBody);

            if (type == 'action') {
                let modalFooter = document.createElement('div');
                modalFooter.classList.add('modal-footer', 'd-flex', 'justify-content-end');

                if (!!footer) {
                    footer.forEach(buttonProps => {
                        let button = document.createElement('div');
                        button.classList.add("btn", "btn-sm", "btn-outline-" + buttonProps.color, "d-flex", "align-items-center");
                        let iconCode = '';
                        if (!!buttonProps.icon) {
                            iconCode = '<i class="material-symbols-outlined me-1">' + buttonProps.icon + '</i>';
                        }
                        button.innerHTML = iconCode + '<span>' + buttonProps.text + '</span>';
                        button.addEventListener("click", () => {
                            if (validate === true) {
                                if (wcd.validateFormData(modalBody) === false) {
                                    return false;
                                } else {
                                    resolve({ button: buttonProps.text, data: wcd.getFormData(modalBody) });
                                    objModal.hide();
                                }
                            } else {
                                resolve({ button: buttonProps.text, data: wcd.getFormData(modalBody) });
                                objModal.hide();
                            }
                        });
                        modalFooter.appendChild(button);
                    });
                }

                modalContent.appendChild(modalFooter);
            }

            modalDialog.appendChild(modalContent);
            modal.appendChild(modalDialog);

            document.body.appendChild(modal);
            let objModal = new bootstrap.Modal(modal);

            objModal.show();

            modal.addEventListener('hidden.bs.modal', () => {
                resolve(false);
                objModal.dispose();
                modal.remove();
            });

            document.querySelector('.modal-backdrop.show').addEventListener("click", () => {
                objModal.hide();
            });

            this.makeDraggable(modal);

            dismissButton.addEventListener("click", () => {
                objModal.hide();
            });
        });

        return dPrm;
    }

    removeRestore(element = false) {
        let action = 'remove'; //[remove] or [restore]
        let view = false; //view name
        let removeField = false; //field name used for removed
        let dataid = false; //data id of the record
        let refreshID = false; //OPTIONAL: id of element to refresh after
        let name = ''; //OPTIONAL: the name of the particular record to identify it
        let type = 'Record';
        if (element) {
            if (!!element.dataset.rraction) {
                action = element.dataset.rraction;
            } else if (element.innerText.toLowerCase().indexOf('delete') != -1) {
                action = 'remove';
            } else if (element.innerText.toLowerCase().indexOf('history') != -1) {
                action = 'restore';
            }

            if (!!element.dataset.rrview) {
                view = element.dataset.rrview;
            }

            if (!!element.dataset.rrfield) {
                removeField = element.dataset.rrfield;
            }

            if (!!element.dataset.rrdataid) {
                dataid = element.dataset.rrdataid;
            }

            if (!!element.dataset.rrrefresh) {
                refreshID = element.dataset.rrrefresh;
            }

            if (!!element.dataset.rrname) {
                name = element.dataset.rrname;
            }

            if (!!element.dataset.rrtype) {
                type = element.dataset.rrtype;
            }

            let properAction = action.charAt(0).toUpperCase() + action.slice(1);
            let color = 'danger';

            if (action == 'restore') {
                color = 'success';
            }

            let message = '<div>Are you sure you would like to ' + action + ' this ' + type + '?</div><div>' + name + ' </div>';

            if (!!element.dataset.rrmessage) {
                message = element.dataset.rrmessage;
            }

            this.buildModal({ type: 'action', title: properAction + ' ' + type, body: message, footer: [{ text: 'Confirm', color: color, icon: 'check' }] }).then(response => {
                if (response.button == 'Confirm') {
                    this.loading.large.show('Updating record...');
                    let data = {};
                    data[removeField] = '0';
                    if (action == 'remove') {
                        data[removeField] = '1';
                    }

                    this.apiCall({ endpoint: "board/" + this.board + "/input/" + view + "/" + dataid, data: data }).then(() => {
                        if (!!parent.pageBoard) {
                            if (refreshID) {
                                this.loading.hide();
                                parent.pageBoard.BoardMgr.ReloadElement(refreshID);
                            } else {
                                parent.pageBoard.InternalReload();
                            }
                        }
                    });
                }
            });
        }
    }

    formatCurrency(amount, locale = 'en-US', currency = 'USD') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }

    makeDraggable(modalElement, droppableElements = false, dropCallBack = false) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        const dragMouseDown = (e) => {
            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        const elementDrag = (e) => {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            modalElement.style.top = (modalElement.offsetTop - pos2) + "px";
            modalElement.style.left = (modalElement.offsetLeft - pos1) + "px";
        }
        const closeDragElement = () => {
            if (dropCallBack && droppableElements) {
                dropCallBack(droppableElements);
                document.onmouseup = null;
                document.onmousemove = null;
            }
            document.onmouseup = null;
            document.onmousemove = null;
        }

        if (modalElement.querySelector('.modal-header')) {
            modalElement.querySelector('.modal-header').onmousedown = dragMouseDown;
        } else {
            modalElement.onmousedown = dragMouseDown;
        }
    }

    saveCurrentRecord(data, saveFunction = () => Promise.resolve(true)) {
        return saveFunction().then((response) => {
            let url = this.dataid == '0'
                ? "board/" + this.board + "/input/" + this.view
                : "board/" + this.board + "/input/" + this.view + "/" + this.dataid;

            let arrPromises = [];

            arrPromises.push(this.apiCall({
                endpoint: url,
                data: data.fields
            }).then(results => {
                Object.keys(data.fields).forEach(key => {
                    if (data.fields[key] == 0) {
                        if (!!wcd.files) {
                            let fileInput = wcd.files.getFile(key);
                            if (!!fileInput) {
                                fileInput.originalFile = false;
                            }
                        }
                    }
                });
                return results;
            }));

            Object.keys(data.files).forEach(key => {
                let formData = new FormData();
                formData.append('', data.files[key]);
                arrPromises.push(this.apiCall({
                    endpoint: 'board/' + this.board + '/input/' + this.view + '/' + this.dataid + '/attachments/' + key,
                    attachment: formData
                }).then(result => {
                    wcd.files.getFile(key).originalFile = true;
                }));
            });

            return Promise.all(arrPromises).then(dataid => {
                let recordID = dataid[0];
                if (this.dataid == 0) {
                    this.dataid = recordID;
                    if (!!parent.pageBoard) parent.pageBoard.BoardMgr.setRecordID(recordID);

                    let viewlinks = [];
                    document.querySelectorAll('a').forEach((ele) => {
                        if (!!ele.getAttribute('onclick') && ele.getAttribute('onclick').indexOf('parent.pageBoard.BoardMgr.OpenRelatedView') > -1) {
                            viewlinks.push(ele);
                        }
                    });

                    viewlinks.forEach((ele) => {
                        let firsthalf = ele.getAttribute('onclick').split('parent.pageBoard.BoardMgr.OpenRelatedView')[0];
                        let secondhalfsplit = ele.getAttribute('onclick').split('parent.pageBoard.BoardMgr.OpenRelatedView')[1].split(',');
                        secondhalfsplit[2] = "'" + recordID + "'";
                        let secondhalf = secondhalfsplit.join(',');
                        ele.setAttribute('onclick', firsthalf + 'parent.pageBoard.BoardMgr.OpenRelatedView' + secondhalf);
                    });

                }


                return this.dataid;
            });
        });
    }

    setBoardData() {
        let boardComment = document.querySelector("html").childNodes[0];

        if (boardComment.nodeType == 8) {
            let tempData = boardComment.data.split("\n");
            this.view = tempData[2].split(":")[1].trim();
            this.table = tempData[3].split(":")[1].trim();
            this.board = tempData[1].split(":")[1].trim();
        }
    }

    hide(passedEle, method = 'instant', stepChange = false) {
        let arrElement = [];

        if (passedEle.constructor == NodeList) {
            arrElement = passedEle;
        } else {
            arrElement.push(passedEle);
        }

        arrElement.forEach(element => {
            if (!!element.dataset.wcdTransit) {
                setTimeout(() => {
                    (() => {
                        wcd.hide(element, method, stepChange);
                    })();
                }, 250);
            } else {
                if (!stepChange) {
                    element.classList.add('wcdHidden');
                }
                if (method != 'instant') {
                    element.dataset.wcdTransit = true;
                    element.dataset.wcdBodyHeight = element.clientHeight + 'px';
                    element.dataset.wcdMaxHeight = element.style.maxHeight;
                    element.dataset.wcdTransition = element.style.transition;
                    element.dataset.wcdOverflow = element.style.overflow;
                    element.style.overflow = 'hidden';
                    setTimeout(() => {
                        (() => {
                            element.style.maxHeight = '0px';
                            delete element.dataset.wcdTransit;
                        })();
                    }, 250);
                }
                if (!element.dataset.wcdDisplay && !!element.style.display && element.style.display != 'none') {
                    element.dataset.wcdDisplay = element.style.display;
                }
                element.dataset.wcdMethod = method;
                switch (method) {
                    case 'fade':
                        element.style.transition = 'opacity 0.25s ease-out';
                        element.dataset.wcdOpacity = element.style.opacity;
                        element.style.opacity = '0';
                        break;
                    case 'collapse':
                        element.style.transition = 'max-height 0.25s ease-out';
                        element.dataset.wcdMaxHeight = element.style.maxHeight;
                        element.style.maxHeight = '0px';
                        break;
                    default:
                        element.style.display = 'none';
                        break;
                }
            }
        });
    }

    show(passedEle, stepChange = false) {
        let arrElement = [];

        if (passedEle.constructor == NodeList) {
            arrElement = passedEle;
        } else {
            arrElement.push(passedEle);
        }

        arrElement.forEach(element => {
            if (!!element.dataset.wcdTransit) {
                setTimeout(() => {
                    (() => {
                        wcd.show(element, stepChange);
                    })();
                }, 250);
            } else {
                if (!stepChange) {
                    element.classList.remove('wcdHidden');
                }
                let methodOption = (!!element.dataset.wcdMethod) ? element.dataset.wcdMethod : 'instant';
                if (methodOption != 'instant') {
                    element.style.overflow = element.dataset.wcdOverflow;
                    element.dataset.wcdTransit = true;
                    if (element.dataset.wcdMethod != 'collapse') {
                        element.style.maxHeight = element.dataset.wcdMaxHeight;
                    }
                    setTimeout(() => {
                        (() => {
                            element.style.transition = element.dataset.wcdTransition;
                            element.style.maxHeight = element.dataset.wcdMaxHeight;
                            delete element.dataset.wcdTransit;
                        })();
                    }, 250);
                }
                switch (methodOption) {
                    case 'fade':
                        element.style.opacity = element.dataset.wcdOpacity;
                        break;
                    case 'collapse':
                        element.style.maxHeight = element.dataset.wcdBodyHeight;
                        break;
                    default:
                        if (!!element.dataset.wcdDisplay) {
                            element.style.display = element.dataset.wcdDisplay;
                        } else {
                            element.style.display = null;
                        }
                        break;
                }
            }
        });
    }

    getBoardData() {
        return {
            board: this.board,
            view: this.view,
            table: this.table,
        };
    }
}

/*** Event Listeners ***/
var wcd = new wcdLibrary({
    version: "0.1",
});

wcd.addMod({
    id: "loading",
    name: "WAYCDIS Load Screen",
    version: "0.1",
    small: {},
    fullscreen: {}
});

document.addEventListener("DOMContentLoaded", () => {
    wcd.initLoaders();
    document.querySelectorAll('.wcdHidden').forEach(element => {
        wcd.hide(element);
    });
});