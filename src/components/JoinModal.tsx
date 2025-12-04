import React from 'react';
import Modal from 'react-modal';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

Modal.setAppElement('#root');

const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You for Joining!</h2>
        <p className="text-gray-700">
          We appreciate your commitment to combating antisemitism. You'll receive our weekly updates 
          and important information about our initiatives.
        </p>
      </div>
    </Modal>
  );
};

export default JoinModal;