import React, { useState } from 'react';
import { Notice, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface NoticeBoardProps {
  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateNotice: (notice: Notice) => void;
  deleteNotice: (noticeId: string) => void;
  hasPermission: (page: Page) => boolean;
}

const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices, addNotice, updateNotice, deleteNotice, hasPermission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState<Notice | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  const [newNotice, setNewNotice] = useState({ title: '', content: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewNotice(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date().toISOString().split('T')[0];
    addNotice({ ...newNotice, date, target: 'all_teachers' as const });
    setNewNotice({ title: '', content: '' });
    setIsModalOpen(false);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!noticeToEdit) return;
    const { name, value } = e.target;
    setNoticeToEdit({ ...noticeToEdit, [name]: value });
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeToEdit) return;
    updateNotice(noticeToEdit);
    setIsEditModalOpen(false);
    setNoticeToEdit(null);
  };
  
  const handleDelete = () => {
    if (!noticeToDelete) return;
    deleteNotice(noticeToDelete.id);
    setNoticeToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">নোটিশ বোর্ড</h2>
        {hasPermission('নোটিশ বোর্ড') && (
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            নতুন নোটিশ পোস্ট করুন
            </button>
        )}
      </div>
      <div className="space-y-4">
        {notices.map(notice => (
          <div key={notice.id} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-primary">{notice.title}</h3>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-500">{notice.date}</p>
                {hasPermission('নোটিশ বোর্ড') && (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => { setNoticeToEdit(notice); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => setNoticeToDelete(notice)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
              </div>
            </div>
            <p className="text-text-secondary mt-2 whitespace-pre-wrap">{notice.content}</p>
            <p className="text-xs text-right text-gray-400 mt-4 pt-2 border-t">
                {notice.lastModifiedBy ? `সর্বশেষ সম্পাদনা: ${notice.lastModifiedBy}` : `যোগ করেছেন: ${notice.addedBy}`}
            </p>
          </div>
        ))}
      </div>

      {(isModalOpen || (isEditModalOpen && noticeToEdit)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{isEditModalOpen ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ পোস্ট করুন'}</h3>
              <button onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={isEditModalOpen ? handleUpdate : handleSubmit} className="space-y-4">
              <input type="text" name="title" value={isEditModalOpen ? noticeToEdit!.title : newNotice.title} onChange={isEditModalOpen ? handleEditInputChange : handleInputChange} placeholder="নোটিশের শিরোনাম" className="w-full px-4 py-2 border rounded-lg" required />
              <textarea name="content" value={isEditModalOpen ? noticeToEdit!.content : newNotice.content} onChange={isEditModalOpen ? handleEditInputChange : handleInputChange} placeholder="নোটিশের বিষয়বস্তু" rows={5} className="w-full px-4 py-2 border rounded-lg" required />
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{isEditModalOpen ? 'আপডেট করুন' : 'নোটিশ পোস্ট করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {noticeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি নোটিশ "{noticeToDelete.title}"-কে মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setNoticeToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;