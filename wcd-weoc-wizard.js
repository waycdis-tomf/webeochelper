class wcdWizardStep {
    constructor({ stepNode, stepNum, wizard }) {
        this.wizard = wizard;
        this.preFunction = (!!stepNode.dataset.wcdwizpref) ? () => Promise.resolve().then(window[stepNode.dataset.wcdwizpref], () => { }) : () => Promise.resolve();
        this.postFunction = (!!stepNode.dataset.wcdwizpostf) ? () => Promise.resolve().then(window[stepNode.dataset.wcdwizpostf]) : () => Promise.resolve();
        this.compFunction = (!!stepNode.dataset.wcdwizcompf) ? () => Promise.resolve().then(window[stepNode.dataset.wcdwizcompf], () => { }) : () => Promise.resolve();
        this.nextButton = (!!stepNode.dataset.wcdwizbtnnext) ? stepNode.dataset.wcdwizbtnnext : 'Next';
        this.completeButton = (!!stepNode.dataset.wcdwizbtncomp) ? stepNode.dataset.wcdwizbtncomp : 'Complete';
        this.submitButton = (!!stepNode.dataset.wcdwizbtnsubmit) ? stepNode.dataset.wcdwizbtnsubmit : 'Submit';
        this.type = (!!stepNode.dataset.wcdwiztype) ? stepNode.dataset.wcdwiztype : 'edit';
        this.display = stepNode.style.display;
        this.bodyHeight = stepNode.style.clientHeight;
        this.title = (!!stepNode.dataset.wcdwiztitle) ? stepNode.dataset.wcdwiztitle : '';
        this.index = stepNum;
        this.enabled = true;
        this.completed = false;
        this.available = false;
        this.bodyNode = stepNode;
        stepNode.classList.add("step-body");
        let stepNodeWrapper = document.createElement("div");
        stepNodeWrapper.classList.add("step", "unavailable");
        this.node = stepNodeWrapper;

        let stepNodeContainer = document.createElement("div");
        stepNodeContainer.classList.add("step-container");

        let stepNodeHeader = document.createElement("div");
        stepNodeHeader.className = "step-header";
        this.navNode = stepNodeHeader;

        let stepNodeButton = document.createElement("button");
        stepNodeButton.setAttribute("type", "button");
        stepNodeButton.disabled = true;
        stepNodeButton.innerHTML = stepNode.dataset.wcdwiztitle;
        stepNodeButton.addEventListener("click", async () => {
            try {
                await this.wizard.currentStep.save(true, this, false);
            } catch (e) {
                console.log(e);
            }
        });
        this.navButtonNode = stepNodeButton;

        stepNodeHeader.appendChild(stepNodeButton);
        stepNodeWrapper.appendChild(stepNodeHeader);

        stepNode.parentNode.insertBefore(stepNodeWrapper, stepNode);
        stepNodeWrapper.appendChild(stepNodeContainer);
        stepNodeContainer.appendChild(stepNode);

        let stepNodeButtons = document.createElement("div");
        stepNodeButtons.classList.add("d-flex", "flex-row-reverse", "footer");
        this.footerNode = stepNodeButtons;

        let stepNodeFootButton = document.createElement("button");
        stepNodeFootButton.classList.add("btn", "btn-outline-success");
        stepNodeFootButton.setAttribute("type", "button");
        this.buttonNode = stepNodeFootButton;


        stepNodeFootButton.innerHTML = "";
        stepNodeFootButton.setAttribute("type", "button");

        stepNodeButtons.appendChild(stepNodeFootButton);
        stepNode.appendChild(stepNodeButtons);
        this.hide();
    }

    show() {
        wcd.show(this.bodyNode, true);
    }

    hide() {
        wcd.hide(this.bodyNode, 'collapse', true);
    }

    validate() {
        return wcd.validateFormData(this.node);
    }

    async save(saveConfig = true, nextStep = false, submit = false, onlySave = false) {
        try {
            if (this.completed && !this.validate()) throw 'Validation Failed';
            if (!onlySave) {
                await this.preFunction();
            }

            let formObject = wcd.getChangedValues(wcd.getFormData(this.bodyNode));

            if (wcd.dataid == '0') {
                wcd.loading.large.show("Saving...");
                if (!!document.querySelector("#wcdOnCreate")) {
                    let onlyCreate = wcd.getChangedValues(wcd.getFormData(document.querySelector("#wcdOnCreate"), true));
                    Object.assign(formObject.fields, onlyCreate.fields);
                }
            } else {
                wcd.loading.small.show("Saving...");
            }
            if (saveConfig) {
                formObject.fields.wcd_wizard = this.wizard.saveConfig(nextStep);
                document.querySelector('textarea[name="wcd_wizard"]').value = formObject.fields.wcd_wizard;
            }
            if (submit) {
                formObject.fields.wcd_wizard = '';
            }
            if (Object.keys(formObject.fields).length || Object.keys(formObject.files).length || submit) {
                if (!!document.querySelector("#wcdAlways")) {
                    Object.assign(formObject.fields, wcd.getChangedValues(wcd.getFormData(document.querySelector("#wcdAlways"), true)).fields);
                }
                if (submit) {
                    if (!!document.querySelector("#wcdOnSubmit")) {
                        Object.assign(formObject.fields, wcd.getChangedValues(wcd.getFormData(document.querySelector("#wcdOnSubmit"), true)).fields);
                    }
                }
                wcd.setOriginalData();

                await wcd.saveCurrentRecord(formObject);
                if (!onlySave) {
                    await this.postFunction();
                }
                if (nextStep) {
                    nextStep.activate();
                }
                return wcd.loading.hide();
            } else {
                if (!onlySave) {
                    await this.postFunction();
                }
                if (nextStep) {
                    nextStep.activate();
                }
                return wcd.loading.hide();
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async complete() {
        if (this.validate()) {
            try {
                await this.compFunction();
                this.completed = true;
                this.node.classList.add("complete");
                return this.wizard.nextStep(true);
            } catch (e) {
                return Promise.reject(e);
            }
        }
    }

    disable() {
        if (this.enabled) {
            this.enabled = false;
            wcd.hide(this.node, 'collapse');
        }
        this.wizard.generateSteps();
    }

    enable() {
        if (this.enabled == false) {
            this.enabled = true;
            wcd.show(this.node);
        }
        this.wizard.generateSteps();
    }

    activate(complete = false) {
        if (!!this.wizard.currentStep) {
            let oldStep = this.wizard.currentStep;
            oldStep.node.classList.remove("current");
            oldStep.navButtonNode.disabled = false;
            oldStep.hide();
        }
        this.wizard.currentStep = this;
        this.available = true;
        if (complete) {
            this.completed = true;
            this.node.classList.add("complete");
        }
        this.node.classList.add("current");
        this.node.classList.remove("unavailable");
        this.navButtonNode.disabled = true;
        this.show();
    }

    getNextStep() {
        let nextStep = false;

        for (let i = this.index + 1; i < this.wizard.steps.length; i++) {
            if (this.wizard.steps[i].enabled) {
                nextStep = this.wizard.steps[i];
                break;
            }
        }

        return nextStep;
    }

    setAction() {
        let newAction = 'Complete';
        let nextStep = this.getNextStep();
        let actionDisplay = this.completeButton;

        if (!nextStep) {
            newAction = 'Submit';
            actionDisplay = this.submitButton;
        } else if (this.completed) {
            newAction = 'Next';
            actionDisplay = this.nextButton;
        }

        if (!this.action || this.action != newAction) {

            if (!!this.action) {
                this.buttonNode.actionListener.abort();
            }
            this.buttonNode.actionListener = new AbortController();

            switch (newAction) {
                case 'Complete':
                    this.actionF = this.buttonNode.addEventListener('click', () => this.complete(), { signal: this.buttonNode.actionListener.signal });
                    break;
                case 'Submit':
                    this.buttonNode.addEventListener('click', () => this.wizard.submit(), { signal: this.buttonNode.actionListener.signal });
                    break;
                case 'Next':
                    this.buttonNode.addEventListener('click', () => this.wizard.nextStep(true), { signal: this.buttonNode.actionListener.signal });
                    break
            }

            this.buttonNode.innerHTML = actionDisplay;
            this.action = newAction;
        }
    }


}

class wcdWizard {
    constructor(mainNode) {
        this.node = mainNode;
        this.steps = [];
        this.currentStep = false;
        this.submitFunction = (!!mainNode.dataset.wcdwizsubmit) ? () => Promise.resolve().then(window[mainNode.dataset.wcdwizsubmit], () => { }) : () => Promise.resolve();
        this.submitNotification = (!!mainNode.dataset.wcdwiznotification) ? () => Promise.resolve().then(window[mainNode.dataset.wcdwiznotification], () => { }) : () => Promise.resolve();
        this.hasSavedConfig = false;

        let allStepNodes = mainNode.querySelectorAll(
            ":scope >:not(.wcdWiz-exclude):not(script)"
        );

        allStepNodes.forEach((stepNode, ind) => {
            this.steps.push(new wcdWizardStep({ stepNode: stepNode, stepNum: ind, wizard: this }));
        });
        if (this.loadConfig() == false) {
            if (wcd.dataid == 0) {
                this.steps[0].activate();
            } else {
                this.steps.forEach(step => {
                    step.activate(true);
                });
            }
        }
        this.generateSteps();
    }

    getStep(stepID) {
        let stepReturn = '';
        if (stepID.constructor === String) {
            stepReturn = this.steps.find(step => {
                return step.title.toLowerCase() == stepID.toLowerCase();
            });
        } else {
            stepReturn = this.steps[stepID];
        }
        if (!!stepReturn) {
            return stepReturn;
        } else {
            return false;
        }
    }

    generateSteps() {
        this.steps.forEach(step => {
            step.setAction();
        });
    }

    async submit() {
        try {
            let passed = true;
            this.steps.every(step => {
                if (step.enabled) {
                    if (!step.validate()) {
                        step.activate();
                        passed = false;
                        return false;
                    }
                }
                return true;
            })
            if (passed) {
                await this.currentStep.compFunction();
                await this.submitFunction();
                await this.currentStep.save(false, false, true);
                await this.submitNotification();
                return parent.pageBoard.BoardMgr.ReturnView();
            } else {
                return false;
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async nextStep(saveConfig = false) {
        try {
            await this.currentStep.save(saveConfig, this.currentStep.getNextStep());
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    loadConfig() {
        if ((!!wcd.originalData.fields.wcd_wizard)) {
            let wizConfig = JSON.parse(wcd.originalData.fields.wcd_wizard);
            wizConfig.steps.forEach((step, index) => {
                if (!!this.steps[index]) {
                    if (step.completed) {
                        this.steps[index].completed = true;
                        this.steps[index].node.classList.add("complete");
                    }
                    if (step.available) {
                        this.steps[index].available = true;
                        this.steps[index].node.classList.remove("unavailable");
                        this.steps[index].node.querySelector(".step-header button").disabled = false;
                    }
                    if (!step.enabled) {
                        this.steps[index].disable();
                    }
                }
            });
            this.steps[wizConfig.currentStep].activate()
            this.hasSavedConfig = true;
            return true;
        } else {
            return false;
        }
    }

    saveConfig(nextStep = false) {
        let config = {};
        config.currentStep = this.currentStep.index;
        if (nextStep) {
            config.currentStep = nextStep.index;
            nextStep.enabled = true;
            nextStep.available = true;
            this.currentStep.completed = true;
        }
        config.steps = [];
        this.steps.forEach((step) => {
            let stepConfig = {};
            stepConfig.completed = step.completed;
            stepConfig.enabled = step.enabled;
            stepConfig.available = step.available;
            config.steps.push(stepConfig);
        });
        return JSON.stringify(config);
    }
}

wcd.addMod({
    id: "wizard",
    name: "WAYCDIS Wizard",
    entities: [],
    version: "0.1",

    addWizard(element = document) {
        let wizardNode = element.querySelector(".wcdWiz");
        if (wizardNode) {
            if (!!this.wizard) {
                delete this.wizard;
                this.entities = [];
            }
            let wcdWiz = new wcdWizard(wizardNode);
            this.entities.push(wcdWiz);
            wcd.wizard = this.entities[0];
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    wcd.modules.wizard.addWizard();
});