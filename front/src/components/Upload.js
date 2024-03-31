import React, { useState } from 'react';
import '../css/drag.css'
import Model from './model';

const DragAndDrop = () => {
    const [dragging, setDragging] = useState(false);
    const [files, setFiles] = useState([]);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const droppedFiles = [...e.dataTransfer.files];
        setFiles(droppedFiles);
    };
    const fileItems = files.map((file, index) => (
        <li key={index}>{file.name}</li>
    ));
    if (files.length > 0) {
        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            formData.append('file', files[i]);
        }
        fetch('http://localhost:5000/', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                console.log("We have data");
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob(); // Convert response to Blob
            })
            .then(blob => {
                console.log("We have data 2", blob);
                const url = URL.createObjectURL(blob); // Create URL for Blob
                const a = document.createElement('a');
                a.href = url;
                a.download = 'output_files.zip'; // Specify the filename
                document.body.appendChild(a);
                a.click(); // Trigger click event to download the file
                document.body.removeChild(a); // Clean up
                setFiles([]);
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
    }


    return (
        <div>
            <div
                className={`drag-drop-container ${dragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <h2>Drag and Drop Files Here</h2>
                <ul>{fileItems}</ul>
            </div>

            <div>
                <Model></Model>
            </div>
        </div>
    );
};

export default DragAndDrop;
