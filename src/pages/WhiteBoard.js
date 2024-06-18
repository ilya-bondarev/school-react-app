import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Document, Page } from 'react-pdf';
import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import config from '../config';
import useProfile from '../context/useProfile';
import TeachersFileUpload from '../context/TeachersFileUpload';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { BsFillTrashFill, BsFileEarmarkPdfFill, BsFileEarmarkImage, BsFileEarmarkFont } from "react-icons/bs";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const WhiteBoard = () => {
  const { profile, loading } = useProfile();
  const [blocks, setBlocks] = useState([]);
  const [files, setFiles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fileType, setFileType] = useState(null);
  const socket = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const lessonId = queryParams.get('lessonId');
  const studentId = queryParams.get('studentId');
  const teacherId = queryParams.get('teacherId');

  useEffect(() => {
    if (!loading) {
      if (profile.id != studentId && profile.id != teacherId) {
        navigate('/profile');
      }
    }
  }, [loading, profile.id, studentId, teacherId, navigate]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/my-files`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const filesList = await response.json();

      if (Array.isArray(filesList)) {
        setFiles(filesList);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }
  };

  useEffect(() => {
    socket.current = new WebSocket(`${config.apiBaseUrl.replace('http', 'ws')}/ws/${lessonId}`);

    socket.current.onopen = () => {
      console.log('WebSocket connection established');
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update_blocks') {
        setBlocks(data.blocks);
      }
    };

    socket.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      socket.current.close();
    };
  }, [lessonId]);

  const sendUpdate = (type, data) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ type, data }));
    }
  };

  const handleEndLesson = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/save-lesson/${lessonId}`);
      navigate('/lessons');
    } catch (error) {
      console.error('Error updating lesson status:', error);
    }
  };

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
      sendUpdate('move_block', { id: blockId, x: newX, y: newY, width: block.width, height: block.height, content: block.content, contentType: block.contentType, contentUrl: block.contentUrl, pageNumber: block.pageNumber });
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
      sendUpdate('resize_block', { id: blockId, x: block.x, y: block.y, width: newWidth, height: newHeight, content: block.content, contentType: block.contentType, contentUrl: block.contentUrl, pageNumber: block.pageNumber });
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
    const block = blocks.find(b => b.id === blockId);
    sendUpdate('update_content', { id: blockId, x: block.x, y: block.y, width: block.width, height: block.height, content: newContent, contentType: block.contentType, contentUrl: block.contentUrl, pageNumber: block.pageNumber });
  };

  const addBlock = (type, url) => {
    const newBlock = {
      id: blocks.length + 1,
      x: 300,
      y: 300,
      width: 350,
      height: 250,
      content: type === 'text' ? "Two roads diverged in a yellow wood,\nAnd sorry I could not travel both\nAnd be one traveler, long I stood\nAnd looked down one as far as I could\nTo where it bent in the undergrowth;" : "",
      contentType: type,
      contentUrl: url,
      pageNumber: 1
    };
    setBlocks([...blocks, newBlock]);
    sendUpdate('add_block', newBlock);
  };

  const delBlock = (blockId) => {
    setBlocks(currentBlocks => currentBlocks.filter(b => b.id !== blockId));
    sendUpdate('delete_block', { id: blockId });
  };

  const handleIncreaseSize = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    const newWidth = block.width + 50;
    const newHeight = block.height + 50;
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, width: newWidth, height: newHeight } : b
    ));
    sendUpdate('resize_block', { id: blockId, x: block.x, y: block.y, width: newWidth, height: newHeight, content: block.content, contentType: block.contentType, contentUrl: block.contentUrl, pageNumber: block.pageNumber });
  };

  const handleDecreaseSize = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    const newWidth = Math.max(350, block.width - 50);
    const newHeight = Math.max(250, block.height - 50);
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, width: newWidth, height: newHeight } : b
    ));
    sendUpdate('resize_block', { id: blockId, x: block.x, y: block.y, width: newWidth, height: newHeight, content: block.content, contentType: block.contentType, contentUrl: block.contentUrl, pageNumber: block.pageNumber });
  };

  const updatePageNumber = (blockId, newPageNumber) => {
    setBlocks(currentBlocks => currentBlocks.map(b =>
      b.id === blockId ? { ...b, pageNumber: newPageNumber } : b
    ));
    const block = blocks.find(b => b.id === blockId);
    sendUpdate('update_page_number', { id: blockId, x: block.x, y: block.y, width: block.width, height: block.height, content: block.content, contentType: block.contentType, contentUrl: block.contentUrl, pageNumber: newPageNumber });
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

  const openModal = (type) => {
    setFileType(type);
    fetchFiles();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleFileSelect = (fileName) => {
    const url = `${config.apiBaseUrl}/files/${profile.id}/${fileName}`;
    addBlock(fileType, url);
    closeModal();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='whiteboard'>
      {profile.role_id === 2 && (
        <div className='control-panel'>
          <button onClick={() => addBlock('text')}><BsFileEarmarkFont /> New Text</button>
          <button onClick={() => openModal('image')}><BsFileEarmarkImage /> New Image</button>
          <button onClick={() => openModal('pdf')}><BsFileEarmarkPdfFill /> New PDF</button>
          <button onClick={handleEndLesson}>End Lesson</button>
        </div>
      )}
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
          {profile.role_id === 2 && (
            <div className='button-row'>
              <button onClick={() => handleIncreaseSize(block.id)}>+</button>
              <button onClick={() => handleDecreaseSize(block.id)}>-</button>
              <button onClick={e => delBlock(block.id)}>
                <BsFillTrashFill />
              </button>
            </div>
          )}
          {renderContent(block)}
          {profile.role_id === 2 && (
            <div
              className="resize-grip"
              onMouseDown={e => handleResize(block.id, e)}
              style={{ width: '10px', height: '10px', backgroundColor: 'gray', position: 'absolute', bottom: '0', right: '0', cursor: 'nwse-resize' }}
            ></div>
          )}
        </div>
      ))}
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        contentLabel="Select a file"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h2>Select a file</h2>

        <TeachersFileUpload onFileUpload={handleFileSelect} />
        <ul>
          {files.map(file => (
            <li key={file}>
              <button onClick={() => handleFileSelect(file)}>{file}</button>
            </li>
          ))}
        </ul>
        <button onClick={closeModal} className="close-button">Close</button>
      </Modal>

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

export default WhiteBoard;