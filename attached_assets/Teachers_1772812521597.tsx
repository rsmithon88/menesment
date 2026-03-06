import React, { useState } from 'react';
import { Teacher, Page, Designation, LoggedInUser } from '../types';
import { XIcon, PencilIcon, TrashIcon } from '../constants';

interface TeachersProps {
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id' | 'uid' | 'addedBy' | 'lastModifiedBy'> & { password: string }) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;
  hasPermission: (page: Page) => boolean;
  currentUser: LoggedInUser;
}

const availableResponsibilities: Page[] = [
  'শিক্ষার্থীরা',
  'হাজিরা',
  'শিক্ষক হাজিরা',
  'ফি ব্যবস্থাপনা',
  'ব্যয় ব্যবস্থাপনা',
  'পরীক্ষা',
  'রেজাল্ট',
  'সময়সূচী',
  'লাইব্রেরি',
  'নোটিশ বোর্ড',
  'ইভেন্ট ক্যালেন্ডার',
  'রিপোর্ট',
  'শিক্ষার্থী তথ্য',
  'ছুটির আবেদন'
];

const designationOptions: Designation[] = [
  'সাধারণ শিক্ষক', 'প্রধান শিক্ষক', 'নূরানী বিভাগের প্রধান', 'হিফজ বিভাগের প্রধান', 'বালিকা শাখার প্রধান'
];

