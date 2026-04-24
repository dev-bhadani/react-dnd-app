import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Rating,
    Select,
    Slider,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

import { listForms, deleteForm, getForm, createForm, updateForm } from '../../shared/api/forms';
import { dateFormatPattern, formatDateValue } from '../../shared/utils/dateFormat';

/**
 * Manages the user's saved forms — list, rename, duplicate, delete, preview.
 */
export default function FormsPage() {
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

    const handleOpenInBuilder = (id) => navigate(`/?formId=${id}`);

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
        try {
            const form = await getForm(duplicateId);
            const name = duplicateName || `${form.name || 'Form'} copy`;
            await createForm({ name, fields: form.fields || [] });
            closeDuplicateDialog();
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
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #f6f8fc 0%, #eef2f9 100%)',
                p: { xs: 2, md: 4 },
            }}
        >
            <Paper elevation={2} sx={{ maxWidth: 1100, mx: 'auto', p: { xs: 2, md: 3 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <div>
                        <Typography variant="overline" color="text.secondary">
                            Forms
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                            Manage saved forms
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Load, duplicate, or delete forms saved in the backend.
                        </Typography>
                    </div>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Tooltip title="Reload the forms list">
                            <span>
                                <Button
                                    variant="outlined"
                                    onClick={refresh}
                                    startIcon={<RefreshIcon />}
                                    disabled={loading}
                                >
                                    Refresh
                                </Button>
                            </span>
                        </Tooltip>
                        <Tooltip title="Return to the builder">
                            <Button variant="outlined" color="inherit" onClick={() => navigate('/')}>
                                Back to Builder
                            </Button>
                        </Tooltip>
                        <Tooltip title="Start a new blank form">
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/')}>
                                New Form
                            </Button>
                        </Tooltip>
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
                        <Typography variant="body2">Loading forms…</Typography>
                    </Stack>
                ) : forms.length === 0 ? (
                    <EmptyState onCreate={() => navigate('/')} />
                ) : (
                    <List dense>
                        {forms.map((form) => {
                            const id = form.id || form._id;
                            const secondary = [
                                form.fields?.length ? `${form.fields.length} field(s)` : '0 fields',
                                form.createdAt ? new Date(form.createdAt).toLocaleString() : null,
                            ]
                                .filter(Boolean)
                                .join(' • ');

                            return (
                                <React.Fragment key={id}>
                                    <ListItem
                                        secondaryAction={
                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Preview this form">
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="preview"
                                                        onClick={() => setPreviewForm(form)}
                                                    >
                                                        <OpenInNewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Rename this form">
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="rename"
                                                        onClick={() => openRenameDialog(form)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Duplicate this form">
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="duplicate"
                                                        onClick={() => openDuplicateDialog(form)}
                                                    >
                                                        <ContentCopyIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete this form">
                                                    <span>
                                                        <IconButton
                                                            edge="end"
                                                            aria-label="delete"
                                                            color="error"
                                                            disabled={deleteId === id}
                                                            onClick={() => handleDelete(id)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        }
                                    >
                                        <ListItemText
                                            primary={form.name || 'Untitled Form'}
                                            secondary={secondary}
                                            onClick={() => handleOpenInBuilder(id)}
                                            primaryTypographyProps={{
                                                sx: { cursor: 'pointer', fontWeight: 600 },
                                            }}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            );
                        })}
                    </List>
                )}
            </Paper>

            <Dialog open={Boolean(previewForm)} onClose={() => setPreviewForm(null)} fullWidth maxWidth="md">
                <DialogTitle>Form preview</DialogTitle>
                <DialogContent dividers>
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
                    <Button onClick={() => setPreviewForm(null)} color="inherit">
                        Close
                    </Button>
                    {previewForm && (
                        <Button
                            onClick={() => {
                                handleOpenInBuilder(previewForm.id || previewForm._id);
                                setPreviewForm(null);
                            }}
                            variant="contained"
                        >
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
                    <Button onClick={closeDuplicateDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDuplicate} variant="contained" disabled={!duplicateName.trim()}>
                        Duplicate
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(renameId)} onClose={closeRenameDialog} fullWidth maxWidth="xs">
                <DialogTitle>Rename form</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>Update the form name.</DialogContentText>
                    <TextField
                        fullWidth
                        label="Form name"
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRenameDialog} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRename}
                        variant="contained"
                        disabled={!renameName.trim() || isRenaming}
                    >
                        {isRenaming ? 'Renaming…' : 'Rename'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function EmptyState({ onCreate }) {
    return (
        <Stack alignItems="center" spacing={2} sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="h6">No forms saved yet</Typography>
            <Typography variant="body2" color="text.secondary">
                Build something in the canvas and click <strong>Save</strong> to see it here.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
                Create your first form
            </Button>
        </Stack>
    );
}

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
                    inputProps={{ pattern: field.pattern || undefined }}
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
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    <Select fullWidth defaultValue="" displayEmpty>
                        <MenuItem value="" disabled>
                            Select
                        </MenuItem>
                        {options.map((opt, i) => (
                            <MenuItem key={i} value={opt}>
                                {opt}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            );
        case 'radio':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
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
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        {options.map((opt, i) => (
                            <FormControlLabel key={i} control={<Checkbox />} label={opt} />
                        ))}
                        {options.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No options
                            </Typography>
                        )}
                    </Stack>
                </div>
            );
        case 'date': {
            const format = field.dateFormat || 'YYYY-MM-DD';
            const isIso = format === 'YYYY-MM-DD';
            const pattern = dateFormatPattern(format);
            const formattedDefault = isIso ? field.defaultDate || '' : formatDateValue(field.defaultDate, format);
            const formattedMin = isIso ? field.minDate || '' : formatDateValue(field.minDate, format);
            const formattedMax = isIso ? field.maxDate || '' : formatDateValue(field.maxDate, format);
            const rangeHint =
                [formattedMin && `Min ${formattedMin}`, formattedMax && `Max ${formattedMax}`]
                    .filter(Boolean)
                    .join(' · ') || undefined;
            return (
                <TextField
                    type={isIso ? 'date' : 'text'}
                    fullWidth
                    label={label}
                    defaultValue={formattedDefault}
                    placeholder={format}
                    inputProps={{
                        min: isIso ? field.minDate || undefined : undefined,
                        max: isIso ? field.maxDate || undefined : undefined,
                        'data-min': !isIso && formattedMin ? formattedMin : undefined,
                        'data-max': !isIso && formattedMax ? formattedMax : undefined,
                        'data-format': format,
                        pattern,
                    }}
                    helperText={rangeHint}
                    InputLabelProps={{ shrink: true }}
                />
            );
        }
        case 'slider':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    <Slider
                        defaultValue={field.defaultValue ?? field.min ?? 0}
                        min={field.min ?? 0}
                        max={field.max ?? 100}
                        step={field.step ?? 1}
                    />
                </div>
            );
        case 'rating':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    <Rating
                        precision={field.precision ?? 0.5}
                        max={field.max ?? 5}
                        defaultValue={field.defaultValue ?? 0}
                    />
                </div>
            );
        case 'toggle':
            return <FormControlLabel control={<Switch defaultChecked={field.checked} />} label={label} />;
        case 'file':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {label}
                    </Typography>
                    <input type="file" disabled />
                </div>
            );
        case 'button':
            return <Button variant="contained">{label}</Button>;
        case 'divider':
            return (
                <div>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                        {label}
                    </Typography>
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

