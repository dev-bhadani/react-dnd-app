import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Radio,
    RadioGroup,
    Select,
    MenuItem,
    Switch,
    Rating,
    Slider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { listForms, deleteForm, getForm, createForm, updateForm } from '../api/forms';

function FormsPage() {
    const navigate = useNavigate();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [duplicateId, setDuplicateId] = useState(null);
    const [previewForm, setPreviewForm] = useState(null);
    const [duplicateName, setDuplicateName] = useState('');
    const [renameId, setRenameId] = useState(null);
    const [renameName, setRenameName] = useState('');
    const [isRenaming, setIsRenaming] = useState(false);

    const refresh = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const data = await listForms();
            setForms(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || 'Failed to load forms');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const handleOpenInBuilder = (id) => {
        navigate(`/?formId=${id}`);
    };

    const handleDelete = async (id) => {
        setError('');
        setDeleteId(id);
        try {
            await deleteForm(id);
            await refresh();
        } catch (err) {
            setError(err.message || 'Failed to delete form');
        } finally {
            setDeleteId(null);
        }
    };

    const handleDuplicate = async () => {
        if (!duplicateId) return;
        setError('');
        const id = duplicateId;
        try {
            const form = await getForm(id);
            const name = duplicateName || `${form.name || 'Form'} copy`;
            await createForm({
                name,
                fields: form.fields || [],
            });
            setDuplicateId(null);
            setDuplicateName('');
            await refresh();
        } catch (err) {
            setError(err.message || 'Failed to duplicate form');
            setDuplicateId(null);
        }
    };

    const openDuplicateDialog = (form) => {
        setDuplicateId(form.id || form._id);
        setDuplicateName(`${form.name || 'Form'} copy`);
    };

    const closeDuplicateDialog = () => {
        setDuplicateId(null);
        setDuplicateName('');
    };

    const openRenameDialog = (form) => {
        setRenameId(form.id || form._id);
        setRenameName(form.name || '');
    };

    const closeRenameDialog = () => {
        setRenameId(null);
        setRenameName('');
        setIsRenaming(false);
    };

    const handleRename = async () => {
        if (!renameId || !renameName.trim()) return;
        setError('');
        setIsRenaming(true);
        try {
            await updateForm(renameId, { name: renameName.trim() });
            await refresh();
            closeRenameDialog();
        } catch (err) {
            setError(err.message || 'Failed to rename form');
            setIsRenaming(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f5f7fb 0%, #eef1f7 60%, #e4e9f4 100%)', p: 4 }}>
            <Paper elevation={6} sx={{ maxWidth: 1100, mx: 'auto', p: 3, borderRadius: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <div>
                        <Typography variant="overline" color="text.secondary">Forms</Typography>
                        <Typography variant="h5" fontWeight={700}>Manage saved forms</Typography>
                        <Typography variant="body2" color="text.secondary">Load, duplicate, or delete forms saved in the backend.</Typography>
                    </div>
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" onClick={refresh} startIcon={<RefreshIcon />} disabled={loading}>
                            Refresh
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={() => navigate('/')}>
                            Back to Builder
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/')}>New Form</Button>
                    </Stack>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {error && (
                    <Typography color="error" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {loading ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2">Loading forms...</Typography>
                    </Stack>
                ) : forms.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No forms saved yet.</Typography>
                ) : (
                    <List dense>
                        {forms.map((form) => {
                            const id = form.id || form._id;
                            const secondary = [
                                form.fields?.length ? `${form.fields.length} field(s)` : '0 fields',
                                form.createdAt ? new Date(form.createdAt).toLocaleString() : null,
                            ].filter(Boolean).join(' • ');

                            return (
                                <React.Fragment key={id}>
                                    <ListItem
                                        secondaryAction={
                                            <Stack direction="row" spacing={1}>
                                                <IconButton edge="end" aria-label="preview" onClick={() => setPreviewForm(form)}>
                                                    <OpenInNewIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="rename" onClick={() => openRenameDialog(form)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="duplicate" onClick={() => openDuplicateDialog(form)}>
                                                    <ContentCopyIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="delete" color="error" disabled={deleteId === id} onClick={() => handleDelete(id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        }
                                    >
                                        <ListItemText
                                            primary={form.name || 'Untitled Form'}
                                            secondary={secondary}
                                            onClick={() => handleOpenInBuilder(id)}
                                            primaryTypographyProps={{ sx: { cursor: 'pointer', fontWeight: 600 } }}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Paper>

            <Dialog open={Boolean(previewForm)} onClose={() => setPreviewForm(null)} fullWidth maxWidth="lg">
                <DialogTitle>Form preview</DialogTitle>
                <DialogContent dividers sx={{ maxWidth: 960, mx: 'auto', width: '100%' }}>
                    <DialogContentText sx={{ mb: 2 }}>
                        {previewForm?.name || 'Untitled Form'}
                    </DialogContentText>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {(previewForm?.fields || []).map((field, idx) => (
                            <RenderedField key={idx} field={field} />
                        ))}
                        {(!previewForm?.fields || previewForm.fields.length === 0) && (
                            <DialogContentText color="text.secondary">No fields.</DialogContentText>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewForm(null)} color="inherit">Close</Button>
                    {previewForm && (
                        <Button onClick={() => { handleOpenInBuilder(previewForm.id || previewForm._id); setPreviewForm(null); }} variant="contained">
                            Load in Builder
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(duplicateId)} onClose={closeDuplicateDialog} fullWidth maxWidth="xs">
                <DialogTitle>Duplicate form</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Choose a name for the duplicated form.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        label="New form name"
                        value={duplicateName}
                        onChange={(e) => setDuplicateName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDuplicateDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleDuplicate} variant="contained" disabled={!duplicateName.trim()}>
                        Duplicate
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(renameId)} onClose={closeRenameDialog} fullWidth maxWidth="xs">
                <DialogTitle>Rename form</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Update the form name.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        label="Form name"
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRenameDialog} color="inherit">Cancel</Button>
                    <Button onClick={handleRename} variant="contained" disabled={!renameName.trim() || isRenaming}>
                        {isRenaming ? 'Renaming...' : 'Rename'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FormsPage;

function RenderedField({ field }) {
    const label = field.label || field.name || 'Field';
    const options = Array.isArray(field.options) ? field.options : [];

    switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
            return (
                <TextField
                    fullWidth
                    type={field.type === 'phone' ? 'tel' : field.type}
                    label={label}
                    placeholder={field.placeholder || ''}
                />
            );
        case 'textarea':
            return (
                <TextField
                    fullWidth
                    multiline
                    minRows={field.rows || 3}
                    label={label}
                    placeholder={field.placeholder || ''}
                />
            );
        case 'select':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{label}</Typography>
                    <Select fullWidth defaultValue="">
                        <MenuItem value="" disabled>
                            Select
                        </MenuItem>
                        {options.map((opt, i) => (
                            <MenuItem key={i} value={opt}>{opt}</MenuItem>
                        ))}
                    </Select>
                </div>
            );
        case 'radio':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{label}</Typography>
                    <RadioGroup row>
                        {options.map((opt, i) => (
                            <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
                        ))}
                    </RadioGroup>
                </div>
            );
        case 'checkbox':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{label}</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {options.map((opt, i) => (
                            <FormControlLabel key={i} control={<Checkbox />} label={opt} />
                        ))}
                        {options.length === 0 && <Typography variant="body2" color="text.secondary">No options</Typography>}
                    </Stack>
                </div>
            );
        case 'date':
            return <TextField type="date" fullWidth label={label} InputLabelProps={{ shrink: true }} />;
        case 'slider':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{label}</Typography>
                    <Slider defaultValue={50} />
                </div>
            );
        case 'rating':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{label}</Typography>
                    <Rating precision={0.5} />
                </div>
            );
        case 'toggle':
            return <FormControlLabel control={<Switch defaultChecked={field.checked} />} label={label} />;
        case 'file':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{label}</Typography>
                    <input type="file" disabled />
                </div>
            );
        case 'button':
            return <Button variant="contained">{label}</Button>;
        case 'divider':
            return (
                <div>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                </div>
            );
        default:
            return (
                <Typography variant="body2" color="text.secondary">
                    {label} ({field.type})
                </Typography>
            );
    }
}
