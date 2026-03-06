import React, { useState, useMemo } from 'react';
import { Book, Page, LibrarySection } from '../types';
import { XIcon, PencilIcon, TrashIcon, BookOpenIcon, ChevronDownIcon } from '../constants';

interface LibraryProps {
  books: Book[];
  sections: LibrarySection[];
  addBook: (book: Omit<Book, 'id' | 'addedBy' | 'lastModifiedBy'>) => void;
  updateBook: (book: Book) => void;
  deleteBook: (bookId: string) => void;
  toggleBookAvailability: (bookId: string) => void;
  addSection: (section: Omit<LibrarySection, 'id'>) => void;
  updateSection: (section: LibrarySection) => void;
  deleteSection: (sectionId: string) => void;
  hasPermission: (page: Page) => boolean;
}

const Library: React.FC<LibraryProps> = ({ 
    books, sections, addBook, updateBook, deleteBook, toggleBookAvailability,
    addSection, updateSection, deleteSection, hasPermission 
}) => {
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<LibrarySection | null>(null);
  
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<LibrarySection | null>(null);
  
  const [newBook, setNewBook] = useState({ title: '', author: '', sectionId: '', className: '' });
  const [newSectionName, setNewSectionName] = useState('');
  
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const handleToggleSection = (sectionId: string) => {
    setExpandedSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };


  const groupedBooks = useMemo(() => {
    const group: { [sectionId: string]: { [className: string]: Book[] } } = {};
    for (const book of books) {
      if (!group[book.sectionId]) group[book.sectionId] = {};
      if (!group[book.sectionId][book.className]) group[book.sectionId][book.className] = [];
      group[book.sectionId][book.className].push(book);
    }
    Object.keys(group).forEach(sectionId => {
        const classes = Object.keys(group[sectionId]).sort();
        const sortedClasses: { [className: string]: Book[] } = {};
        classes.forEach(className => {
            sortedClasses[className] = group[sectionId][className];
        });
        group[sectionId] = sortedClasses;
    });
    return group;
  }, [books]);

  const openAddSectionModal = () => {
    setSectionToEdit(null);
    setNewSectionName('');
    setIsSectionModalOpen(true);
  };

  const openEditSectionModal = (section: LibrarySection) => {
    setSectionToEdit(section);
    setNewSectionName(section.name);
    setIsSectionModalOpen(true);
  };
  
  const handleSectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sectionToEdit) {
      updateSection({ ...sectionToEdit, name: newSectionName });
    } else {
      addSection({ name: newSectionName });
    }
    setIsSectionModalOpen(false);
  };
  
  const handleDeleteSection = () => {
    if (sectionToDelete) {
        const booksInSection = books.some(b => b.sectionId === sectionToDelete.id);
        if (booksInSection) {
            alert("এই শাখায় বই থাকায় এটি মুছে ফেলা যাবে না। প্রথমে বইগুলো মুছুন বা অন্য শাখায় স্থানান্তর করুন।");
            setSectionToDelete(null);
            return;
        }
        deleteSection(sectionToDelete.id);
        setSectionToDelete(null);
    }
  };

  const openAddBookModal = (sectionId: string) => {
    setBookToEdit(null);
    setNewBook({ title: '', author: '', sectionId: sectionId, className: '' });
    setIsBookModalOpen(true);
  };

  const openEditBookModal = (book: Book) => {
    setBookToEdit(book);
    setIsBookModalOpen(true);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookToEdit) {
      updateBook(bookToEdit);
    } else {
      addBook({ ...newBook, isAvailable: true });
    }
    setIsBookModalOpen(false);
  };
  
  const handleBookInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (bookToEdit) {
        setBookToEdit(prev => prev ? { ...prev, [name]: value } : null);
    } else {
        setNewBook(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDeleteBook = () => {
    if (bookToDelete) {
        deleteBook(bookToDelete.id);
        setBookToDelete(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">লাইব্রেরি ব্যবস্থাপনা</h2>
        {hasPermission('লাইব্রেরি') && (
          <button onClick={openAddSectionModal} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            নতুন শাখা যোগ করুন
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sections.map(section => {
            const isExpanded = expandedSectionId === section.id;
            return (
            <div key={section.id} className="bg-white shadow-md rounded-lg transition-all duration-300">
                <div 
                    onClick={() => handleToggleSection(section.id)}
                    className="p-4 border-b bg-gray-50 flex justify-between items-center rounded-t-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                    <h3 className="text-xl font-bold text-primary flex items-center">
                        <BookOpenIcon className="w-6 h-6 mr-3" />
                        {section.name}
                    </h3>
                    <div className="flex items-center space-x-4">
                        {hasPermission('লাইব্রেরি') && (
                            <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                <button onClick={() => openAddBookModal(section.id)} className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">বই যোগ করুন</button>
                                <button onClick={() => openEditSectionModal(section)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full" title="শাখা সম্পাদনা"><PencilIcon className="h-4 w-4" /></button>
                                <button onClick={() => setSectionToDelete(section)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="শাখা মুছুন"><TrashIcon className="h-4 w-4" /></button>
                            </div>
                        )}
                        <ChevronDownIcon className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                    </div>
                </div>
                <div className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4">
                        {groupedBooks[section.id] ? (
                            Object.keys(groupedBooks[section.id]).map(className => (
                                <div key={className} className="mb-6 last:mb-0">
                                    <h4 className="text-md font-semibold text-text-secondary pb-2 mb-2 border-b-2 border-gray-200">শ্রেণী: {className}</h4>
                                    <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr>
                                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">বইয়ের নাম</th>
                                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">লেখক</th>
                                                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase">অবস্থা</th>
                                                {hasPermission('লাইব্রেরি') && <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase">কার্যক্রম</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {groupedBooks[section.id][className].map(book => (
                                                <tr key={book.id}>
                                                    <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                                                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                                                    <td className="py-2 px-3 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {book.isAvailable ? 'উপলব্ধ' : 'ইস্যু করা হয়েছে'}
                                                        </span>
                                                    </td>
                                                    {hasPermission('লাইব্রেরি') && (
                                                        <td className="py-2 px-3 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button onClick={() => toggleBookAvailability(book.id)} className={`px-3 py-1 text-xs rounded-full ${book.isAvailable ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>
                                                                    {book.isAvailable ? 'ইস্যু করুন' : 'ফেরত নিন'}
                                                                </button>
                                                                <button onClick={() => openEditBookModal(book)} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা"><PencilIcon className="h-4 w-4" /></button>
                                                                <button onClick={() => setBookToDelete(book)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন"><TrashIcon className="h-4 w-4" /></button>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-4">এই শাখায় কোনো বই যোগ করা হয়নি।</p>
                        )}
                    </div>
                </div>
            </div>
        )})}
        {sections.length === 0 && (
             <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <p className="text-text-secondary">লাইব্রেরিতে কোনো শাখা পাওয়া যায়নি। শুরু করতে একটি নতুন শাখা যোগ করুন।</p>
             </div>
        )}
      </div>

      {isBookModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">{bookToEdit ? 'বই সম্পাদনা করুন' : 'নতুন বই যোগ করুন'}</h3>
              <button onClick={() => setIsBookModalOpen(false)}><XIcon className="h-6 w-6" /></button>
            </div>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <input type="text" name="title" value={bookToEdit ? bookToEdit.title : newBook.title} onChange={handleBookInputChange} placeholder="বইয়ের নাম" className="w-full px-4 py-2 border rounded-lg" required />
              <input type="text" name="author" value={bookToEdit ? bookToEdit.author : newBook.author} onChange={handleBookInputChange} placeholder="লেখকের নাম" className="w-full px-4 py-2 border rounded-lg" required />
              <div>
                  <label className="text-sm font-medium">শাখা</label>
                  <select name="sectionId" value={bookToEdit ? bookToEdit.sectionId : newBook.sectionId} className="w-full px-4 py-2 border rounded-lg bg-gray-100" disabled>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
              </div>
              <input type="text" name="className" value={bookToEdit ? bookToEdit.className : newBook.className} onChange={handleBookInputChange} placeholder="শ্রেণীর নাম" className="w-full px-4 py-2 border rounded-lg" required />
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsBookModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{bookToEdit ? 'আপডেট করুন' : 'যোগ করুন'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSectionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{sectionToEdit ? 'শাখা সম্পাদনা করুন' : 'নতুন শাখা যোগ করুন'}</h3>
                <button onClick={() => setIsSectionModalOpen(false)}><XIcon className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleSectionSubmit} className="space-y-4">
                <input type="text" name="name" value={newSectionName} onChange={e => setNewSectionName(e.target.value)} placeholder="শাখার নাম" className="w-full px-4 py-2 border rounded-lg" required />
                <div className="mt-6 flex justify-end space-x-4">
                  <button type="button" onClick={() => setIsSectionModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg">বাতিল</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{sectionToEdit ? 'আপডেট করুন' : 'যোগ করুন'}</button>
                </div>
              </form>
            </div>
          </div>
      )}
      
      {bookToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি বই "{bookToDelete.title}"-কে মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setBookToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDeleteBook} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}

      {sectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি শাখা "{sectionToDelete.name}"-কে মুছে ফেলতে চান? এটি ফিরিয়ে আনা যাবে না।</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setSectionToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDeleteSection} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;