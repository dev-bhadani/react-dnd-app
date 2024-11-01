import React, { useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import FormCanvas from './components/FormCanvas';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import EventIcon from '@mui/icons-material/Event';
import TuneIcon from '@mui/icons-material/Tune';
import SmartButtonIcon from '@mui/icons-material/SmartButton';

const items = [
    { id: 'text', label: 'Text Field', icon: <TextFieldsIcon /> },
    { id: 'checkbox', label: 'Checkbox', icon: <CheckBoxIcon /> },
    { id: 'radio', label: 'Radio Button', icon: <RadioButtonCheckedIcon /> },
    { id: 'select', label: 'Dropdown Select', icon: <ArrowDropDownCircleIcon /> },
    { id: 'date', label: 'Date Picker', icon: <EventIcon /> },
    { id: 'slider', label: 'Slider', icon: <TuneIcon /> },
    { id: 'button', label: 'Button', icon: <SmartButtonIcon /> },
];

function App() {
    const [formElements, setFormElements] = useState([]);

    const handleDrop = (event) => {
        const { active } = event;
        setFormElements((prev) => [...prev, { type: active.id, id: Date.now() }]);
    };

    const handleDeleteElement = (id) => {
        setFormElements((prev) => prev.filter((element) => element.id !== id));
    };

    return (
        <DndContext onDragEnd={handleDrop}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: '20px',
                    padding: '40px',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <Sidebar items={items} />
                <div style={{ flex: 1 }}>
                    <FormCanvas formElements={formElements} onDelete={handleDeleteElement} />
                </div>
            </div>
        </DndContext>
    );
}

export default App;
