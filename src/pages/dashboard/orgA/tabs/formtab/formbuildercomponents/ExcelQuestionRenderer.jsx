import { Box, TextField, Typography, IconButton, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

const ExcelQuestionRenderer = ({ q, mode, answers, setAnswers, updateColumnLabel, addRow, removeRow }) => {
  const isDisabled = mode !== 'submit';
  const { columns = [], rows = [] } = q.config || {};

  const [editingColumn, setEditingColumn] = useState(null);
  const [tempColumnLabel, setTempColumnLabel] = useState('');

  const handleCellChange = (rowIndex, colKey, value) => {
    setAnswers((prev) => {
      const currentTable = prev?.[q.id] ?? {};
      const newTable = {
        ...currentTable,
        [rowIndex]: {
          ...(currentTable[rowIndex] ?? {}),
          [colKey]: value,
        },
      };
      return { ...prev, [q.id]: newTable };
    });
  };

  const startEditColumn = (index, label) => {
    setEditingColumn(index);
    setTempColumnLabel(label);
  };

  const saveEditColumn = (index) => {
    if (updateColumnLabel) updateColumnLabel(q.id, index, tempColumnLabel);
    setEditingColumn(null);
  };

  return (
    <Box mt={3} p={2} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
      <Typography variant="body1" fontWeight={600} mb={1}>
        {q.label}
      </Typography>

      <Box sx={{ overflowX: 'auto' }}>
        {/* Column Headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `120px repeat(${columns.length}, 1fr)`,
            borderBottom: '2px solid #ccc',
            mb: 1,
          }}
        >
          <Box></Box>

          {columns.map((col, i) => (
            <Box
              key={i}
              sx={{
                fontWeight: 600,
                p: 1,
                textAlign: 'center',
                borderLeft: '1px solid #ccc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {mode === 'edit' && col.editable ? (
                editingColumn === i ? (
                  <>
                    <TextField
                      value={tempColumnLabel}
                      onChange={(e) => setTempColumnLabel(e.target.value)}
                      variant="standard"
                      size="small"
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
                  </>
                )
              ) : (
                col.label
              )}
            </Box>
          ))}
        </Box>

        {/* Data Rows */}
        {rows.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(${columns.length}, 1fr) 50px`,
              borderBottom: '1px solid #e0e0e0',
              alignItems: 'center',
            }}
          >
            <Box sx={{ fontWeight: 500, p: 1 }}>{row.label}</Box>

            {columns.map((col, colIndex) => {
              const colKey = col.key;
              const value = answers?.[q.id]?.[rowIndex]?.[colKey] ?? '';
              const readOnly = isDisabled || col.editable === false;

              return (
                <Box key={colIndex} sx={{ p: 1, borderLeft: '1px solid #eee' }}>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={value}
                    onChange={(e) => handleCellChange(rowIndex, colKey, e.target.value)}
                    disabled={readOnly}
                    inputProps={{ sx: { textAlign: 'center' } }}
                  />
                </Box>
              );
            })}

            {/* Row Delete Button */}
            {mode === 'edit' && (
              <IconButton onClick={() => removeRow(q.id, rowIndex)} color="error">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        {/* Add Row Button */}
        {mode === 'edit' && (
          <Box mt={2}>
            <Button onClick={() => addRow(q.id)} variant="outlined">
              ➕ Add Row
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExcelQuestionRenderer;
