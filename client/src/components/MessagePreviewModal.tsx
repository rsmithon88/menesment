import React from 'react';
import { XIcon } from '../constants';

interface MessagePreviewModalProps {
    message: string;
    recipients: string[];
    onClose: () => void;
    onSend: () => void;
}

const MessagePreviewModal: React.FC<MessagePreviewModalProps> = ({ message, recipients, onClose, onSend }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">মেসেজ প্রিভিউ</h3>
                    <button onClick={onClose}><XIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">প্রাপক ({recipients.length} জন)</label>
                        <div className="max-h-32 overflow-y-auto bg-gray-50 border rounded-lg p-3">
                            {recipients.map((r, i) => (
                                <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">{r}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">মেসেজ</label>
                        <div className="bg-gray-50 border rounded-lg p-3 whitespace-pre-wrap text-sm">{message}</div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                    <button type="button" onClick={onSend} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">মেসেজ পাঠান</button>
                </div>
            </div>
        </div>
    );
};

export default MessagePreviewModal;