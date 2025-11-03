import { Box, TextField, Typography, IconButton, Button, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

const ExcelQuestionRenderer = ({
  q,
  mode = "preview",
  answers,
  setAnswers,
  updateColumnLabel,
  toggleColumnEditable,
  addRow,
  removeRow,
  updateRowLabel,
  updateRowHeaderLabel,
  updateQuestionLabel, // 🟢 new prop
}) => {
  const isSubmitMode = mode === "submit";
  const isEditMode = mode === "edit";

  const config = q.config ?? {};
  const columns = Array.isArray(config.columns) ? config.columns : [];
  const rows = Array.isArray(config.rows) ? config.rows : [];

  const [editingTableName, setEditingTableName] = useState(false);
  const [tempTableName, setTempTableName] = useState(q.label || "Table");

  const [editingColumn, setEditingColumn] = useState(null);
  const [tempColumnLabel, setTempColumnLabel] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [tempRowLabel, setTempRowLabel] = useState("");
  const [editingRowHeader, setEditingRowHeader] = useState(false);
  const [tempRowHeaderLabel, setTempRowHeaderLabel] = useState(config.rowHeaderLabel || "Row Name");

  const fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';

  const handleCellChange = (rowIndex, colKey, value) => {
    if (!setAnswers) return;
    setAnswers((prev) => {
      const current = prev?.[q.id] ?? {};
      const updated = {
        ...current,
        [rowIndex]: {
          ...(current[rowIndex] ?? {}),
          [colKey]: value,
        },
      };
      return { ...prev, [q.id]: updated };
    });
  };

  const saveTableName = () => {
    if (updateQuestionLabel && isEditMode) {
      updateQuestionLabel(q.id, tempTableName);
    }
    setEditingTableName(false);
  };

  const startEditColumn = (index, label) => {
    if (!isEditMode) return;
    setEditingColumn(index);
    setTempColumnLabel(label);
  };

  const saveEditColumn = (index) => {
    if (updateColumnLabel && isEditMode) {
      updateColumnLabel(q.id, index, tempColumnLabel);
    }
    setEditingColumn(null);
  };

  const startEditRow = (index, label) => {
    if (!isEditMode) return;
    setEditingRow(index);
    setTempRowLabel(label);
  };

  const saveEditRow = (index) => {
    if (updateRowLabel && isEditMode) {
      updateRowLabel(q.id, index, tempRowLabel);
    }
    setEditingRow(null);
  };

  const saveRowHeaderLabel = () => {
    if (updateRowHeaderLabel && isEditMode) {
      updateRowHeaderLabel(q.id, tempRowHeaderLabel);
    }
    setEditingRowHeader(false);
  };

  return (
    <Box
      mt={3}
      p={2}
      sx={{
        border: "1px solid #ddd",
        borderRadius: 2,
        background: "#fff",
        fontFamily,
      }}
    >
      {/* 🟣 Editable Table Title */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        {editingTableName ? (
          <>
            <TextField
              variant="standard"
              value={tempTableName}
              onChange={(e) => setTempTableName(e.target.value)}
              size="small"
              autoFocus
              inputProps={{ sx: { fontFamily } }}
            />
            <IconButton size="small" onClick={saveTableName}>
              <CheckIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ fontFamily, flexGrow: 1 }}
            >
              {q.label || "Table"}
            </Typography>
            {isEditMode && (
              <IconButton
                size="small"
                onClick={() => {
                  setEditingTableName(true);
                  setTempTableName(q.label);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </>
        )}
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        {/* 🧱 Column Headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `140px repeat(${columns.length}, 1fr)`,
            borderBottom: "2px solid #ccc",
            mb: 1,
            background: "#fafafa",
            fontFamily,
          }}
        >
          {/* 🟡 Row Header Editable */}
          <Box
            sx={{
              p: 1,
              fontWeight: 600,
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.5,
              fontFamily,
            }}
          >
            {isEditMode ? (
              editingRowHeader ? (
                <>
                  <TextField
                    value={tempRowHeaderLabel}
                    onChange={(e) => setTempRowHeaderLabel(e.target.value)}
                    variant="standard"
                    size="small"
                    inputProps={{ sx: { textAlign: "center", fontFamily } }}
                  />
                  <IconButton size="small" onClick={saveRowHeaderLabel}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  {config.rowHeaderLabel || "Row Name"}
                  <IconButton size="small" onClick={() => setEditingRowHeader(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </>
              )
            ) : (
              config.rowHeaderLabel || "Row Name"
            )}
          </Box>

          {columns.map((col, i) => (
            <Box
              key={i}
              sx={{
                fontWeight: 600,
                p: 1,
                textAlign: "center",
                borderLeft: "1px solid #ccc",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 0.5,
                fontFamily,
              }}
            >
              {isEditMode ? (
                editingColumn === i ? (
                  <>
                    <TextField
                      value={tempColumnLabel}
                      onChange={(e) => setTempColumnLabel(e.target.value)}
                      variant="standard"
                      size="small"
                      inputProps={{ sx: { textAlign: "center", fontFamily } }}
                    />
                    <IconButton size="small" onClick={() => saveEditColumn(i)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    {col.label}
                    <IconButton size="small" onClick={() => startEditColumn(i, col.label)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={col.editable}
                        onChange={() => toggleColumnEditable(q.id, i)}
                      />
                      <Typography variant="caption" sx={{ fontFamily }}>
                        editable
                      </Typography>
                    </Box>
                  </>
                )
              ) : (
                col.label
              )}
            </Box>
          ))}
        </Box>

        {/* 🧾 Data Rows */}
        {rows.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: "grid",
              gridTemplateColumns: `140px repeat(${columns.length}, 1fr) ${isEditMode ? "50px" : ""}`,
              borderBottom: "1px solid #e0e0e0",
              alignItems: "center",
              fontFamily,
            }}
          >
            {/* Row Label */}
            <Box sx={{ fontWeight: 500, p: 1, display: "flex", alignItems: "center", gap: 1 }}>
              {isEditMode ? (
                editingRow === rowIndex ? (
                  <>
                    <TextField
                      value={tempRowLabel}
                      onChange={(e) => setTempRowLabel(e.target.value)}
                      variant="standard"
                      size="small"
                      inputProps={{ sx: { fontFamily } }}
                    />
                    <IconButton size="small" onClick={() => saveEditRow(rowIndex)}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                    {row.label}
                    <IconButton size="small" onClick={() => startEditRow(rowIndex, row.label)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </>
                )
              ) : (
                row.label
              )}
            </Box>

            {/* Row Cells */}
            {columns.map((col, colIndex) => {
              const colKey = col.key;
              const value = answers?.[q.id]?.[rowIndex]?.[colKey] ?? "";
              const readOnly = isEditMode || !isSubmitMode || col.editable === false;

              return (
                <Box key={colIndex} sx={{ p: 1, borderLeft: "1px solid #eee", fontFamily }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={value}
                    disabled={readOnly}
                    onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                    inputProps={{ sx: { textAlign: "center", fontFamily } }}
                  />
                </Box>
              );
            })}

            {isEditMode && (
              <IconButton onClick={() => removeRow(q.id, rowIndex)} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        {/* ➕ Add Row */}
        {isEditMode && (
          <Box mt={2}>
            <Button onClick={() => addRow(q.id)} variant="outlined" sx={{ fontFamily }}>
              ➕ Add Row
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExcelQuestionRenderer;
