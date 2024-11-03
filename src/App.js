import React, {useState, useEffect, useRef} from 'react';
import {DndContext} from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import EditSidebar from './components/EditSidebar';
import DroppableArea from './components/DroppableArea';
import FormPreview from './components/FormPreview';

function App() {
    const [formElements, setFormElements] = useState([]);
    const editSidebarRef = useRef(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleDrop = (event) => {
        const {active, over} = event;
        if (over) {
            setFormElements((prev) => [...prev, {type: active.id, id: Date.now(), name: ''}]);
        }
    };

    const handleDeleteElement = (id) => {
        setFormElements((prev) => prev.filter((element) => element.id !== id));
    };

    const handleNameChange = (id, newName) => {
        setFormElements((prev) => prev.map((element) => (element.id === id ? {...element, name: newName} : element)));
    };

    const handleSelectElement = (id) => {
        const element = formElements.find((el) => el.id === id);
        setSelectedElement(element);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editSidebarRef.current && !editSidebarRef.current.contains(event.target)) {
                setSelectedElement(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedElement]);

    return (<DndContext onDragEnd={handleDrop}>
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '20px',
                padding: '40px',
                marginTop: '20px',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <Sidebar/>
            <div style={{flex: 1, marginRight: '20px'}}>
                <DroppableArea formElements={formElements} onDelete={handleDeleteElement}
                               onSelect={handleSelectElement}/>
            </div>
            {selectedElement && (<div ref={editSidebarRef}>
                <EditSidebar
                    className="edit-sidebar"
                    selectedElement={selectedElement}
                    onNameChange={(newName) => {
                        handleNameChange(selectedElement.id, newName);
                        setSelectedElement((prev) => ({...prev, name: newName}));
                    }}
                />
            </div>)}
        </div>
        <div style={{textAlign: 'center', marginTop: '20px'}}>
            <button
                onClick={() => setShowPreview(!showPreview)}
                style={{
                    padding: '15px 30px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                {showPreview ? 'Close Preview' : 'Preview Form'}
            </button>
        </div>
        {showPreview && (<FormPreview formElements={formElements} onClose={() => setShowPreview(false)}/>)}
    </DndContext>);
}

export default App;
