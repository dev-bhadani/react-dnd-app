import React from 'react';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { TEMPLATES } from '../utils/templates';

/**
 * Quick-start templates. Picking one replaces the current canvas with the
 * template's element tree (history-tracked, so ⌘Z still works).
 */
export default function TemplatesDialog({ open, onClose, onPick }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Start from a template</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Pick a template to replace the current canvas. You can keep editing afterwards.
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: 2,
                    }}
                >
                    {TEMPLATES.map((template) => (
                        <Card key={template.key} variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardActionArea
                                onClick={() => {
                                    onPick(template);
                                    onClose();
                                }}
                                sx={{ p: 2, height: '100%' }}
                            >
                                <Stack spacing={1}>
                                    <Box sx={{ fontSize: 28, lineHeight: 1 }}>{template.emoji}</Box>
                                    <Typography variant="subtitle1" fontWeight={700}>
                                        {template.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {template.description}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {template.elements.length} element{template.elements.length === 1 ? '' : 's'}
                                    </Typography>
                                </Stack>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

