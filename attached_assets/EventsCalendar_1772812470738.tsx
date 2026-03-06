import React, { useState } from 'react';
import { Event, Page } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface EventsCalendarProps {
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;
  hasPermission: (page: Page) => boolean;
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ events, addEvent, updateEvent, deleteEvent, hasPermission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  
  const [newEvent, setNewEvent] = useState({ name: '', date: '', description: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent(newEvent);
    setNewEvent({ name: '', date: '', description: '' });
    setIsModalOpen(false);
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!eventToEdit) return;
    const { name, value } = e.target;
    setEventToEdit({ ...eventToEdit, [name]: value });
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventToEdit) return;
    updateEvent(eventToEdit);
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };
  
  const handleDelete = () => {
    if (!eventToDelete) return;
    deleteEvent(eventToDelete.id);
    setEventToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">ইভেন্ট ক্যালেন্ডার</h2>
        {hasPermission('ইভেন্ট ক্যালেন্ডার') && (
            <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            নতুন ইভেন্ট যোগ করুন
            </button>
        )}
      </div>
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-primary">{event.name}</h3>
               <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-500">{event.date}</p>
                {hasPermission('ইভেন্ট ক্যালেন্ডার') && (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => { setEventToEdit(event); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => setEventToDelete(event)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                )}
              </div>
            </div>
            <p className="text-text-secondary mt-2">{event.description}</p>
            <p className="text-xs text-right text-gray-400 mt-4 pt-2 border-t">
                {event.lastModifiedBy ? `সর্বশেষ সম্পাদনা: ${event.lastModifiedBy}` : `যোগ করেছেন: ${event.addedBy}`}
            </p>
          </div>
        ))}
      </div>

      {(isModalOpen || (isEditModalOpen && eventToEdit)) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{isEditModalOpen ? 'ইভেন্ট সম্পাদনা' : 'নতুন ইভেন্ট যোগ করুন'}</h3>
              <button onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={isEditModalOpen ? handleUpdate : handleSubmit} className="space-y-4">
              <input type="text" name="name" value={isEditModalOpen ? eventToEdit!.name : newEvent.name} onChange={isEditModalOpen ? handleEditInputChange : handleInputChange} placeholder="ইভেন্টের নাম" className="w-full px-4 py-2 border rounded-lg" required />
              <input type="date" name="date" value={isEditModalOpen ? eventToEdit!.date : newEvent.date} onChange={isEditModalOpen ? handleEditInputChange : handleInputChange} className="w-full px-4 py-2 border rounded-lg" required />
              <textarea name="description" value={isEditModalOpen ? eventToEdit!.description : newEvent.description} onChange={isEditModalOpen ? handleEditInputChange : handleInputChange} placeholder="ইভেন্টের বিবরণ" rows={4} className="w-full px-4 py-2 border rounded-lg" required />
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => isEditModalOpen ? setIsEditModalOpen(false) : setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{isEditModalOpen ? 'আপডেট করুন' : 'ইভেন্ট যোগ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি ইভেন্ট "{eventToDelete.name}"-কে মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setEventToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsCalendar;