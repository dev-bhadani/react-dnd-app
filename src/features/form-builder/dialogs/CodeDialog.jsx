import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import { useBuilderStore } from '../state/builderStore';
import { generateReactCode } from '../codegen/generateReactCode';
import { buildCodeSandboxParameters } from '../codegen/sandbox';
import { elementsToExportNodes } from '../utils/fieldMapping';
import { exportProjectZip } from '../../../shared/api/forms';

/**
 * Generates JSX/TSX from the current canvas and offers Copy + Open-in-Sandbox.
 * `lz-string` is loaded lazily (see `sandbox.js`) so the bundle stays slim.
 */
export default function CodeDialog({ open, onClose }) {
    const formElements = useBuilderStore((s) => s.formElements);
    const formName = useBuilderStore((s) => s.formName);

    const [language, setLanguage] = useState('jsx');
    const [code, setCode] = useState('');
    const [componentName, setComponentName] = useState('GeneratedForm');
    const [error, setError] = useState('');
    const [isSandboxing, setIsSandboxing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!open) return;
        try {
            const result = generateReactCode(formElements, formName, language === 'tsx');
            setCode(result.code);
            setComponentName(result.componentName);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to generate code');
        }
    }, [open, language, formElements, formName]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
        } catch (err) {
            setError(err.message || 'Could not copy to clipboard');
        }
    };

    const handleOpenSandbox = async () => {
        if (!code) return;
        setIsSandboxing(true);
        try {
            const { parameters } = await buildCodeSandboxParameters({
                codeString: code,
                componentName,
                isTS: language === 'tsx',
            });
            window.open(
                `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`,
                '_blank',
                'noopener'
            );
        } catch (err) {
            setError(err.message || 'Failed to open CodeSandbox');
        } finally {
            setIsSandboxing(false);
        }
    };

    const handleDownloadZip = async () => {
        setIsDownloading(true);
        try {
            const nodes = elementsToExportNodes(formElements);
            const { blob, filename } = await exportProjectZip({ name: formName, nodes });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.message || 'Failed to download project');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Export code</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <ToggleButtonGroup
                        value={language}
                        exclusive
                        size="small"
                        onChange={(_, value) => value && setLanguage(value)}
                        aria-label="Output language"
                    >
                        <ToggleButton value="jsx">JSX</ToggleButton>
                        <ToggleButton value="tsx">TSX</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {error && (
                    <DialogContentText color="error" sx={{ mb: 1 }}>
                        {error}
                    </DialogContentText>
                )}
                <Box
                    component="pre"
                    sx={{
                        backgroundColor: '#0f172a',
                        color: '#e2e8f0',
                        p: 2,
                        borderRadius: 2,
                        fontSize: 13,
                        overflow: 'auto',
                        lineHeight: 1.5,
                        m: 0,
                    }}
                >
                    {code || '// Add some fields to generate code'}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCopy} disabled={!code} color="inherit">
                    Copy {language.toUpperCase()}
                </Button>
                <Button onClick={handleOpenSandbox} disabled={!code || isSandboxing} color="inherit">
                    {isSandboxing ? 'Opening…' : `Open in CodeSandbox`}
                </Button>
                <Button onClick={handleDownloadZip} disabled={!code || isDownloading} color="inherit">
                    {isDownloading ? 'Preparing…' : 'Download project (.zip)'}
                </Button>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

