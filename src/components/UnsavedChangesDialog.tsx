import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
} from "@mui/material";

export type UnsavedChangesDialogProps = {
  open: boolean;
  onClose: () => void;
  onDiscard: () => void;
  onSave: () => void;
};

const UNSAVED_BODY =
  "The changes made on this page have not been saved yet. Leaving this page without saving will discard the changes.";

export default function UnsavedChangesDialog({
  open,
  onClose,
  onDiscard,
  onSave,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="unsaved-changes-dialog-title"
      aria-describedby="unsaved-changes-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle component="div">
        <h2 id="unsaved-changes-dialog-title">Unsaved changes</h2>
        <IconButton aria-label="Close" onClick={onClose} color="inherit" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="unsaved-changes-dialog-description" component="span">
          {UNSAVED_BODY}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={({ tokens: t }) => ({
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: t.core.spacing["2"].value,
          px: 3,
          pb: 2,
        })}
      >
        <Button variant="text" color="primary" size="medium" onClick={onClose}>
          Close
        </Button>
        <Stack direction="row" gap={1} sx={{ flexWrap: "wrap" }}>
          <Button variant="text" color="primary" size="medium" onClick={onDiscard}>
            Discard
          </Button>
          <Button variant="contained" color="primary" size="medium" onClick={onSave}>
            Save changes
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
