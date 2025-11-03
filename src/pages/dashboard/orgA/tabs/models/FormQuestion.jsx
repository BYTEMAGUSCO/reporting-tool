import { v4 as uuid } from 'uuid';

class FormQuestion {
  constructor(label = '', type = 'text', options = [], config = {}) {
    this.id = uuid();
    this.label = label || 'New Question';
    this.type = type;
    this.options = options;

    if (type === 'table') {
      this.config = {
        // 🟢 Default columns: Question + Answer
        columns:
          Array.isArray(config.columns) && config.columns.length > 0
            ? config.columns
            : [
                { key: `col_${uuid().slice(0, 6)}`, label: 'Question', editable: true },
                { key: `col_${uuid().slice(0, 6)}`, label: 'Answer', editable: true },
              ],

        // 🟢 Always start with one row
        rows:
          Array.isArray(config.rows) && config.rows.length > 0
            ? config.rows
            : [{ label: 'Row 1' }],

        // 🟢 Default "Row Name" header
        rowHeaderLabel: config.rowHeaderLabel || 'Row Name',
      };
    } else {
      this.config = config;
    }
  }

  // ✏️ General field updater
  updateField(key, value) {
    if (key in this) this[key] = value;
    else this.config[key] = value;
  }

  // 🧩 Option handling (radio/checkbox/dropdown)
  addOption(option = 'New Option') {
    const validTypes = ['multiple_choice', 'checkbox', 'dropdown'];
    if (validTypes.includes(this.type)) {
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

  // 🧱 Table column handling
  addColumn(label = 'New Column', editable = true) {
    if (this.type !== 'table') return;
    const key = `col_${uuid().slice(0, 6)}`;
    this.config.columns.push({ key, label, editable });
  }

  updateColumn(index, updates = {}) {
    if (this.type === 'table' && this.config.columns[index]) {
      this.config.columns[index] = {
        ...this.config.columns[index],
        ...updates,
      };
    }
  }

  removeColumn(index) {
    if (this.type === 'table' && index >= 0 && index < this.config.columns.length) {
      this.config.columns.splice(index, 1);
    }
  }

  toggleColumnEditable(index) {
    if (this.type === 'table' && this.config.columns[index]) {
      this.config.columns[index].editable = !this.config.columns[index].editable;
    }
  }

  // 🧮 Table row handling
  addRow(label = null) {
    if (this.type !== 'table') return;
    if (!Array.isArray(this.config.rows)) this.config.rows = [];
    const rowCount = this.config.rows.length + 1;
    this.config.rows.push({ label: label || `Row ${rowCount}` });
  }

  removeRow(index) {
    if (this.type !== 'table') return;
    if (!Array.isArray(this.config.rows)) return;
    if (index >= 0 && index < this.config.rows.length) {
      this.config.rows.splice(index, 1);
    }
  }

  updateRowCell(rowIndex, colKey, value) {
    if (this.type !== 'table') return;
    const row = this.config.rows[rowIndex];
    if (row) {
      row[colKey] = value;
    }
  }

  // 🟡 Rename “Row Name” header
  updateRowHeaderLabel(newLabel) {
    if (this.type === 'table') {
      this.config.rowHeaderLabel = newLabel;
    }
  }

  // 🧠 Serialize to JSON
  toJSON() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      options: [...this.options],
      config: JSON.parse(JSON.stringify(this.config)),
    };
  }

  // 🪄 Recreate instance from stored data
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
            key: c.key || `col_${uuid().slice(0, 6)}`,
            label: c.label || 'Column',
            editable: c.editable ?? true,
          })) || [
            { key: `col_${uuid().slice(0, 6)}`, label: 'Question', editable: true },
            { key: `col_${uuid().slice(0, 6)}`, label: 'Answer', editable: true },
          ],

        rows: Array.isArray(data.config?.rows)
          ? [...data.config.rows]
          : [{ label: 'Row 1' }],

        rowHeaderLabel: data.config?.rowHeaderLabel || 'Row Name',
      };
    } else {
      instance.config = data.config || {};
    }

    return instance;
  }
}

export default FormQuestion;
