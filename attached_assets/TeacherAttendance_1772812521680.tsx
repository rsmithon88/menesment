import React, { useMemo } from 'react';
import { TeacherAttendance, LoggedInUser, Teacher } from '../types';
import { ClipboardCheckIcon } from '../constants';

interface TeacherAttendanceProps {
  currentUser: LoggedInUser;
  teacherAttendance: TeacherAttendance[];
  teachers: Teacher[];
}

const TeacherAttendanceComponent: React.FC<TeacherAttendanceProps> = ({ currentUser, teacherAttendance, teachers }) => {
  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

  const attendanceRecords = useMemo(() => {
    const records = currentUser.role === 'admin' 
        ? teacherAttendance 
        : teacherAttendance.filter(att => att.teacherId === currentUser.id);
    
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentUser, teacherAttendance]);

  return (
    <div>
      <div className="flex items-center mb-6">
        <ClipboardCheckIcon className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-semibold text-text-primary ml-3">শিক্ষক হাজিরা লগ</h2>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {currentUser.role === 'admin' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  শিক্ষকের নাম
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                তারিখ
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                সময়
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                অবস্থা
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceRecords.length > 0 ? (
              attendanceRecords.map(record => (
                <tr key={record.id}>
                  {currentUser.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {teacherMap.get(record.teacherId) || 'অজানা'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentUser.role === 'admin' ? 4 : 3} className="px-6 py-4 text-center text-sm text-gray-500">
                  কোনো হাজিরার রেকর্ড পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherAttendanceComponent;
