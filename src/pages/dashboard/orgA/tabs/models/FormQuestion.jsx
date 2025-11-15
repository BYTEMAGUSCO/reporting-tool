import { v4 as uuid } from 'uuid';

class FormQuestion {
  constructor(label = '', type = 'text', options = [], config = {}) {
    this.id = uuid();
    this.label = label || 'New Question';
    this.type = type;
    this.options = options;

    // 🟢 TABLE TYPE
    if (type === 'table') {
      this.config = {
        columns:
          Array.isArray(config.columns) && config.columns.length > 0
            ? config.columns
            : [
                { key: `col_${uuid().slice(0, 6)}`, label: 'Question', editable: true },
                { key: `col_${uuid().slice(0, 6)}`, label: 'Answer', editable: true },
              ],
        rows:
          Array.isArray(config.rows) && config.rows.length > 0
            ? config.rows
            : [{ label: 'Row 1' }],
        rowHeaderLabel: config.rowHeaderLabel || 'Row Name',
      };
    }

    // 🟣 FOOTER TYPE
    else if (type === 'footer') {
      this.config = {
        preparedByLabel: config.preparedByLabel || 'Prepared by',
        submittedByLabel: config.submittedByLabel || 'Submitted by',
        preparedByRole: config.preparedByRole || 'Barangay Secretary',
        submittedByRole: config.submittedByRole || 'Punong Barangay',
        showDate: config.showDate ?? true,
        noteText:
          config.noteText ||
          'Note: This form is generated and submitted through the Report Management System.',
      };
    }

    // 🟡 NEW TEXT BLOCK TYPE
    else if (type === 'text_block') {
      this.config = {
        text: config.text || 'Text Block',
        alignment: config.alignment || 'left', // left | center | right
      };
      this.label = ''; // Text blocks don’t use labels
    }

    // ⚙️ DEFAULT CONFIG FOR OTHER TYPES
    else {
      this.config = config;
    }
  }

  // ✏️ GENERAL UPDATER
  updateField(key, value) {
    if (key in this) this[key] = value;
    else this.config[key] = value;
  }

  // 🧩 OPTION HANDLING
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

  // 🧱 TABLE COLUMN HANDLING
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

  // 🧮 TABLE ROW HANDLING
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

  updateRowHeaderLabel(newLabel) {
    if (this.type === 'table') {
      this.config.rowHeaderLabel = newLabel;
    }
  }

  // 🟣 FOOTER UPDATERS
  updateFooterField(key, value) {
    if (this.type !== 'footer') return;
    if (key in this.config) {
      this.config[key] = value;
    }
  }

  // 🟡 TEXT BLOCK UPDATERS
  updateTextBlockField(key, value) {
    if (this.type !== 'text_block') return;
    if (key in this.config) {
      this.config[key] = value;
    }
  }

  // 🧠 SERIALIZE
  toJSON() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      options: [...this.options],
      config: JSON.parse(JSON.stringify(this.config)),
    };
  }

  // 🪄 DESERIALIZE
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
    }

    else if (data.type === 'footer') {
      instance.config = {
        preparedByLabel: data.config?.preparedByLabel || 'Prepared by',
        submittedByLabel: data.config?.submittedByLabel || 'Submitted by',
        preparedByRole: data.config?.preparedByRole || 'Barangay Secretary',
        submittedByRole: data.config?.submittedByRole || 'Punong Barangay',
        showDate: data.config?.showDate ?? true,
        noteText:
          data.config?.noteText ||
          'Note: This form is generated and submitted through the Report Management System.',
      };
    }

    else if (data.type === 'text_block') {
      instance.config = {
        text: data.config?.text || 'Text Block',
        alignment: data.config?.alignment || 'left',
      };
      instance.label = '';
    }

    else {
      instance.config = data.config || {};
    }

    return instance;
  }
}

export default FormQuestion;
