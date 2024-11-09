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
    { id: 'slider', label: 'Slider', icon: <TuneIcon /> },
    { id: 'button', label: 'Button', icon: <SmartButtonIcon /> },
    { id: 'twoColumnRow', label: 'Two Column Row', icon: <ViewColumnIcon /> },
    { id: 'threeColumnRow', label: 'Three Column Row', icon: <ViewColumnIcon /> },
    { id: 'fourColumnRow', label: 'Four Column Row', icon: <ViewColumnIcon /> },
];

function Sidebar() {
    return (
        <div
            style={{
                width: '90%',
                maxWidth: '300px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Form Elements</h3>
            {items && items.length > 0 ? (
                items.map((item) => <DraggableItem key={item.id} item={item} />)
            ) : (
                <div>No items available</div>
            )}
        </div>
    );
}

export default Sidebar;
