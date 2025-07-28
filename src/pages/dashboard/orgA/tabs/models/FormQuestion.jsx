import { v4 as uuid } from 'uuid';

class FormQuestion {
  constructor(label = '', type = 'text', options = [], config = {}) {
    this.id = uuid();
    this.label = label;
    this.type = type;
    this.options = options;
    this.config = config;
  }

  updateField(key, value) {
    // Update main properties or fallback to config
    if (key in this) {
      this[key] = value;
    } else {
      this.config[key] = value;
    }
  }

  addOption(option = 'New Option') {
    const hasOptions = ['multiple_choice', 'checkbox', 'dropdown'];
    if (hasOptions.includes(this.type)) {
      this.options.push(option);
    }
  }

  updateOption(index, value) {
    if (this.options[index] !== undefined) {
      this.options[index] = value;
    }
  }

  removeOption(index) {
    if (index >= 0 && index < this.options.length) {
      this.options.splice(index, 1);
    }
  }

  toJSON() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      options: this.options,
      config: this.config,
    };
  }

  static fromJSON(data) {
    const instance = new FormQuestion();
    instance.id = data.id || uuid();
    instance.label = data.label || '';
    instance.type = data.type || 'text';
    instance.options = Array.isArray(data.options) ? data.options : [];
    instance.config = data.config || {};
    return instance;
  }
}

export default FormQuestion;
