class wcdSelect {
    constructor({select = false, search = false, placeholder = false, noClear = false}) {
        const eleSelect = select;
        const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value') || {};
        const selectedIndexDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex') || {};

        Object.defineProperty(eleSelect, 'selectedIndex', {
            configurable: true,
            enumerable: selectedIndexDescriptor.enumerable,
            get: selectedIndexDescriptor.get,
            set: function(newValue) {
                let oldValue = this.selectedIndex;
                // Call the original behavior first
                selectedIndexDescriptor.set.call(this, newValue);
                if (oldValue !== newValue) {
                    this.dispatchEvent(new Event('change'));
                }
            }
        });
        
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
                        return (!!option.value || (option.hasAttribute('value') && !option.value)) ? option.value : option.text;
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
        
        this.active = false;
        this.search = search;
        this.select = select;
        this.filter = false;
        this.hasDefaultText = false;
        this.addedEmpty = false;
        if (this.select.querySelector('option[data-hash]')) this.filter = true;
        this.placeholder = placeholder;
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('wcd-select-wrapper');
        this.valueWrapper = document.createElement('div');
        this.valueWrapper.classList.add('wcd-select-value-wrapper');
        this.valueWrapper.classList.add(...this.select.classList);
        this.value = document.createElement('div');
        let selectedOptions = this.select.querySelectorAll('option[selected]');
        let hasEmpty = false;
        this.select.querySelectorAll('option').forEach(option=> {
            if (option.hasAttribute('value') && !option.value && !!option.innerText && this.filter) {
                this.hasDefaultText = option.innerText;
            } else if (!option.value && !option.innerText) {
                hasEmpty = option;
            }
        });
        if (!!this.hasDefaultText && hasEmpty) {
            hasEmpty.remove();
            hasEmpty = true;
        }
        let arrTextValue = [];
        if (!hasEmpty && !this.hasDefaultText && this.placeholder) {
            let mockOption = document.createElement('option', {value: ''});
            this.select.prepend(mockOption);
            this.addedEmpty = true;
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
            } else if (!!this.hasDefaultText) {
                arrTextValue.push(this.hasDefaultText);
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
        
        this.valueWrapper.appendChild(this.valueClear);
        this._onValueClearClick = (event) => {
            this.select.value = '';
        };
        this.valueClear.addEventListener('click', this._onValueClearClick);
        this.wrapper.appendChild(this.valueWrapper);
        if (search) {
            this.search = document.createElement('div');
            this.search.classList.add('search');
            this.drop.appendChild(this.search);
        }
        this.drop.appendChild(this.menu);
        this.wrapper.appendChild(this.drop);

        this.refreshOptions(true);
        this.refreshSelect();

        this._onValueWrapperClick = (event) => {
            if (!this.valueClear.contains(event.target)) this.toggle();
        };
        this.valueWrapper.addEventListener('click', this._onValueWrapperClick);

        this._onDocumentClick = (event) => {
            if ((!this.wrapper.contains(event.target)) && this.active) {
                this.toggle();
            }
        };
        document.addEventListener("click", this._onDocumentClick);

        this._onSelectChange = (event) => {
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
            this.refreshSelect();
        };
        this.select.addEventListener('change', this._onSelectChange);

        this.refreshObserver = new MutationObserver((mutations, observer) => {
            this.refreshOptions();
            this.setValue();
            this.refreshSelect();
        });

        this.refreshObserver.observe(this.select, {
            attributes: true,
            attributeFilter: ['disabled','required','readonly','value'],
            childList: true,
            subtree: true
        });

        // NOTE: per-instance property redefinitions were removed in favor of
        // a single prototype augmentation applied once after the class.

    }

    refreshSelect() {
        this.readonly = (this.select.hasAttribute('readonly') && this.select.getAttribute('readonly') != 'false');
        this.disabled = ((this.select.hasAttribute('disabled') && this.select.getAttribute('disabled') != 'false') || this.select.disabled == true);
        this.required = ((this.select.hasAttribute('required') && this.select.getAttribute('required') != 'false') || this.select.required == true);

        if (this.disabled) {
            this.valueWrapper.classList.add('disabled');
            this.valueWrapper.classList.remove('readonly');
        } else if (this.readonly) {
            this.valueWrapper.classList.add('readonly');
            this.valueWrapper.classList.remove('disabled');
        } else {
            this.valueWrapper.classList.remove('readonly','disabled');
        }
        if (this.required || this.readonly || this.disabled || (this.filter && !this.hasDefaultText)) {
            this.valueClear.style.setProperty('display', 'none', 'important');
        } else {
            if (this.select.value == '') {
                this.valueClear.style.setProperty('display', 'none', 'important');
            } else {
                this.valueClear.style.display = '';
            }
        }
    }

    refreshSearch() {
        this.search.innerHTML = '';
        if (typeof wcd != 'undefined') {
            wcd.modules.search.addSearch({search: this.search, container: this.menu, targets: '.option-wrapper', subTarget: '.option', dataAttributes: ['value']})
        } else {
            let searchElement = this.search;
            let container = this.menu;
            let targetSelector = '.option-wrapper';
            let subTargetSelector = '.option';
            let dataAttributes = ['value'];
            if (!!searchElement && targetSelector) {
                this.container = container;
                this.targets = [];
                this.container.querySelectorAll(`${targetSelector}`).forEach(target => {
                    let objTarget = {
                        element: target,
                        display: target.style.display,
                        values: []
                    };
                    if (!!target.innerText) objTarget.values.push(target.innerText.toLowerCase());
                    if (!!target.value) objTarget.values.push(target.value.toLowerCase());
                    dataAttributes.forEach(attName => {
                        if (!!target.dataset[attName]) objTarget.values.push(target.dataset[attName].toLowerCase());
                    });
                    if (!!subTargetSelector) {
                        let subTarget = target.querySelector(`${subTargetSelector}`);
                        if (!!subTarget) {
                            if (!!subTarget.value) objTarget.values.push(subTarget.value.toLowerCase());
                            dataAttributes.forEach(attName => {
                                if (!!subTarget.dataset[attName]) objTarget.values.push(subTarget.dataset[attName].toLowerCase());
                            });
                        }
                    }
                    this.targets.push(objTarget);
                });

                if (!this.searcher) {
                    this.searcher = document.createElement('input');
                    this.searcher.type = 'text';
                    this.searcher.placeholder = 'Search...';
                    this.searcher.classList.add('form-control');
                    this.searcher.classList.add(...this.search.classList);

                    this._onSearchKeyup = (event) => {
                        const q = (this.searcher.value || '').toLowerCase();
                        this.targets.forEach(target => {
                            let matched = false;
                            target.values.some(value => {
                                if (value.includes(q)) {
                                    matched = true;
                                    return true;
                                }
                            });
                            if (matched) {
                                target.element.style.display = target.display;
                            } else {
                                target.element.style.setProperty('display', 'none', 'important');
                            }
                        });
                    };

                    this._debouncedOnSearchKeyup = this.debounce(this._onSearchKeyup, 150);
                    this.searcher.addEventListener('keyup', this._debouncedOnSearchKeyup);
                    this.search.appendChild(this.searcher);
                } else {
                    // ensure searcher is attached and updated
                    this.search.appendChild(this.searcher);
                }
            }
        }
    }

    debounce(fn, wait) {
        let timeout = null;
        const debounced = (...args) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                timeout = null;
                fn.apply(this, args);
            }, wait);
        };
        debounced.cancel = () => {
            if (timeout) clearTimeout(timeout);
            timeout = null;
        };
        return debounced;
    }

    refreshOptions(initial = false) {
        this.menu.innerHTML = '';
        this.options = [];
        const frag = document.createDocumentFragment();
        this.select.querySelectorAll('option').forEach((option, ind) => {
            let opVal = (option.hasAttribute('value')) ? option.value : option.innerText;
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
                    objOption.wrapper.dataset.value = opVal;
                    objOption.element.innerText = option.innerText;
                    objOption.element.dataset.value = opVal;
                    objOption.icon.style.display = 'none';
                    objOption.icon.classList.add('option-check');
                    objOption.icon.innerText = '✓';
                    objOption.element.classList.add('option', 'flex-fill');
                    if ((initial && option.hasAttribute('selected') && option.getAttribute('selected') != 'false') || (!initial && option.selected)) {
                        objOption.icon.style.display = '';
                        objOption.wrapper.classList.add('bg-success-subtle');
                        objOption.selected = true;
                    }

                    objOption.wrapper.appendChild(objOption.element);
                    objOption.wrapper.appendChild(objOption.icon);
                    frag.appendChild(objOption.wrapper);
                }
                this.options.push(objOption);
            } else if (option.hasAttribute('value') && !option.value && !!option.innerText) {
                this.placeholder = option.innerText;
            } else if (!option.hasAttribute('value') && !option.innerText && !option.hasAttribute('data-hash') && !this.addedEmpty) {
                option.remove();
            }
        });
        this.menu.appendChild(frag);

        // Add delegated click handler to menu to avoid per-option listeners
        if (!this._onMenuClick) {
            this._onMenuClick = (event) => {
                const wrapper = event.target.closest && event.target.closest('.option-wrapper');
                if (!wrapper || !this.menu.contains(wrapper)) return;
                const val = wrapper.dataset.value;
                if (!val) return;
                const option = this.options.find(o => o.value === val);
                if (option) this.selectOption(option);
            };
            this.menu.addEventListener('click', this._onMenuClick);
        }
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
            this.refreshSelect();
        }
    }

    toggle() {
        if (this.active) {
            this.active = false;
            this.drop.style.setProperty('display', 'none', 'important');
            this.wrapper.classList.remove('select-active');
        } else {
            if (!this.readonly) {
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

                this.drop.style.display = '';
            }
            this.active = true;
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

    destroy() {
        try { if (this.refreshObserver) this.refreshObserver.disconnect(); } catch (e) {}
        try { document.removeEventListener('click', this._onDocumentClick); } catch (e) {}
        try { if (this.valueClear && this._onValueClearClick) this.valueClear.removeEventListener('click', this._onValueClearClick); } catch (e) {}
        try { if (this.valueWrapper && this._onValueWrapperClick) this.valueWrapper.removeEventListener('click', this._onValueWrapperClick); } catch (e) {}
        try { if (this.select && this._onSelectChange) this.select.removeEventListener('change', this._onSelectChange); } catch (e) {}
        try { if (this.searcher && this._debouncedOnSearchKeyup) this.searcher.removeEventListener('keyup', this._debouncedOnSearchKeyup); } catch (e) {}
        try { if (this._debouncedOnSearchKeyup && this._debouncedOnSearchKeyup.cancel) this._debouncedOnSearchKeyup.cancel(); } catch (e) {}

        // restore native descriptors by removing the instance-created properties (they were configurable)
        try { if (this._eleSelect) { delete this._eleSelect.value; delete this._eleSelect.required; delete this._eleSelect.disabled; } } catch (e) {}

        // Replace wrapper with original select in the DOM if still present
        try {
            if (this.wrapper && this.select && this.wrapper.parentNode) {
                this.wrapper.replaceWith(this.select);
            }
        } catch (e) {}

        try { if (this.menu && this._onMenuClick) this.menu.removeEventListener('click', this._onMenuClick); } catch (e) {}

        // Null out references to help GC
        this.refreshObserver = null;
        this._onDocumentClick = null;
        this._onValueClearClick = null;
        this._onValueWrapperClick = null;
        this._onSelectChange = null;
        this._onSearchKeyup = null;
        this._debouncedOnSearchKeyup = null;
        this._eleSelect = null;
        this._valueDescriptor = null;
        this._requiredDescriptor = null;
        this._disabledDescriptor = null;
        this.wrapper = null;
        this.valueWrapper = null;
        this.value = null;
        this.valueClear = null;
        this.drop = null;
        this.menu = null;
        this.options = null;
        this.search = null;
        this.searcher = null;
        this.targets = null;
        this.select = null;
    }
}

    const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    

if (typeof wcd != 'undefined') {
    wcd.addMod({
        id: "select",
        name: "WAYCDIS Select",
        entities: [],
        version: "0.1",

        addSelects(element = document) {
            element.querySelectorAll('select.wcd-select').forEach(select => {
                let search  = false;
                if (!!select.dataset.wcdSearchable) search = true;
                wcd.select.entities.push(new wcdSelect({
                    select: select,
                    search: (!!select.dataset.wcdSearchable || select.classList.contains('wcd-searchable')),
                    placeholder: (!!select.dataset.wcdPlaceholder) ? select.dataset.wcdPlaceholder : (!!select.title) ? select.title : false,
                    noClear: (!!select.dataset.wcdNoclear || !!select.classList.contains('wcd-noclear'))
                }));
            });
        }
    });
    wcd.select = wcd.modules.select;

    document.addEventListener("DOMContentLoaded", () => {
        if (!!wcd.select) {
            wcd.select.addSelects();
        }
    });
} else {
    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll('select.wcd-select').forEach(select => {
            new wcdSelect({
                select: select,
                search: (!!select.dataset.wcdSearchable || select.classList.contains('wcd-searchable')),
                placeholder: (!!select.dataset.wcdPlaceholder) ? select.dataset.wcdPlaceholder : (!!select.title) ? select.title : false,
                noClear: (!!select.dataset.wcdNoclear || !!select.classList.contains('wcd-noclear'))
            });
        });
    });
}

