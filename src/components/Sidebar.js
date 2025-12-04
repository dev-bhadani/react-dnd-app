import React from 'react';
import DraggableItem from './DraggableItem';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import EventIcon from '@mui/icons-material/Event';
import TuneIcon from '@mui/icons-material/Tune';
import SmartButtonIcon from '@mui/icons-material/SmartButton';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';

const items = [
    { id: 'text', label: 'Text Field', icon: <TextFieldsIcon /> },
    { id: 'checkbox', label: 'Checkbox', icon: <CheckBoxIcon /> },
    { id: 'radio', label: 'Radio Button', icon: <RadioButtonCheckedIcon /> },
    { id: 'select', label: 'Dropdown Select', icon: <ArrowDropDownCircleIcon /> },
    { id: 'date', label: 'Date Picker', icon: <EventIcon /> },
    {id : 'rating', label: 'Rating', icon: <TuneIcon />},
    { id: 'slider', label: 'Slider', icon: <TuneIcon /> },
    { id: 'button', label: 'Button', icon: <SmartButtonIcon /> },
    { id: 'twoColumnRow', label: 'Two Column Row', icon: <ViewColumnIcon /> },
    { id: 'threeColumnRow', label: 'Three Column Row', icon: <ViewColumnIcon /> },
    { id: 'fourColumnRow', label: 'Four Column Row', icon: <ViewColumnIcon /> },
];

function Sidebar() {
    return (
        <aside className="sidebar-container" aria-label="Form elements library">
            <div className="sidebar__header">
                <h3>Form Elements</h3>
                <p>Drag an item into the canvas or double-click to add it instantly.</p>
            </div>
            <div className="sidebar__items">
                {items && items.length > 0 ? (
                    items.map((item) => <DraggableItem key={item.id} item={item} />)
                ) : (
                    <div className="sidebar__empty">No items available</div>
                )}
            </div>
        </aside>
    );
}

export default Sidebar;