const Teachers: React.FC<TeachersProps> = ({ teachers, addTeacher, updateTeacher, deleteTeacher, hasPermission, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [passwordError, setPasswordError] = useState('');

  const initialNewTeacherState = { 
    name: '', 
    subject: '', 
    email: '', 
    password: '', 
    phone: '',
    address: '',
    designation: 'সাধারণ শিক্ষক' as Designation,
    responsibilities: [] as Page[],
    isSuperAdmin: false,
    gender: 'male' as 'male' | 'female',
  };
  const [newTeacher, setNewTeacher] = useState(initialNewTeacherState);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setNewTeacher(prev => ({ ...prev, [name]: checked }));
    } else {
        if (name === 'password') {
            setPasswordError(''); // Clear password error on new input
        }
        setNewTeacher(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResponsibilitiesChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const { value, checked } = e.target;
    const page = value as Page;
    
    const stateSetter = isEditing ? setTeacherToEdit : setNewTeacher;
    
    stateSetter(prev => {
        if (!prev) return null;
        if (checked) {
            return { ...prev, responsibilities: [...prev.responsibilities, page] };
        } else {
            return { ...prev, responsibilities: prev.responsibilities.filter(r => r !== page) };
        }
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!teacherToEdit) return;
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setTeacherToEdit({ ...teacherToEdit, [name]: checked });
    } else {
        setTeacherToEdit({ ...teacherToEdit, [name]: value as any });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacher.password.length < 6) {
        setPasswordError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
        return;
    }
    setPasswordError('');
    addTeacher(newTeacher);
    setNewTeacher(initialNewTeacherState);
    setIsModalOpen(false);
  };
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherToEdit) return;
    updateTeacher(teacherToEdit);
    setIsEditModalOpen(false);
    setTeacherToEdit(null);
  };

  const handleDelete = () => {
    if (!teacherToDelete) return;
    deleteTeacher(teacherToDelete.id);
    setTeacherToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">শিক্ষকদের তালিকা</h2>
        {hasPermission('শিক্ষকগণ') && (
          <button onClick={() => setIsModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
            শিক্ষক যোগ করুন
          </button>
        )}
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">নাম</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পদবী</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">বিষয়</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ইমেইল</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">মোবাইল নম্বর</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ঠিকানা</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সম্পাদনাকারী</th>
              {hasPermission('শিক্ষকগণ') && <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যক্রম</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                    {teacher.name}
                    {teacher.isSuperAdmin && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-accent text-primary">সুপার অ্যাডমিন</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.designation}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.address}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.lastModifiedBy || teacher.addedBy}</td>
                 {hasPermission('শিক্ষকগণ') && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-4">
                            <button onClick={() => { setTeacherToEdit(teacher); setIsEditModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900" title="সম্পাদনা">
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => setTeacherToDelete(teacher)} className="text-red-600 hover:text-red-900" title="মুছে ফেলুন">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">নতুন শিক্ষক যোগ করুন</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" value={newTeacher.name} onChange={handleInputChange} placeholder="পুরো নাম" className="w-full px-4 py-2 border rounded-lg" required />
                    <select name="designation" value={newTeacher.designation} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                        {designationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="text" name="subject" value={newTeacher.subject} onChange={handleInputChange} placeholder="বিষয়" className="w-full px-4 py-2 border rounded-lg" required />
                    <input type="text" name="address" value={newTeacher.address} onChange={handleInputChange} placeholder="ঠিকানা" className="w-full px-4 py-2 border rounded-lg" />
                    <input type="email" name="email" value={newTeacher.email} onChange={handleInputChange} placeholder="লগইন ইমেইল" className="w-full px-4 py-2 border rounded-lg" required />
                    <input type="text" name="phone" value={newTeacher.phone} onChange={handleInputChange} placeholder="মোবাইল নম্বর" className="w-full px-4 py-2 border rounded-lg" />
                     <select name="gender" value={newTeacher.gender} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                        <option value="male">পুরুষ</option>
                        <option value="female">মহিলা</option>
                    </select>
                    <div>
                        <input type="password" name="password" value={newTeacher.password} onChange={handleInputChange} placeholder="লগইন পাসওয়ার্ড" className="w-full px-4 py-2 border rounded-lg" required />
                        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    </div>
                </div>
                
                {currentUser.role === 'admin' && (
                    <div className="pt-4">
                        <label className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                name="isSuperAdmin"
                                checked={newTeacher.isSuperAdmin}
                                onChange={handleInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-medium text-gray-700">সুপার অ্যাডমিন বানান</span>
                        </label>
                    </div>
                )}
                
                <hr/>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">দায়িত্বসমূহ</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableResponsibilities.map(page => (
                            <label key={page} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    value={page}
                                    checked={newTeacher.responsibilities.includes(page)}
                                    onChange={(e) => handleResponsibilitiesChange(e, false)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">{page}</span>
                            </label>
                        ))}
                    </div>
                </div>

              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">শিক্ষক যোগ করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && teacherToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">শিক্ষকের তথ্য সম্পাদনা</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <XIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" value={teacherToEdit.name} onChange={handleEditInputChange} placeholder="পুরো নাম" className="w-full px-4 py-2 border rounded-lg" required />
                    <select name="designation" value={teacherToEdit.designation} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                        {designationOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="text" name="subject" value={teacherToEdit.subject} onChange={handleEditInputChange} placeholder="বিষয়" className="w-full px-4 py-2 border rounded-lg" required />
                    <input type="text" name="address" value={teacherToEdit.address} onChange={handleEditInputChange} placeholder="ঠিকানা" className="w-full px-4 py-2 border rounded-lg" />
                    <input type="email" name="email" value={teacherToEdit.email} onChange={handleEditInputChange} placeholder="লগইন ইমেইল" className="w-full px-4 py-2 border rounded-lg" required />
                    <input type="text" name="phone" value={teacherToEdit.phone || ''} onChange={handleEditInputChange} placeholder="মোবাইল নম্বর" className="w-full px-4 py-2 border rounded-lg" />
                     <select name="gender" value={teacherToEdit.gender || 'male'} onChange={handleEditInputChange} className="w-full px-4 py-2 border rounded-lg" required>
                        <option value="male">পুরুষ</option>
                        <option value="female">মহিলা</option>
                    </select>
                </div>

                {currentUser.role === 'admin' && (
                    <div className="pt-4">
                        <label className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer w-fit">
                            <input
                                type="checkbox"
                                name="isSuperAdmin"
                                checked={teacherToEdit.isSuperAdmin}
                                onChange={handleEditInputChange}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="font-medium text-gray-700">সুপার অ্যাডমিন বানান</span>
                        </label>
                    </div>
                )}

                <hr/>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">দায়িত্বসমূহ</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableResponsibilities.map(page => (
                            <label key={page} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    value={page}
                                    checked={teacherToEdit.responsibilities.includes(page)}
                                    onChange={(e) => handleResponsibilitiesChange(e, true)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">{page}</span>
                            </label>
                        ))}
                    </div>
                </div>

              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আপডেট করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {teacherToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md m-4">
            <h3 className="text-xl font-semibold">নিশ্চিতকরণ</h3>
            <p className="mt-4 text-text-secondary">আপনি কি নিশ্চিত যে আপনি শিক্ষক "{teacherToDelete.name}"-কে মুছে ফেলতে চান?</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => setTeacherToDelete(null)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">বাতিল</button>
              <button type="button" onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">মুছে ফেলুন</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
