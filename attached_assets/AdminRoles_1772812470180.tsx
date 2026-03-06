import React from 'react';
import { Teacher } from '../types';

interface AdminRolesProps {
  teachers: Teacher[];
  onUpdateTeacher: (teacher: Teacher) => void;
}

const AdminRoles: React.FC<AdminRolesProps> = ({ teachers, onUpdateTeacher }) => {
  
  const handleToggleSuperAdmin = (teacher: Teacher) => {
    onUpdateTeacher({ ...teacher, isSuperAdmin: !teacher.isSuperAdmin });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text-primary mb-6">অ্যাডমিন রোল ব্যবস্থাপনা</h2>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
          <p className="text-sm text-blue-800">
            এখান থেকে আপনি যেকোনো শিক্ষককে 'সুপার অ্যাডমিন' হিসেবে নির্ধারণ করতে পারেন। সুপার অ্যাডমিনরা 'সেটিংস' এবং 'অ্যাডমিন রোল' পেজ ছাড়া প্রায় সকল পেজ অ্যাক্সেস করতে পারবেন।
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">শিক্ষকের নাম</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">পদবী</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">সুপার অ্যাডমিন</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map(teacher => (
                <tr key={teacher.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teacher.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.designation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <label htmlFor={`super-admin-${teacher.id}`} className="flex justify-center items-center cursor-pointer">
                      <div className="relative">
                        <input
                          id={`super-admin-${teacher.id}`}
                          type="checkbox"
                          className="sr-only"
                          checked={!!teacher.isSuperAdmin}
                          onChange={() => handleToggleSuperAdmin(teacher)}
                        />
                        <div className="block bg-gray-200 w-12 h-6 rounded-full"></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${teacher.isSuperAdmin ? 'transform translate-x-6 bg-primary' : ''}`}></div>
                      </div>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <style>{`
            .dot {
                transition: transform .3s ease-in-out, background-color .3s ease-in-out;
            }
            input:checked ~ .dot {
                background-color: white;
            }
             input:checked + div {
                background-color: #1565C0;
            }
        `}</style>
    </div>
  );
};

export default AdminRoles;
