class wcdFile {
    constructor(input) {
        this.loaded = false;
        this.originalFile = false;
        this.name = input.name;
        this.input = input;
        this.fileid = false;
        this.removeInput = false;

        let existingNode = document.querySelector('input[name = "' + this.name + '_webeoc_existingid"]');

        if (!!existingNode) {
            this.originalFile = true;
            this.fileid = existingNode.value.split('-')[0];
            this.loaded = true;
            this.removeInput = document.querySelector('input[name = "' + this.name + '_webeoc_removal"]');
        }

        let inputWrapper = document.createElement('div');
        inputWrapper.id = this.name + '_wrapper';
        inputWrapper.classList.add('wcdAttachGrp');
        this.node = inputWrapper;
        wcd.hide(input, 'instant');

        input.parentNode.insertBefore(inputWrapper, input);
        inputWrapper.appendChild(input);

        let inputButton = document.createElement('span');
        inputButton.innerText = 'Choose File';
        inputButton.classList.add('form-control-plaintext', 'wcdAttachBtn');
        inputButton.addEventListener("click", () => {
            this.input.click();
        });
        inputWrapper.insertBefore(inputButton, input);

        let fileArea = document.createElement('div');
        fileArea.classList.add('form-control-plaintext', 'wcdAttachFileArea');

        let inputLink = document.createElement('a');
        inputLink.href = '#';
        this.linkNode = inputLink;
        inputLink.classList.add('link-primary', 'd-flex', 'align-items-center');

        let inputIcon = document.createElement('span');
        inputIcon.classList.add('material-symbols-outlined', 'me-1');
        this.icnNode = inputIcon;
        wcd.hide(inputIcon, 'instant');

        let inputStatus = document.createElement('span');
        inputStatus.innerText = 'Loading...';
        this.statusNode = inputStatus;

        inputLink.appendChild(inputIcon);
        inputLink.appendChild(inputStatus);
        fileArea.appendChild(inputLink);
        inputWrapper.appendChild(fileArea);

        let inputClear = document.createElement('span');
        inputClear.innerText = 'delete';
        inputClear.classList.add('material-symbols-outlined', 'wcdAttachClear');
        inputClear.addEventListener("click", () => {
            this.clear();
        });
        wcd.hide(inputClear, 'instant');
        this.clearNode = inputClear;
        inputWrapper.appendChild(inputClear);

        if (!!this.fileid) {
            this.linkNode.href = 'boardfile.aspx?fileid=' + this.fileid + '&tableid=' + wcd.tableid + '&fieldname=' + this.name + '&viewid=' + wcd.viewid + '&dataid=' + wcd.dataid;
            this.linkNode.target = '_blank';
            wcd.show(inputClear);
            wcd.show(inputIcon);
            wcd.files.getAttachmentInfo(this).then(result => {
                if (!!result.fileID) {
                    this.statusNode.innerText = result.fileName;
                    this.icnNode.innerText = wcd.files.returnIcon(result.fileName);
                }
            });
        } else {
            this.statusNode.innerText = 'No file chosen';
        }

        input.addEventListener("change", () => {
            if (this.input.files.length > 0) {
                wcd.show(this.clearNode);
                wcd.show(this.icnNode);
                this.loaded = true;
                if (this.removeInput) this.removeInput.value = 'false';
                this.linkNode.href = URL.createObjectURL(this.input.files[0]);
                this.linkNode.target = '_blank';
                this.icnNode.innerText = wcd.files.returnIcon(this.input.files[0].name);
                this.statusNode.innerText = this.input.files[0].name;
            }
        });
    }

    clear() {
        if (this.loaded) {
            this.loaded = false;
            this.input.value = '';
            this.input.dispatchEvent(new Event('change'));
            wcd.hide(this.clearNode);
            wcd.hide(this.icnNode);
            if (this.removeInput) {
                this.removeInput.value = 'true';
            }
            this.statusNode.innerText = 'No file chosen';
            this.linkNode.removeAttribute('target');
            this.linkNode.href = "#";
            this.linkNode
        }
    }
}

wcd.addMod({
    id: "files",
    name: "WAYCDIS Files",
    entities: [],
    version: "0.1",

    getAttachmentInfo(passedItem = false) {
        let attachObject = {};

        if (passedItem.constructor === String) {
            let arrParams = passedItem.split('?');
            arrParams = arrParams[1].split('&');
            arrParams.forEach(value => {
                if (value.split('=')[0] == 'fileid') {
                    attachObject.fileID = value.split('=')[1];
                }
            });
            attachObject.url = passedItem;
        } else {
            attachObject.fileID = passedItem.fileid;
            attachObject.url = 'boardfile.aspx?fileid=' + attachObject.fileID + '&tableid=' + wcd.tableid + '&fieldname=' + passedItem.name + '&viewid=' + wcd.viewid + '&dataid=' + wcd.dataid;
        }

        return wcd.httpCall({
            type: 'HEAD',
            url: attachObject.url
        }).then(response => {
            let content = response.getResponseHeader('Content-Disposition').split(';');
            let type = response.getResponseHeader('Content-Type');
            content.forEach(item => {
                if (item.indexOf('=') > -1) {
                    let prop = item.split('=')[0].trim();
                    let value = item.split('=')[1].replaceAll('"', '').replaceAll("'", "").trim();
                    if (prop == 'filename') {
                        attachObject.fileName = value;
                    }
                }
            });
            attachObject.fileType = type;

            return attachObject;
        });
    },

    getFile(fileName = '') {
        let result = this.entities.find(file => {
            return file.name == fileName;
        });
        if (!!result) {
            return result;
        } else {
            return false;
        }
    },

    removeFile(fileName = '') {
        const index = this.entities.findIndex(file => file.fileName == fileName);

        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    },

    returnIcon(fileName = '') {
        let fExt = fileName.split('.');
        let iconText = 'attachment';
        switch (fExt[fExt.length - 1]) {
            case 'pdf':
                iconText = 'picture_as_pdf';
                break;
            case 'doc':
            case 'docx':
                iconText = 'docs';
                break;
        }
        return iconText;
    },

    displayFile(file) {
        this.getAttachmentInfo(file.href).then(result => {
            if (!!result.fileID) {
                file.classList.add('d-flex', 'align-items-center');
                let fileName = result.fileName;
                file.innerHTML = '';
                let img = document.createElement('span');
                img.classList.add('material-symbols-outlined')
                img.innerText = this.returnIcon(fileName);
                let name = document.createElement('span');
                name.innerText = fileName;

                file.appendChild(img);
                file.appendChild(name);
            }
        });
    },

    addFiles(element = document) {
        let fileInputs = element.querySelectorAll('input.wcdAttach[type="file"]');
        fileInputs.forEach(file => {
            if (this.getFile(file.name)) {
                this.removeFile(file.name);
            }
            wcd.files.entities.push(new wcdFile(file));
        });
        let fileLinks = element.querySelectorAll('a.wcdAttach');
        fileLinks.forEach(file => {
            wcd.files.displayFile(file);
        });
    }
});
wcd.files = wcd.modules.files;

document.addEventListener("DOMContentLoaded", () => {
    if (!!wcd.files) {
        wcd.files.addFiles();
    }
});