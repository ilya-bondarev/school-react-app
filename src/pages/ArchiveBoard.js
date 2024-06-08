import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import config from '../config';
import { BsFillTrashFill } from "react-icons/bs";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const ArchiveBoard = () => {
  const [blocks, setBlocks] = useState([]);

  const lessonId = new URLSearchParams(window.location.search).get('lessonId');

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/load-lesson/${lessonId}`);
        if (response.data.blocks) {
          setBlocks(response.data.blocks);
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    };

    fetchBlocks();
  }, [lessonId]);

  const handleMouseDown = (blockId, event) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    const block = blocks[blockIndex];
    const offsetX = event.clientX - block.x;
    const offsetY = event.clientY - block.y;

    const mouseMoveHandler = (e) => {
      const newX = e.clientX - offsetX;
      const newY = e.clientY - offsetY;
      setBlocks(currentBlocks => currentBlocks.map(b =>
        b.id === blockId ? { ...b, x: newX, y: newY } : b
      ));
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const handleResize = (blockId, event) => {
    event.stopPropagation();
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    const block = blocks[blockIndex];
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = block.width;
    const startHeight = block.height;

    const mouseMoveHandler = (e) => {
      const newWidth = Math.max(350, startWidth + (e.clientX - startX));
      const newHeight = Math.max(250, startHeight + (e.clientY - startY));
      setBlocks(currentBlocks => currentBlocks.map(b =>
        b.id === blockId ? { ...b, width: newWidth, height: newHeight } : b
      ));
    };

    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  const handleContentChange = (blockId, newContent) => {
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, content: newContent } : b
    ));
  };

  const delBlock = (blockId) => {
    setBlocks(currentBlocks => currentBlocks.filter(b => b.id !== blockId));
  };

  const handleIncreaseSize = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    const newWidth = block.width + 50;
    const newHeight = block.height + 50;
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, width: newWidth, height: newHeight } : b
    ));
  };

  const handleDecreaseSize = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    const newWidth = Math.max(350, block.width - 50);
    const newHeight = Math.max(250, block.height - 50);
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, width: newWidth, height: newHeight } : b
    ));
  };

  const updatePageNumber = (blockId, newPageNumber) => {
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, pageNumber: newPageNumber } : b
    ));
  };

  const renderContent = (block) => {
    switch (block.contentType) {
      case 'text':
        return (
          <div
            className="text-content"
            contentEditable
            suppressContentEditableWarning
            onBlur={e => handleContentChange(block.id, e.target.innerText)}
            style={{ width: '100%', height: '100%', padding: '5px', boxSizing: 'border-box' }}
          >
            {block.content}
          </div>
        );
      case 'image':
        return <img src={block.contentUrl} alt="" style={{ width: '100%', height: '100%' }} />;
      case 'pdf':
        return <PDFViewer block={block} updatePageNumber={updatePageNumber} />;
      default:
        return null;
    }
  };



  return (
    <div className='whiteboard'>
      {blocks.map(block => (
        <div
          key={block.id}
          className="movable"
          style={{
            left: block.x,
            top: block.y,
            width: block.width,
            height: block.height,
            position: 'absolute',
            border: '2px solid black'
          }}
          onMouseDown={e => handleMouseDown(block.id, e)}
        >
          <div className='button-row'>
            <button onClick={() => handleIncreaseSize(block.id)}>+</button>
            <button onClick={() => handleDecreaseSize(block.id)}>-</button>
            <button onClick={e => delBlock(block.id)}>
              <BsFillTrashFill />
            </button>
          </div>
          {renderContent(block)}
          <div
            className="resize-grip"
            onMouseDown={e => handleResize(block.id, e)}
            style={{ width: '10px', height: '10px', backgroundColor: 'gray', position: 'absolute', bottom: '0', right: '0', cursor: 'nwse-resize' }}
          ></div>
        </div>
      ))}
    </div>
  );
};

const PDFViewer = ({ block, updatePageNumber }) => {
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => {
    const newPageNumber = block.pageNumber - 1;
    updatePageNumber(block.id, newPageNumber);
  };

  const goToNextPage = () => {
    const newPageNumber = block.pageNumber + 1;
    updatePageNumber(block.id, newPageNumber);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Document
        file={block.contentUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        style={{ width: '100%', height: '100%' }}
      >
        <Page pageNumber={block.pageNumber} width={block.width - 20} />
      </Document>
      {numPages && (
        <div style={{ marginTop: '10px' }}>
          <button disabled={block.pageNumber <= 1} onClick={goToPrevPage}>Previous</button>
          <button disabled={block.pageNumber >= numPages} onClick={goToNextPage}>Next</button>
        </div>
      )}
    </div>
  );
};

export default ArchiveBoard;
