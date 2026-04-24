import React from 'react';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

/**
 * Map the limited icon-name vocabulary used by Button elements to a JSX node.
 * Centralized so previews/canvas/codegen all stay in sync.
 */
export const iconForName = (name) => {
    switch (name) {
        case 'save':
            return <SaveIcon fontSize="small" />;
        case 'send':
            return <SendIcon fontSize="small" />;
        case 'add':
            return <AddIcon fontSize="small" />;
        case 'delete':
            return <DeleteIcon fontSize="small" />;
        case 'check':
            return <CheckIcon fontSize="small" />;
        default:
            return null;
    }
};

