import React from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    ListItemButton,
    ListItemText,
    Stack,
} from '@mui/material';

/**
 * Picks one of the saved forms and hands it back via `onLoad(id)`.
 * The actual fetch happens in the parent so this dialog stays presentational.
 */
export default function LoadFormDialog({ open, onClose, forms, isLoading, error, onLoad }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Load a saved form</DialogTitle>
            <DialogContent>
                {isLoading ? (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
                        <CircularProgress size={20} />
                        <DialogContentText>Loading forms…</DialogContentText>
                    </Stack>
                ) : forms.length === 0 ? (
                    <DialogContentText>No saved forms available.</DialogContentText>
                ) : (
                    <List>
                        {forms.map((form) => {
                            const formId = form.id || form._id;
                            return (
                                <ListItemButton key={formId} onClick={() => onLoad(formId)}>
                                    <ListItemText
                                        primary={form.name || 'Untitled Form'}
                                        secondary={
                                            form.fields?.length
                                                ? `${form.fields.length} fields`
                                                : '0 fields'
                                        }
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
                {error && (
                    <DialogContentText color="error" sx={{ mt: 1 }}>
                        {error}
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

