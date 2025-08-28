// src/context/ModalContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import '../css/alertModal.css';

// 1. Context 생성
const ModalContext = createContext(null);

// Modal 컴포넌트 정의 (이전에 별도 파일에 있던 내용을 여기에 통합)
const Modal = ({ type = 'confirm', message1, message2, onOk, onCancel, isVisible }) => {
    const [showModal, setShowModal] = useState(isVisible);

    useEffect(() => {
        setShowModal(isVisible);
    }, [isVisible]);

    if (!showModal) {
        return null;
    }

    return (
        <div className={`custom-confirm`} style={{ display: 'flex' }}>
            <div className="custom-confirm__content">
                <h4>알 림</h4>
                <div className="pData">
                    <p>{message1}</p>
                    <p>{message2}</p>
                </div>
                <div className="custom-confirm__buttons">
                    {type === 'confirm' && (
                        <button id="confirmCancel" onClick={onCancel}>
                            취소
                        </button>
                    )}
                    <button id="confirmOk" className="confirmOk" onClick={onOk}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

// 2. Provider 컴포넌트 생성
export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isVisible: false,
        message1: '',
        message2: '',
        type: 'confirm',
        onOk: () => {},
        onCancel: () => {},
    });

    const showConfirm = (message1, message2, onOk, onCancel) => {
        setModalState({
            isVisible: true,
            message1,
            message2,
            type: 'confirm',
            onOk,
            onCancel,
        });
    };

    const showAlert = (message1, message2, onOk) => {
        setModalState({
            isVisible: true,
            message1,
            message2,
            type: 'alert',
            onOk,
            onCancel: () => setModalState({ ...modalState, isVisible: false }),
        });
    };

    const hideModal = () => {
        setModalState({ ...modalState, isVisible: false });
    };

    const value = {
        showConfirm,
        showAlert,
        hideModal,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
            <Modal
                isVisible={modalState.isVisible}
                message1={modalState.message1}
                message2={modalState.message2}
                type={modalState.type}
                onOk={() => {
                    modalState.onOk();
                    hideModal();
                }}
                onCancel={() => {
                    modalState.onCancel();
                    hideModal();
                }}
            />
        </ModalContext.Provider>
    );
};

// 3. 커스텀 훅 생성
export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === null) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};