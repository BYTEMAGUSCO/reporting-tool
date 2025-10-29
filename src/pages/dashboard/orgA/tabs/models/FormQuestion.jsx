import { v4 as uuid } from 'uuid';

class FormQuestion {
  constructor(label = '', type = 'text', options = [], config = {}) {
    this.id = uuid();
    this.label = label;
    this.type = type;
    this.options = options;

    // ✅ Table default config
    if (type === 'table') {
      this.config = {
        columns: config.columns || [
          { key: `col_${uuid().slice(0, 8)}`, label: 'Column 1', editable: true },
        ], // array of {key, label, editable}
        rows: config.rows || 1, // default number of rows
      };
    } else {
      this.config = config;
    }
  }

  updateField(key, value) {
    if (key in this) {
      this[key] = value;
    } else {
      this.config[key] = value;
    }
  }

  // ✅ Option Methods
  addOption(option = 'New Option') {
    const types = ['multiple_choice', 'checkbox', 'dropdown'];
    if (types.includes(this.type)) {
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

  // ✅ Table Column Methods
  addColumn(label = 'New Column', editable = true) {
    if (this.type === 'table') {
      const key = `col_${uuid().slice(0, 8)}`;
      this.config.columns.push({ key, label, editable });
    }
  }

  updateColumn(index, updates = {}) {
    if (this.type === 'table' && this.config.columns[index]) {
      this.config.columns[index] = { ...this.config.columns[index], ...updates };
    }
  }

  removeColumn(index) {
    if (this.type === 'table' && this.config.columns[index]) {
      this.config.columns.splice(index, 1);
    }
  }

  toggleColumnEditable(index) {
    if (this.type === 'table' && this.config.columns[index]) {
      this.config.columns[index].editable = !this.config.columns[index].editable;
    }
  }

  // ✅ Table Row Methods
  addRow() {
    if (this.type === 'table') {
      this.config.rows += 1;
    }
  }

  removeRow() {
    if (this.type === 'table' && this.config.rows > 0) {
      this.config.rows -= 1;
    }
  }

  // ✅ Serialization
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
    instance.options = Array.isArray(data.options) ? [...data.options] : [];

    if (data.type === 'table') {
      instance.config = {
        columns:
          data.config?.columns?.map((c) => ({
            key: c.key || `col_${uuid().slice(0, 8)}`,
            label: c.label || 'Column',
            editable: c.editable ?? true,
          })) || [{ key: `col_${uuid().slice(0, 8)}`, label: 'Column 1', editable: true }],
        rows: data.config?.rows || 1,
      };
    } else {
      instance.config = data.config || {};
    }

    return instance;
  }
}

export default FormQuestion;
