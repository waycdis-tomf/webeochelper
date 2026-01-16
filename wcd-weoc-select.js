class wcdSelect {
    constructor({select = false, search = false}) {
        this.active = false;
        this.search = search;
        this.select = select;
        this.placeholder = this.select.dataset.wcdPlaceholder;
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('wcd-select-wrapper');
        this.valueWrapper = document.createElement('div');
        this.valueWrapper.classList.add('wcd-select-value-wrapper');
        this.valueWrapper.classList.add(...this.select.classList);
        this.value = document.createElement('div');
        let selectedOptions = this.select.querySelectorAll('option[selected]');
        let hasEmpty = false;
        this.select.querySelectorAll('option[value=""]').forEach(option=> {
            if (!option.innerText) hasEmpty = true;
        });
        let arrTextValue = [];
        if (!hasEmpty) {
            let mockOption = document.createElement('option', {value: ''});
            this.select.prepend(mockOption);
        }
        if (selectedOptions.length > 0) {
            selectedOptions.forEach(option=> {
                arrTextValue.push(option.innerText);
            });
        } else {
            this.select.value = '';
            if (!!this.placeholder) {
                arrTextValue.push(this.placeholder);
                this.value.opacity = this.value.style.opacity;
                this.value.style.opacity = '.5';
            }
        }
        this.value.innerText = arrTextValue.join(',');
        this.value.classList.add('wcd-select-value');
        this.valueClear = document.createElement('div');
        this.valueClear.innerText = 'x';
        this.valueClear.classList.add('wcd-select-value-clear');
        this.drop = document.createElement('div');
        this.drop.classList.add('wcd-drop');
        this.drop.style.display = 'none';
        this.menu = document.createElement('div');
        this.menu.classList.add('wcd-menu');
        this.options = [];
        this.multiple = this.select.multiple;

        select.before(this.wrapper);
        this.wrapper.appendChild(select);

        this.valueWrapper.appendChild(this.value);
        if (!this.select.required) {
            if (selectedOptions.length < 1) {
                this.valueClear.style.setProperty('display', 'none', 'important');
            }
            this.valueWrapper.appendChild(this.valueClear);
            this.valueClear.addEventListener('click', event => {
                this.select.value = '';
            });
        }
        this.wrapper.appendChild(this.valueWrapper);
        if (search) {
            this.search = document.createElement('div');
            this.drop.appendChild(this.search);
        }
        this.drop.appendChild(this.menu);
        this.wrapper.appendChild(this.drop);

        this.refreshOptions(true);

        this.valueWrapper.addEventListener('click', event => {
            if (!this.valueClear.contains(event.target)) this.toggle();
        });

        document.addEventListener("click", (event) => {
            if ((!this.wrapper.contains(event.target)) && this.active) {
                this.toggle();
            }
        });

        this.select.addEventListener('change', event => {
            let arrValue = this.select.value.split(',');
            this.options.forEach((option) => {
                if (!option.disabled) {
                    if (!(option.selected) && arrValue.includes(option.value)) {
                        this.selectOption(option, false);
                    } else if (option.selected && !(arrValue.includes(option.value))) {
                        this.selectOption(option, false);
                    }
                }
            });
        });

        const refreshObserver = new MutationObserver((mutations, observer) => {
            this.refreshOptions();
            this.setValue();
        });

        refreshObserver.observe(this.select, {
            attributes: true,
            properties: true,
            childList: true,
            subtree: true,
            characterData: true
        });

        const eleSelect = this.select;

        // Get the original descriptor from the prototype
        const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');

        // Define a new property only for this instance
        Object.defineProperty(eleSelect, 'value', {
            get: function () {
                if (this.multiple) {
                    let arrValue = [];
                    this.querySelectorAll('option:checked').forEach(option => {
                        arrValue.push((!!option.value) ? option.value : option.text);
                    });
                    return arrValue.join(',');
                } else {
                    let option = this.querySelector('option:checked');
                    if (!option) {
                        return '';
                    } else {
                        return (!!option.value) ? option.value : option.text;
                    }
                }
            },
            set: function (newValue) {
                if (!newValue) newValue = '';
                let oldValue = this.value;
                valueDescriptor.set.call(this, newValue);
                if (!!newValue && newValue.indexOf(',') > -1 && this.multiple) {
                    let arrValues = newValue.split(',');
                    this.querySelectorAll('option').forEach(option => {
                        option.selected = false;
                        arrValues.some((value, ind) => {
                            if (value == ((!!option.value) ? option.value : option.text)) {
                                option.selected = true;
                                arrValues.splice(ind, 1);
                                return true;
                            }
                        });
                    });
                }
                if (oldValue !== newValue) {
                    this.dispatchEvent(new Event('change'));
                }
            },
            configurable: true,
            enumerable: valueDescriptor.enumerable
        });

    }

    refreshSearch() {
        this.search.innerHTML = '';
        wcd.modules.search.addSearch({search: this.search, container: this.menu, targets: '.option-wrapper', subTarget: '.option', dataAttributes: ['value']})
    }

    refreshOptions(initial = false) {
        this.menu.innerHTML = '';
        this.options = [];
        this.select.querySelectorAll('option').forEach((option, ind) => {
            let opVal = (!!option.value) ? option.value : option.innerText
            if (!!opVal) {
                let objOption = {
                    text: option.innerText,
                    selected: false,
                    disabled: option.disabled
                };
                objOption.value = opVal;
                if (!option.disabled) {
                    objOption.element = document.createElement('div');
                    objOption.wrapper = document.createElement('div');
                    objOption.icon = document.createElement('div');
                    objOption.wrapper.classList.add('option-wrapper');
                    objOption.element.innerText = option.innerText;
                    objOption.element.dataset.value = opVal;
                    objOption.icon.style.display = 'none';
                    objOption.icon.classList.add('option-check');
                    objOption.icon.innerText = '✓';
                    objOption.element.classList.add('option', 'flex-fill');
                    if ((initial && option.hasAttribute('selected')) || (!initial && option.selected)) {
                        objOption.icon.style.display = '';
                        objOption.wrapper.classList.add('bg-success-subtle');
                        objOption.selected = true;
                    }

                    objOption.wrapper.appendChild(objOption.element);
                    objOption.wrapper.appendChild(objOption.icon);
                    this.menu.appendChild(objOption.wrapper);

                    objOption.wrapper.addEventListener('click', event => {
                        this.selectOption(objOption);
                    });
                }
                this.options.push(objOption);
            }
        });
        if (this.search) this.refreshSearch();
    }

    setValue(fromChange = false) {
        let arrValue = [];
        let arrText = [];

        let currentSelection = this.options.filter(option => option.selected);
        if (currentSelection) {
            if (!Array.isArray(currentSelection)) currentSelection = [currentSelection];
            currentSelection.forEach(selectOption => {
                arrValue.push(selectOption.value);
                arrText.push(selectOption.text);
            });
            let textValue = arrText.join(',');
            let value = arrValue.join(',');
            if (!textValue && !!this.placeholder) {
                textValue = this.placeholder;
                this.value.opacity = this.value.style.opacity;
                this.value.style.opacity = '.5';
            } else {
                this.value.style.opacity = '';
            }
            this.value.innerText = textValue;
            if (!fromChange) this.select.value = value;
            if (!!value) {
                this.valueClear.style.display = '';
            } else {
                this.valueClear.style.setProperty('display', 'none', 'important');
            }
        }
    }

    toggle() {
        if (this.active) {
            this.active = false;
            this.drop.style.setProperty('display', 'none', 'important');
            this.wrapper.classList.remove('select-active');
        } else {
            let screenHeight = document.documentElement.clientHeight;
            let selectPosition = this.value.getBoundingClientRect();
            let topHeight = selectPosition.top;
            let bottomHeight = screenHeight - selectPosition.bottom;
            if (topHeight > bottomHeight) {
                this.drop.style.maxHeight = (topHeight-10) + 'px';
                this.wrapper.classList.add('top');
            } else {
                this.drop.style.maxHeight = (bottomHeight-10) + 'px';
                this.wrapper.classList.remove('top');
            }

            this.active = true;
            this.drop.style.display = '';
            this.wrapper.classList.add('select-active');
        }
    }

    selectOption(option, toggle = true) {
        if (option.selected) {
            if (this.multiple) {
                option.icon.style.display = 'none';
                option.wrapper.classList.remove('bg-success-subtle');
                option.selected = false;
            } else {
                if (!toggle) {
                    option.icon.style.display = 'none';
                    option.wrapper.classList.remove('bg-success-subtle');
                    option.selected = false;
                } else {
                    this.toggle('instant');
                }
            }
        } else {
            if (!this.multiple) {
                let currentSelection = this.options.filter(option => option.selected);
                if (currentSelection) {
                    if (!Array.isArray(currentSelection)) currentSelection = [currentSelection];
                    currentSelection.forEach(selectOption => {
                        selectOption.icon.style.display = 'none';
                        selectOption.wrapper.classList.remove('bg-success-subtle');
                        selectOption.selected = false;
                    });
                }
                if (toggle) this.toggle('instant');
            }
            option.icon.style.display = '';
            option.wrapper.classList.add('bg-success-subtle');
            option.selected = true;
        }
        let fromChange = toggle ? false : true;
        this.setValue(fromChange);
    }
}

wcd.addMod({
    id: "select",
    name: "WAYCDIS Select",
    entities: [],
    version: "0.1",

    addSelects(element = document) {
        element.querySelectorAll('select.wcd-select').forEach(select => {
            let search  = false;
            if (!!select.dataset.wcdSearchable) search = true;
            wcd.select.entities.push(new wcdSelect({select: select, search: search}));
        });
    }
});
wcd.select = wcd.modules.select;

document.addEventListener("DOMContentLoaded", () => {
    if (!!wcd.select) {
        wcd.select.addSelects();
    }
});