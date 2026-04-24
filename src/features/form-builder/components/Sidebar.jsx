import React, { useMemo, useState } from 'react';
import { InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import EventIcon from '@mui/icons-material/Event';
import TuneIcon from '@mui/icons-material/Tune';
import LinearScaleIcon from '@mui/icons-material/LinearScale';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import NotesIcon from '@mui/icons-material/Notes';
import NumbersIcon from '@mui/icons-material/Numbers';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import DraggableItem from './DraggableItem';

/**
 * Categorized + searchable element palette. Categories collapse locally —
 * the palette doesn't need to persist across reloads.
 */
const CATEGORIES = [
    {
        key: 'inputs',
        label: 'Inputs',
        items: [
            { id: 'text', label: 'Text Field', icon: <TextFieldsIcon /> },
            { id: 'textarea', label: 'Long Answer', icon: <NotesIcon /> },
            { id: 'number', label: 'Number Input', icon: <NumbersIcon /> },
            { id: 'email', label: 'Email', icon: <EmailIcon /> },
            { id: 'phone', label: 'Phone', icon: <PhoneIcon /> },
        ],
    },
    {
        key: 'choices',
        label: 'Choices',
        items: [
            { id: 'checkbox', label: 'Checkbox', icon: <CheckBoxIcon /> },
            { id: 'radio', label: 'Radio Button', icon: <RadioButtonCheckedIcon /> },
            { id: 'select', label: 'Dropdown Select', icon: <ArrowDropDownCircleIcon /> },
            { id: 'toggle', label: 'Toggle Switch', icon: <ToggleOnIcon /> },
        ],
    },
    {
        key: 'datetime-rating',
        label: 'Date & Scale',
        items: [
            { id: 'date', label: 'Date Picker', icon: <EventIcon /> },
            { id: 'rating', label: 'Rating', icon: <TuneIcon /> },
            { id: 'slider', label: 'Slider', icon: <LinearScaleIcon /> },
        ],
    },
    {
        key: 'content',
        label: 'Content',
        items: [
            { id: 'file', label: 'File Upload', icon: <AttachFileIcon /> },
            { id: 'divider', label: 'Divider', icon: <HorizontalRuleIcon /> },
        ],
    },
    {
        key: 'layout',
        label: 'Layout',
        items: [
            { id: 'twoColumnRow', label: 'Two Columns', icon: <ViewColumnIcon /> },
            { id: 'threeColumnRow', label: 'Three Columns', icon: <ViewColumnIcon /> },
            { id: 'fourColumnRow', label: 'Four Columns', icon: <ViewColumnIcon /> },
        ],
    },
    {
        key: 'actions',
        label: 'Actions',
        items: [{ id: 'button', label: 'Button', icon: <SmartButtonIcon /> }],
    },
];

function Sidebar() {
    const [query, setQuery] = useState('');
    const [collapsed, setCollapsed] = useState(() => new Set());

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return CATEGORIES;
        return CATEGORIES.map((cat) => ({
            ...cat,
            items: cat.items.filter(
                (item) =>
                    item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
            ),
        })).filter((cat) => cat.items.length > 0);
    }, [query]);

    const toggle = (key) =>
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    const totalCount = filtered.reduce((acc, c) => acc + c.items.length, 0);

    return (
        <aside className="sidebar-container" aria-label="Form elements library">
            <div className="sidebar__header">
                <h3>Elements</h3>
                <p>Drag onto the canvas to add a field.</p>
            </div>
            <TextField
                fullWidth
                size="small"
                placeholder="Search elements…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
            />
            {totalCount === 0 ? (
                <div className="sidebar__empty">No elements match “{query}”.</div>
            ) : (
                filtered.map((cat) => {
                    const isCollapsed = !query && collapsed.has(cat.key);
                    return (
                        <div key={cat.key} className="sidebar__category">
                            <button
                                type="button"
                                className="sidebar__category-toggle"
                                onClick={() => toggle(cat.key)}
                                aria-expanded={!isCollapsed}
                            >
                                <span>{cat.label}</span>
                                <span className="sidebar__category-count">{cat.items.length}</span>
                            </button>
                            {!isCollapsed && (
                                <div className="sidebar__items">
                                    {cat.items.map((item) => (
                                        <DraggableItem key={item.id} item={item} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </aside>
    );
}

export default React.memo(Sidebar);

