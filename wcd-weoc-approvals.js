class wcdApproval {
    constructor({ role, index, approver = false, approvedOn = false, skipped = false, denier = false, deniedOn = false }, flow) {
        this.index = index;
        this.role = role;
        this.approver = approver;
        this.approvedOn = approvedOn;
        this.skipped = skipped;
        this.denier = denier;
        this.deniedOn = deniedOn;
        this.approvalFlow = flow;
    }

    approve() {
        if (!this.approvedOn) {
            this.approver = wcd.username;
            this.approvedOn = new Date();
            this.approvalFlow.setNextApprover();
        }
    }

    deny(reason = 'DENIED') {
        if (!this.denier) {
            this.denier = wcd.username;
            this.deniedOn = new Date();
            this.approvalFlow.nextApprover = '';
        }
    }

    skip(reason = 'N/A') {
        if (!this.skipped) {
            this.skipped = reason;
            this.approvalFlow.setNextApprover();
        }
    }

    getConfig() {
        let objConf = {
            index: this.index,
            role: this.role,
            approver: this.approver,
            approvedOn: this.approvedOn,
            skipped: this.skipped,
            denier: this.denier,
            deniedOn: this.deniedOn
        }
        return objConf;
    }
}

class wcdApprovalFlow {
    //While you only feed the textarea that stores the approval data, there will need to be an additional field to support the filtering.
    //if the main textarea is named "board_requestApproval" then the additional field should be an input type text of "board_requestApprovalNext"
    //new wcdApprovals({element: element, chain: ['Bureau Chief','Division Chief','Finance Approver'...]})
    constructor(config = {}) {
        if (!!config.element) {
            this.completedOn = false;
            this.nextApprover = false;
            this.approvalsField = config.element;
            this.nextAppField = this.approvalsField + 'Next';
            this.approvalChain = config.chain;
            this.approvals = [];
            this.nextApproval = false;

            this.approvalChain.forEach((role, index) => {
                this.addApproval(new wcdApproval({ role: role, index: index }, this));
            });
            this.setNextApprover();
        }
    }

    addApproval(objApp) {
        this.approvals.push(objApp);
    }

    getApproval(role = '') {
        if (!!role) {
            let chosenApp = false;
            this.approvals.every(approval => {
                if (approval.role == role) {
                    chosenApp = approval;
                    return false;
                } else {
                    return true;
                }
            });
            return chosenApp;
        } else {
            return false;
        }
    }

    setNextApprover() {
        this.nextApprover = false;
        this.nextApproval = false;
        this.approvals.every(approval => {
            if (!approval.approvedOn && !approval.skipped) {
                this.nextApprover = approval.role;
                this.nextApproval = approval;
                return false;
            } else {
                return true;
            }
        });
        if (!this.nextApprover) {
            this.completedOn = new Date();
        }
    }

    loadConfig(strConf) {
        let objConf = wcd.parseJSON(strConf);

        this.completedOn = objConf.completedOn;
        this.nextApprover = objConf.nextApprover;
        this.approvalsField = objConf.approvalsField;
        this.nextAppField = objConf.nextAppField;
        this.approvalChain = objConf.approvalChain;
        this.approvals = [];

        objConf.approvals.forEach((appConf) => {
            this.addApproval(new wcdApproval(appConf, this));
            if (appConf.role == this.nextApprover) {
                this.nextApproval = this.approvals[this.approvals.length - 1];
            }
        });
    }

    saveConfig() {
        if (!!this.nextAppField) {
            document.querySelectorAll('input[name="' + this.nextAppField + '"]').forEach(field => { field.value = this.nextApprover });
        }

        let tempObj = {
            completedOn: this.completedOn,
            nextApprover: this.nextApprover,
            approvalsField: this.approvalsField,
            nextAppField: this.nextAppField,
            approvalChain: this.approvalChain,
            approvals: [],
            nextApprover: this.nextApprover
        };
        this.approvals.forEach((app) => {
            tempObj.approvals.push(app.getConfig());
        });

        let objReturn = {};
        objReturn[tempObj.approvalsField] = JSON.stringify(tempObj);
        objReturn[tempObj.nextAppField] = tempObj.nextApprover;
        if (!!this.approvalsField) {
            document.querySelectorAll('textarea[name="' + this.approvalsField + '"]').forEach(field => { field.value = objReturn[tempObj.approvalsField] });
        }
        return objReturn;
    }

    showFlow(element) {
        element.innerText = '';
        let eleHeader = document.createElement('div');
        eleHeader.classList.add('row');
        let eleRole = document.createElement('div');
        eleRole.classList.add('col-4');
        eleRole.innerHTML = "<h5>Role</h5>";
        let eleApprover = document.createElement('div');
        eleApprover.classList.add('col-4');
        eleApprover.innerHTML = "<h5>Approver</h5>";
        let eleDate = document.createElement('div');
        eleDate.classList.add('col-4');
        eleDate.innerHTML = "<h5>Date</h5>";

        eleHeader.appendChild(eleRole);
        eleHeader.appendChild(eleApprover);
        eleHeader.appendChild(eleDate);

        element.appendChild(eleHeader);
        element.innerHTML += '<hr/>';

        this.approvals.forEach(approval => {
            let eleApp = document.createElement('div');
            eleApp.classList.add('row');
            if (approval.skipped) {
                eleApp.style['font-style'] = 'italic';
                eleApp.style['font-size'] = '.75rem';
            }
            if (approval.denier) {
                eleApp.style['font-weight'] = 'bold';
                eleApp.style['color'] = 'RGB(var(--bs-danger-rgb))';
            }
            let eleRole = document.createElement('div');
            eleRole.classList.add('col-4', 'role');
            eleRole.innerText = approval.role;
            let eleApprover = document.createElement('div');
            eleApprover.classList.add('col-4', 'approver');
            if (approval.approver) eleApprover.innerHTML = '<span class="approverName">' + approval.approver + '</span>';
            if (approval.skipped) eleApprover.innerText = 'N/A';
            if (approval.denier) eleApprover.innerHTML = 'DENIED - ' + approval.denier;
            let eleDate = document.createElement('div');
            eleDate.classList.add('col-4');
            if (approval.approvedOn) eleDate.innerText = wcd.formatDT(approval.approvedOn);
            if (approval.skipped) eleDate.innerText = approval.skipped;
            if (approval.deniedOn) eleDate.innerText = wcd.formatDT(approval.deniedOn);

            eleApp.appendChild(eleRole);
            eleApp.appendChild(eleApprover);
            eleApp.appendChild(eleDate);

            element.appendChild(eleApp);
            element.innerHTML += '<hr/>';
        });
        element.classList.remove('wcdApproval');
        element.classList.add('wcdApproved');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.wcdApproval').forEach(element => {
        let objApp = new wcdApprovalFlow();
        objApp.loadConfig(element.innerText);
        objApp.showFlow(element);
        wcd.approvalFlow = objApp;
    });
});