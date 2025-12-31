class wcdSelect {
    constructor(selectNode) {
        this.active = false;
        this.select = selectNode;
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('wcd-select-wrapper');
        this.valueWrapper = document.createElement('div');
        this.valueWrapper.classList.add('wcd-select-value-wrapper');
        this.valueWrapper.classList.add(...this.select.classList);
        this.value = document.createElement('div');
        this.value.innerText = this.select.value;
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

        selectNode.before(this.wrapper);
        this.wrapper.appendChild(selectNode);

        this.valueWrapper.appendChild(this.value);
        if (!this.select.required) {
            this.valueWrapper.appendChild(this.valueClear);
            this.valueClear.addEventListener('click', event => {
                this.select.value = '';
            });
        }
        this.wrapper.appendChild(this.valueWrapper);

        this.addSearch();
        this.drop.appendChild(this.menu);
        this.wrapper.appendChild(this.drop);

        this.refreshOptions();

        this.value.addEventListener('click', event => {
            this.toggle();
        });

        document.addEventListener("click", (event) => {
            if ((!this.wrapper.contains(event.target)) && this.active) {
                this.toggle();
            }
        });

        this.select.addEventListener('change', event => {
            this.refreshOptions();
            this.setValue();
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
        const proto = HTMLSelectElement.prototype;
        const valueDescriptor = Object.getOwnPropertyDescriptor(proto, 'value');

        if (!valueDescriptor || typeof valueDescriptor.get !== 'function' || typeof valueDescriptor.set !== 'function') {
            console.error("Unable to override 'value' property.");
            return;
        }

        // Define a new property only for this instance
        Object.defineProperty(eleSelect, 'value', {
            get: function () {
                if (this.multiple) {
                    let arrValue = [];
                    this.querySelectorAll('option:checked').forEach(option => {
                        arrValue.push((!!option.value) ? option.value : objOption.text);
                    });
                    return arrValue.join(',');
                } else {
                    let option = this.querySelector('option:checked');
                    return (!!option.value) ? option.value : objOption.text;
                }
            },
            set: function (newValue) {
                let oldVal = this.value;
                valueDescriptor.set.call(this, newValue);
                if (newValue.indexOf(',') > -1 && this.multiple) {
                    let arrValues = newValue.split(',');
                    this.querySelectorAll('option').forEach(option => {
                        option.selected = false;
                        arrValues.forEach((value, ind) => {
                            if (value == ((!!option.value) ? option.value : objOption.text)) {
                                option.selected = 'yes';
                                arrValues.splice(ind, 1);
                            }
                        });
                    });
                }
                this.dispatchEvent(new Event('change'));
            },
            configurable: true,
            enumerable: valueDescriptor.enumerable
        });

    }

    addSearch() {
        this.search = document.createElement('input');
        this.search.type = 'text';
        this.search.placeholder = 'Search...';
        this.search.classList.add('wcd-search', 'form-control');

        this.search.addEventListener('keyup', event => {
            this.options.forEach(option => {
                if (option.value.includes(event.target.value.toLowerCase()) || option.text.includes(event.target.value.toLowerCase())) {
                    wcd.show(option.wrapper);
                } else {
                    wcd.hide(option.wrapper);
                }
            });
        });

        this.drop.appendChild(this.search);
    }

    refreshOptions() {
        this.menu.innerHTML = '';
        this.options = [];
        this.select.querySelectorAll('option').forEach((option, ind) => {
            if (!option.disabled) {
                let objOption = {
                    element: document.createElement('div'),
                    wrapper: document.createElement('div'),
                    icon: document.createElement('div')
                };
                objOption.wrapper.classList.add('option-wrapper');
                objOption.element.innerText = option.innerText;
                objOption.icon.style.display = 'none';
                objOption.icon.classList.add('option-check');
                objOption.icon.innerText = '✓';
                objOption.element.classList.add('option', 'flex-fill');
                objOption.text = option.innerText;
                objOption.index = ind;
                objOption.value = (!!option.value) ? option.value : objOption.text;
                objOption.selected = false;
                if (option.selected) {
                    objOption.icon.style.display = '';
                    objOption.wrapper.classList.add('bg-success-subtle');
                    objOption.selected = true;
                }

                objOption.wrapper.appendChild(objOption.element);
                objOption.wrapper.appendChild(objOption.icon);
                this.menu.appendChild(objOption.wrapper);

                objOption.element.wcdselect = objOption;
                this.options.push(objOption);

                objOption.wrapper.addEventListener('click', event => {
                    this.selectOption(objOption);
                });
            }
        });
    }

    setValue() {
        let arrValue = [];

        let currentSelection = this.options.filter(option => option.selected);
        if (currentSelection) {
            if (!Array.isArray(currentSelection)) currentSelection = [currentSelection];
            let eleOptions = this.select.querySelectorAll('option');
            eleOptions.forEach((eleOption, eleIndex) => {
                if (currentSelection.find(option => option.index == eleIndex)) {
                    if (!eleOption.selected) eleOption.selected = true;
                } else {
                    if (eleOption.selected) eleOption.selected = false;
                }
            });
            currentSelection.forEach(selectOption => {
                arrValue.push(selectOption.value);
            });
            let textValue = arrValue.join(',');
            this.value.innerText = textValue;
            if (!!textValue) {
                wcd.show(this.valueClear);
            } else {
                wcd.hide(this.valueClear);
            }
        }
    }

    toggle(type = 'fade') {
        if (this.active) {
            this.active = false;
            wcd.hide(this.drop, type);
            this.valueWrapper.classList.remove('select-active');
        } else {
            let screenHeight = document.documentElement.clientHeight;
            let selectPosition = this.value.getBoundingClientRect();
            let topHeight = selectPosition.top;
            let bottomHeight = screenHeight - selectPosition.bottom;

            console.log('screen', screenHeight, 'select top', this.value.getBoundingClientRect().top);
            console.log(topHeight, bottomHeight);

            if (topHeight > bottomHeight) {
                this.drop.style.maxHeight = topHeight + 'px';
                this.drop.classList.add('top');
            } else {
                this.drop.style.maxHeight = bottomHeight + 'px';
                this.drop.classList.remove('top');
            }

            this.drop.dataset.wcdMaxHeight = this.drop.style.maxHeight;

            this.active = true;
            wcd.show(this.drop, type);
            this.valueWrapper.classList.add('select-active');
        }
    }

    selectOption(option) {
        if (option.selected) {
            if (this.multiple) {
                option.icon.style.display = 'none';
                option.wrapper.classList.remove('bg-success-subtle');
                option.selected = false;
            } else {
                this.toggle('instant');
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
                this.toggle('instant');
            }
            option.icon.style.display = '';
            option.wrapper.classList.add('bg-success-subtle');
            option.selected = true;
        }
        this.setValue();
    }
}

wcd.addMod({
    id: "select",
    name: "WAYCDIS Select",
    entities: [],
    version: "0.1",

    addSelects(element = document) {
        element.querySelectorAll('select.wcd-select').forEach(select => {
            wcd.select.entities.push(new wcdSelect(select));
        });
    }
});
wcd.select = wcd.modules.select;

document.addEventListener("DOMContentLoaded", () => {
    if (!!wcd.select) {
        wcd.select.addSelects();
    }
});