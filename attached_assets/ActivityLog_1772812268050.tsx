import React, { useState, useEffect } from 'react';
import { ActivityLogEntry, ActiveSession } from '../types';
import { UsersIcon, ShieldCheckIcon } from '../constants';

interface ActivityLogProps {
  logs: ActivityLogEntry[];
  activeSessions: ActiveSession[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logs, activeSessions }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000); // Update every 10 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-4 flex items-center">
          <UsersIcon className="h-6 w-6 mr-3 text-primary" />
          সক্রিয় ব্যবহারকারীগণ
        </h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ব্যবহারকারীর নাম</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">পদবী</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">লগইন সময়</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeSessions.length > 0 ? (
                  activeSessions.map(session => {
                    const lastActiveDate = new Date(session.lastActive || session.loginTime);
                    const diffInSeconds = (now.getTime() - lastActiveDate.getTime()) / 1000;
                    const isActive = diffInSeconds < 60;

                    return (
                        <tr key={session.userId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              {isActive ? (
                                <span className="relative flex h-3 w-3 mr-3" title="সক্রিয়">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                              ) : (
                                <span className="flex h-3 w-3 mr-3" title="নিষ্ক্রিয়">
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-300"></span>
                                </span>
                              )}
                              {session.userName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{session.userRole === 'admin' ? 'অ্যাডমিন' : 'শিক্ষক'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(session.loginTime).toLocaleString('bn-BD', {
                                day: 'numeric', month: 'long', year: 'numeric',
                                hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
                            })}
                          </td>
                        </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      বর্তমানে কোনো ব্যবহারকারী অনলাইনে নেই।
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-text-primary mb-4 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-3 text-primary" />
            কার্যকলাপের বিবরণ
        </h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
           <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">সময়</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ব্যবহারকারী</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">কার্যকলাপ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.length > 0 ? (
                  logs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString('bn-BD', {
                            day: 'numeric', month: 'short',
                            hour: 'numeric', minute: 'numeric', hour12: true
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                    </tr>
                  ))
                ) : (
                    <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                            কোনো কার্যকলাপ রেকর্ড করা হয়নি।
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
