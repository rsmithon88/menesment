import React, { useState, useEffect, useRef } from 'react';
import { NotificationPreferences, LoggedInUser, SmsSettings, ReceiptBookSettings, SignatureSettings, GeofenceSettings, Teacher } from '../types';
import { CogIcon, ShieldCheckIcon, BellIcon, LockClosedIcon, PaperAirplaneIcon, BookOpenIcon, PencilIcon, MapPinIcon } from '../constants';

type Tab = 'general' | 'security' | 'notifications' | 'sms' | 'receipts' | 'signatures' | 'geofence';

interface SettingsProps {
    madrasahName: string;
    madrasahAddress: string;
    onUpdateSettings: (name: string, address: string) => void;
    preferences: NotificationPreferences;
    onUpdatePreferences: (prefs: NotificationPreferences) => void;
    currentUser: LoggedInUser;
    adminUser: { id: string; name: string; email: string; };
    onUpdateAdmin: (name: string, email: string, password?: string) => void;
    smsSettings: SmsSettings;
    onUpdateSmsSettings: (settings: SmsSettings) => void;
    geofenceSettings: GeofenceSettings;
    onUpdateGeofenceSettings: (settings: GeofenceSettings) => void;
    teachers: Teacher[];
    classOptions: string[];
    receiptBookSettings: ReceiptBookSettings;
    onUpdateReceiptBookSettings: (settings: ReceiptBookSettings) => void;
    signatureSettings: SignatureSettings;
    onUpdateSignatures: (file: File, type: 'classTeacher' | 'headmaster') => void;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; icon: React.FC<React.SVGProps<SVGSVGElement>> }> = ({ label, isActive, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none -mb-px border-b-2 ${
            isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-primary hover:border-gray-300'
        }`}
    >
        <Icon className="h-5 w-5 mr-2" />
        <span>{label}</span>
    </button>
);

const SignatureUploader: React.FC<{ title: string; signatureUrl?: string; onUpload: (file: File) => void; }> = ({ title, signatureUrl, onUpload }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>(signatureUrl);

    useEffect(() => {
        setPreview(signatureUrl);
    }, [signatureUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            setPreview(tempUrl); // Show local preview immediately
            onUpload(file);
            // URL.revokeObjectURL(tempUrl) is not needed here as the component might re-render.
        }
    };

    return (
        <div>
            <h4 className="font-semibold text-gray-700">{title}</h4>
            <div className="mt-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {preview ? (
                    <img src={preview} alt={title} className="max-h-20 object-contain" />
                ) : (
                    <span className="text-sm text-gray-500">স্বাক্ষর নেই</span>
                )}
            </div>
            <input
                type="file"
                accept="image/png, image/jpeg"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 w-full px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
                {signatureUrl ? 'স্বাক্ষর পরিবর্তন করুন' : 'স্বাক্ষর আপলোড করুন'}
            </button>
        </div>
    );
};


const Settings: React.FC<SettingsProps> = ({ 
    madrasahName, 
    madrasahAddress, 
    onUpdateSettings, 
    preferences, 
    onUpdatePreferences, 
    currentUser, 
    adminUser, 
    onUpdateAdmin, 
    smsSettings, 
    onUpdateSmsSettings,
    geofenceSettings,
    onUpdateGeofenceSettings,
    teachers,
    classOptions,
    receiptBookSettings,
    onUpdateReceiptBookSettings,
    signatureSettings,
    onUpdateSignatures,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  
  // Local state for forms
  const [localName, setLocalName] = useState(madrasahName);
  const [localAddress, setLocalAddress] = useState(madrasahAddress);
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [adminDetails, setAdminDetails] = useState({ name: adminUser.name, email: adminUser.email, password: '' });
  const [localSmsSettings, setLocalSmsSettings] = useState(smsSettings);
  const [localGeofenceSettings, setLocalGeofenceSettings] = useState(geofenceSettings);
  const [localReceiptBookSettings, setLocalReceiptBookSettings] = useState(receiptBookSettings);

  const [testSmsNumber, setTestSmsNumber] = useState('');
  const [testSmsMessage, setTestSmsMessage] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testSmsError, setTestSmsError] = useState('');

  // Sync local state with props
  useEffect(() => { setLocalName(madrasahName); }, [madrasahName]);
  useEffect(() => { setLocalAddress(madrasahAddress); }, [madrasahAddress]);
  useEffect(() => { setLocalPrefs(preferences); }, [preferences]);
  useEffect(() => { setAdminDetails({ name: adminUser.name, email: adminUser.email, password: '' }); }, [adminUser]);
  useEffect(() => { setLocalSmsSettings(smsSettings); }, [smsSettings]);
  useEffect(() => { setLocalGeofenceSettings(geofenceSettings); }, [geofenceSettings]);
  useEffect(() => { setLocalReceiptBookSettings(receiptBookSettings || {}); }, [receiptBookSettings]);


  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localName, localAddress);
  };
  
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdmin(adminDetails.name, adminDetails.email, adminDetails.password || undefined);
    setAdminDetails(prev => ({ ...prev, password: '' })); // Clear password field after submit
  };
  
  const handlePrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences(localPrefs);
  };

  const handleSmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSmsSettings(localSmsSettings);
  };
  
  const handleGeofenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGeofenceSettings(localGeofenceSettings);
  };

  const handleGeofenceTeacherChange = (teacherId: string, checked: boolean) => {
    setLocalGeofenceSettings(prev => {
        const currentTeachers = prev.restrictedTeachers || [];
        if (checked) {
            return { ...prev, restrictedTeachers: [...currentTeachers, teacherId] };
        } else {
            return { ...prev, restrictedTeachers: currentTeachers.filter(id => id !== teacherId) };
        }
    });
  };

  const handleReceiptBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateReceiptBookSettings(localReceiptBookSettings);
  };
  
  const handleReceiptBookChange = (className: string, value: string) => {
      const bookNumber = parseInt(value) || 0;
      setLocalReceiptBookSettings(prev => ({...prev, [className]: bookNumber}));
  };

  const handleTestSms = async () => {
    setTestSmsStatus('sending');
    setTestSmsError('');
    let to = testSmsNumber;
    if (!to.startsWith('+88')) {
        if (to.length === 11 && to.startsWith('0')) {
            to = `+88${to}`;
        } else if (to.length === 10) {
            to = `+880${to}`;
        } else {
           setTestSmsStatus('error');
           setTestSmsError('অবৈধ ফোন নম্বর। +880... ফরম্যাটে দিন।');
           return;
        }
    }

    try {
        let response;
        if (localSmsSettings.mode === 'cloud') {
            const url = `https://api.textbee.dev/api/v1/gateway/devices/${localSmsSettings.deviceId}/sendSMS`;
            response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": localSmsSettings.apiKey },
                body: JSON.stringify({ "recipients": [to], "message": testSmsMessage || "টেস্ট মেসেজ" })
            });
        } else {
            response = await fetch(localSmsSettings.gatewayUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "api-key": localSmsSettings.apiKey, "to": to, "message": testSmsMessage || "টেস্ট মেসেজ" })
            });
        }

        if (response.ok) {
            setTestSmsStatus('success');
        } else {
            const errorText = await response.text();
            throw new Error(`সার্ভার থেকে ত্রুটি: ${errorText}`);
        }
    } catch (error: any) {
        setTestSmsStatus('error');
        setTestSmsError(`মেসেজ পাঠাতে ব্যর্থ। ${error.message}. আপনার সংযোগ এবং সেটিংস পরীক্ষা করুন।`);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-2 px-4 overflow-x-auto">
          <TabButton label="সাধারণ" isActive={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={CogIcon} />
          {currentUser.role === 'admin' && <TabButton label="নিরাপত্তা" isActive={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={LockClosedIcon} />}
          <TabButton label="বিজ্ঞপ্তি" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={BellIcon} />
          {currentUser.role === 'admin' && <TabButton label="SMS সেটিংস" isActive={activeTab === 'sms'} onClick={() => setActiveTab('sms')} icon={PaperAirplaneIcon} />}
          {currentUser.role === 'admin' && <TabButton label="অবস্থান ভিত্তিক অ্যাক্সেস" isActive={activeTab === 'geofence'} onClick={() => setActiveTab('geofence')} icon={MapPinIcon} />}
          {currentUser.role === 'admin' && <TabButton label="রশিদ বই" isActive={activeTab === 'receipts'} onClick={() => setActiveTab('receipts')} icon={BookOpenIcon} />}
          {currentUser.role === 'admin' && <TabButton label="স্বাক্ষর" isActive={activeTab === 'signatures'} onClick={() => setActiveTab('signatures')} icon={PencilIcon} />}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'general' && (
          <form onSubmit={handleGeneralSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">মাদ্রাসার নাম</label>
                <input type="text" value={localName} onChange={(e) => setLocalName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">মাদ্রাসার ঠিকানা</label>
                <input type="text" value={localAddress} onChange={(e) => setLocalAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <div className="mt-6 text-right">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">সংরক্ষণ করুন</button>
            </div>
          </form>
        )}
        
        {activeTab === 'security' && (
           <form onSubmit={handleAdminSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">অ্যাডমিন নাম</label>
                <input type="text" value={adminDetails.name} onChange={(e) => setAdminDetails(p => ({...p, name: e.target.value}))} className="mt-1 block w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">অ্যাডমিন ইমেইল</label>
                <input type="email" value={adminDetails.email} onChange={(e) => setAdminDetails(p => ({...p, email: e.target.value}))} className="mt-1 block w-full border rounded-md p-2" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">নতুন পাসওয়ার্ড (ঐচ্ছিক)</label>
                <input type="password" value={adminDetails.password} onChange={(e) => setAdminDetails(p => ({...p, password: e.target.value}))} placeholder="পরিবর্তন করতে চাইলে টাইপ করুন" className="mt-1 block w-full border rounded-md p-2" />
              </div>
            </div>
            <div className="mt-6 text-right">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">আপডেট করুন</button>
            </div>
          </form>
        )}

        {activeTab === 'notifications' && (
          <form onSubmit={handlePrefsSubmit}>
            <div className="space-y-4">
               <label className="flex items-center">
                <input type="checkbox" checked={localPrefs.fees} onChange={(e) => setLocalPrefs(p => ({...p, fees: e.target.checked}))} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <span className="ml-2 text-gray-700">ফি সংক্রান্ত বিজ্ঞপ্তি</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" checked={localPrefs.exams} onChange={(e) => setLocalPrefs(p => ({...p, exams: e.target.checked}))} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <span className="ml-2 text-gray-700">পরীক্ষা সংক্রান্ত বিজ্ঞপ্তি</span>
              </label>
               <label className="flex items-center">
                <input type="checkbox" checked={localPrefs.notices} onChange={(e) => setLocalPrefs(p => ({...p, notices: e.target.checked}))} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                <span className="ml-2 text-gray-700">নোটিশ বোর্ড সংক্রান্ত বিজ্ঞপ্তি</span>
              </label>
            </div>
             <div className="mt-6 text-right">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">সংরক্ষণ করুন</button>
            </div>
          </form>
        )}
        
        {activeTab === 'sms' && (
          <form onSubmit={handleSmsSubmit}>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">SMS গেটওয়ে মোড</label>
                    <div className="mt-2 flex space-x-4">
                        <label className="flex items-center">
                            <input type="radio" name="smsMode" value="local" checked={localSmsSettings.mode === 'local'} onChange={(e) => setLocalSmsSettings(p => ({...p, mode: e.target.value as 'local' | 'cloud'}))} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" />
                            <span className="ml-2">লোকাল সার্ভার (WiFi)</span>
                        </label>
                         <label className="flex items-center">
                            <input type="radio" name="smsMode" value="cloud" checked={localSmsSettings.mode === 'cloud'} onChange={(e) => setLocalSmsSettings(p => ({...p, mode: e.target.value as 'local' | 'cloud'}))} className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" />
                            <span className="ml-2">ক্লাউড API</span>
                        </label>
                    </div>
                </div>

                {localSmsSettings.mode === 'local' ? (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">গেটওয়ে URL</label>
                        <input type="text" value={localSmsSettings.gatewayUrl} onChange={(e) => setLocalSmsSettings(p => ({...p, gatewayUrl: e.target.value}))} placeholder="http://192.168.0.100:8080/send" className="mt-1 block w-full border rounded-md p-2" />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ডিভাইস ID</label>
                        <input type="text" value={localSmsSettings.deviceId} onChange={(e) => setLocalSmsSettings(p => ({...p, deviceId: e.target.value}))} placeholder="আপনার TextBee ডিভাইস ID" className="mt-1 block w-full border rounded-md p-2" />
                    </div>
                )}
                 <div>
                    <label className="block text-sm font-medium text-gray-700">API Key</label>
                    <input type="text" value={localSmsSettings.apiKey} onChange={(e) => setLocalSmsSettings(p => ({...p, apiKey: e.target.value}))} placeholder="আপনার TextBee API Key" className="mt-1 block w-full border rounded-md p-2" />
                </div>
                 <label className="flex items-center">
                    <input type="checkbox" checked={localSmsSettings.enabled} onChange={(e) => setLocalSmsSettings(p => ({...p, enabled: e.target.checked}))} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                    <span className="ml-2 text-gray-700">স্বয়ংক্রিয় SMS চালু করুন</span>
                 </label>
            </div>
            <div className="mt-6 pt-6 border-t">
                 <h4 className="text-lg font-medium text-gray-900 mb-4">কালেকশন টেস্ট করুন</h4>
                 <div className="space-y-4">
                    <input type="text" value={testSmsNumber} onChange={(e) => setTestSmsNumber(e.target.value)} placeholder="প্রাপকের মোবাইল নম্বর (+880...)" className="block w-full border rounded-md p-2" />
                    <textarea value={testSmsMessage} onChange={(e) => setTestSmsMessage(e.target.value)} placeholder="মেসেজ লিখুন (ঐচ্ছিক)" rows={2} className="block w-full border rounded-md p-2" />
                    <button type="button" onClick={handleTestSms} disabled={!testSmsNumber || testSmsStatus === 'sending'} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {testSmsStatus === 'sending' ? 'পাঠানো হচ্ছে...' : 'টেস্ট মেসেজ পাঠান'}
                    </button>
                    {testSmsStatus === 'success' && <p className="text-green-600">মেসেজ সফলভাবে পাঠানো হয়েছে।</p>}
                    {testSmsStatus === 'error' && <p className="text-red-600">{testSmsError}</p>}
                 </div>
            </div>
            <div className="mt-6 text-right">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">সেটিংস সংরক্ষণ</button>
            </div>
          </form>
        )}
        
        {activeTab === 'geofence' && (
            <form onSubmit={handleGeofenceSubmit}>
                <div className="space-y-6">
                    <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 text-yellow-800 rounded-r-lg">
                        <p className="font-bold">নির্দেশনা</p>
                        <p className="text-sm mt-1">
                            এই ফিচারটি চালু করলে, নির্বাচিত শিক্ষকরা শুধুমাত্র আপনার নির্ধারণ করা ভৌগলিক সীমানার (Geofence) ভেতর থেকেই অ্যাপে লগইন করতে পারবেন। অক্ষাংশ (Latitude) ও দ্রাঘিমাংশ (Longitude) বের করতে <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="font-bold underline">Google Maps</a> ব্যবহার করুন।
                        </p>
                    </div>

                    <label className="flex items-center cursor-pointer w-fit">
                        <input type="checkbox" checked={localGeofenceSettings.enabled} onChange={(e) => setLocalGeofenceSettings(p => ({...p, enabled: e.target.checked}))} className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary" />
                        <span className="ml-3 text-gray-700 font-medium">অবস্থান-ভিত্তিক অ্যাক্সেস চালু করুন</span>
                    </label>

                    <div className={`space-y-4 transition-opacity duration-300 ${localGeofenceSettings.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">অক্ষাংশ (Latitude)</label>
                                <input type="number" step="any" value={localGeofenceSettings.latitude} onChange={e => setLocalGeofenceSettings(p => ({...p, latitude: e.target.value}))} placeholder="e.g., 23.8103" className="mt-1 block w-full border rounded-md p-2" disabled={!localGeofenceSettings.enabled} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">দ্রাঘিমাংশ (Longitude)</label>
                                <input type="number" step="any" value={localGeofenceSettings.longitude} onChange={e => setLocalGeofenceSettings(p => ({...p, longitude: e.target.value}))} placeholder="e.g., 90.4125" className="mt-1 block w-full border rounded-md p-2" disabled={!localGeofenceSettings.enabled} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">ব্যাসার্ধ (মিটারে)</label>
                            <input type="number" value={localGeofenceSettings.radius} onChange={e => setLocalGeofenceSettings(p => ({...p, radius: e.target.value}))} placeholder="e.g., 100" className="mt-1 block w-full border rounded-md p-2" disabled={!localGeofenceSettings.enabled} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">সীমাবদ্ধ শিক্ষকগণ</label>
                            <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                                {teachers.map(teacher => (
                                    <label key={teacher.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={localGeofenceSettings.restrictedTeachers?.includes(teacher.id)}
                                            onChange={e => handleGeofenceTeacherChange(teacher.id, e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                            disabled={!localGeofenceSettings.enabled}
                                        />
                                        <span className="text-sm">{teacher.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">সংরক্ষণ করুন</button>
                </div>
            </form>
        )}

        {activeTab === 'receipts' && (
          <form onSubmit={handleReceiptBookSubmit}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">প্রতিটি শ্রেণীর জন্য রশিদ বইয়ের নম্বর নির্ধারণ করুন। এই নম্বরটি ফি আদায়ের রশিদে ব্যবহৃত হবে।</p>
              <div className="max-h-80 overflow-y-auto pr-2">
                {classOptions.map(className => (
                  <div key={className} className="flex items-center gap-4 mb-3">
                    <label className="w-1/3 text-right text-sm font-medium text-gray-700">{className}</label>
                    <input 
                      type="number" 
                      value={localReceiptBookSettings[className] || ''} 
                      onChange={(e) => handleReceiptBookChange(className, e.target.value)} 
                      className="w-2/3 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary" 
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 text-right">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary">রশিদ বই সেটিংস সংরক্ষণ</button>
            </div>
          </form>
        )}

        {activeTab === 'signatures' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">স্বাক্ষর ব্যবস্থাপনা</h3>
            <p className="text-sm text-gray-600 mb-6">এখানে শ্রেণি শিক্ষক এবং মুহতামিমের স্বাক্ষর আপলোড করুন। এই স্বাক্ষরগুলো প্রবেশপত্রে স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SignatureUploader
                    title="শ্রেণি শিক্ষকের স্বাক্ষর"
                    signatureUrl={signatureSettings.classTeacherSignatureUrl}
                    onUpload={(file) => onUpdateSignatures(file, 'classTeacher')}
                />
                <SignatureUploader
                    title="মুহতামিমের স্বাক্ষর"
                    signatureUrl={signatureSettings.headmasterSignatureUrl}
                    onUpload={(file) => onUpdateSignatures(file, 'headmaster')}
                />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
