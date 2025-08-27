import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, InputLabel, FormControl, Button
} from "@mui/material";

const AddEventDialog = ({
  open, onClose, onSave, newEvent, setNewEvent, barangayList, addingEvent
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Event</DialogTitle>
      <DialogContent>
        <TextField
          label="Name"
          fullWidth
          margin="dense"
          value={newEvent.name}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
          disabled={addingEvent}
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          disabled={addingEvent}
        />
        <TextField
          label="Start Date & Time"
          type="datetime-local"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={newEvent.dateStart}
          onChange={(e) => setNewEvent({ ...newEvent, dateStart: e.target.value })}
          disabled={addingEvent}
        />
        <TextField
          label="End Date & Time"
          type="datetime-local"
          fullWidth
          margin="dense"
          InputLabelProps={{ shrink: true }}
          value={newEvent.dateEnd}
          onChange={(e) => setNewEvent({ ...newEvent, dateEnd: e.target.value })}
          disabled={addingEvent}
        />
        <TextField
          label="Location"
          fullWidth
          margin="dense"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          disabled={addingEvent}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Barangay</InputLabel>
          <Select
            value={newEvent.barangay}
            onChange={(e) => setNewEvent({ ...newEvent, barangay: e.target.value })}
            disabled={addingEvent}
          >
            {barangayList.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={addingEvent}>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={addingEvent}>
          {addingEvent ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventDialog;
