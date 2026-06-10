import React, { useState, useEffect } from 'react';
import axios from 'axios';

const defaultProfile = {
  facultyId: '',
  employeeId: '',
  name: '',
  email: '',
  courses: [],
  position: '',
  contactInfo: { email: '', phone: '' },
  areasOfExpertise: [''],
  classesHandled: [
    {
      course: '',
      semester: '',
      section: '',
      year: ''
    }
  ],
  dob: '',
  dateOfJoining: '',
  department: '',
  gender: '',
  profilePicUrl: '',
  isActive: true,
  scaleOfPay: '',
  presentPay: '',
  natureOfAppointment: ''
};

const formatDateValue = (value) => {
  if (!value) return '';
  return typeof value === 'string'
    ? value.substring(0, 10)
    : new Date(value).toISOString().substring(0, 10);
};

const toCourseId = (course) => {
  if (!course) return '';
  return String(typeof course === 'object' ? course._id : course);
};

const normalizeProfile = (data = {}, allCourses = []) => {
  const validCourseIds = new Set(allCourses.map(course => String(course._id)));
  let courses = data.courses?.map(toCourseId).filter(Boolean) || [];

  if (validCourseIds.size > 0) {
    courses = courses.filter(courseId => validCourseIds.has(String(courseId)));
  }

  return {
    ...defaultProfile,
    ...data,
    contactInfo: {
      ...defaultProfile.contactInfo,
      ...(data.contactInfo || {})
    },
    courses,
    areasOfExpertise:
      data.areasOfExpertise?.length ? data.areasOfExpertise : [''],
    classesHandled:
      data.classesHandled?.length
        ? data.classesHandled.map(cls => ({
            course: toCourseId(cls.course?._id || cls.course),
            semester: cls.semester || '',
            section: cls.section || '',
            year: cls.year || ''
          }))
        : defaultProfile.classesHandled,
    dob: formatDateValue(data.dob),
    dateOfJoining: formatDateValue(data.dateOfJoining)
  };
};

const buildSubmitPayload = (profile) => {
  const {
    _id,
    __v,
    createdAt,
    updatedAt,
    ...rest
  } = profile;

  return {
    ...rest,
    areasOfExpertise: rest.areasOfExpertise.filter(area => area && area.trim()),
    classesHandled: rest.classesHandled.filter(
      cls => cls.course || cls.semester || cls.section || cls.year
    ),
    presentPay:
      rest.presentPay === '' || rest.presentPay == null
        ? undefined
        : Number(rest.presentPay)
  };
};

const UpdateProfile = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);
  const [allCourses, setAllCourses] = useState([]);

  useEffect(() => {
    const loggedInFaculty = localStorage.getItem('loggedInFaculty');
    if (loggedInFaculty) {
      const faculty = JSON.parse(loggedInFaculty);
      if (faculty.facultyId) {
        Promise.all([
          axios.get(`/api/faculty/${faculty.facultyId}`),
          axios.get('/api/courses')
        ])
          .then(([facultyRes, coursesRes]) => {
            setAllCourses(coursesRes.data);
            setProfile(normalizeProfile(facultyRes.data, coursesRes.data));
            setFetching(false);
          })
          .catch(() => {
            axios.get('/api/courses')
              .then(coursesRes => {
                setAllCourses(coursesRes.data);
                setProfile(normalizeProfile(faculty, coursesRes.data));
              })
              .finally(() => setFetching(false));
          });
      } else {
        axios.get('/api/courses')
          .then(coursesRes => {
            setAllCourses(coursesRes.data);
            setProfile(normalizeProfile(faculty, coursesRes.data));
          })
          .finally(() => setFetching(false));
      }
    } else {
      setFetching(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('contactInfo.')) {
      const key = name.split('.')[1];
      setProfile({ ...profile, contactInfo: { ...profile.contactInfo, [key]: value } });
    } else if (type === 'checkbox') {
      setProfile({ ...profile, [name]: checked });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleArrayChange = (idx, value) => {
    const arr = [...profile.areasOfExpertise];
    arr[idx] = value;
    setProfile({ ...profile, areasOfExpertise: arr });
  };

  const addExpertise = () => setProfile({ ...profile, areasOfExpertise: [...profile.areasOfExpertise, ''] });
  const removeExpertise = (idx) => setProfile({ ...profile, areasOfExpertise: profile.areasOfExpertise.filter((_, i) => i !== idx) });

  const handleClassChange = (idx, field, value) => {
    const arr = [...profile.classesHandled];
    arr[idx] = { ...arr[idx], [field]: value };
    setProfile({ ...profile, classesHandled: arr });
  };
  
  const addClass = () =>
  setProfile({
    ...profile,
    classesHandled: [
      ...profile.classesHandled,
      {
        course: '',
        semester: '',
        section: '',
        year: ''
      }
    ]
  });
  const removeClass = (idx) => setProfile({ ...profile, classesHandled: profile.classesHandled.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = buildSubmitPayload(profile);
      const res = await axios.post('/api/faculty/update-profile', payload);
      const updatedProfile = normalizeProfile(
        res.data.faculty || payload,
        allCourses
      );

      setProfile(updatedProfile);
      localStorage.setItem(
        'loggedInFaculty',
        JSON.stringify({
          ...JSON.parse(localStorage.getItem('loggedInFaculty') || '{}'),
          ...updatedProfile
        })
      );
      setSuccess('Profile records updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update system profile. Please verify structural logs.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-slate-500 font-medium text-sm">Syncing secure profile parameters...</p>
      </div>
    );
  }

  // Global Tailwind dynamic reusable standard style mappings
  const inputStyle = "w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl py-2.5 px-4 text-slate-800 text-sm transition-all outline-none placeholder-slate-400 font-medium shadow-sm";
  const labelStyle = "block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5";
  const cardStyle = "bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6";

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
      {/* Dynamic Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Information System</h1>
          <p className="text-sm text-slate-500 mt-1">Review and maintain your official university registration credentials.</p>
        </div>
        
        {/* Profile Avatar Frame Context */}
        <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-3 shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex-shrink-0 overflow-hidden shadow-md border border-white flex items-center justify-center text-white font-bold text-lg">
            {profile.profilePicUrl ? (
              <img src={profile.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.name ? profile.name.charAt(0).toUpperCase() : 'F'
            )}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-800">{profile.name || "Academic Profile"}</h4>
            <span className="inline-flex items-center text-xs font-semibold text-indigo-600">
              {profile.position || "Faculty Member"}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Status Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start space-x-3 text-red-700 text-sm font-medium animate-shake">
          <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start space-x-3 text-emerald-800 text-sm font-medium animate-fadeIn">
          <svg className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}

        <form
    noValidate
    onSubmit={handleSubmit}
    className="space-y-8"
        >
        
        {/* CARD SECTION 1: Core System Identifiers */}
        <div className={cardStyle}>
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <span className="text-xl">🔑</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Core Operational Credentials</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>Faculty ID (Required)</label>
              <input name="facultyId" value={profile.facultyId} onChange={handleChange} className={`${inputStyle} bg-slate-50 font-mono`} required disabled />
            </div>
            <div>
              <label className={labelStyle}>Employee ID</label>
              <input name="employeeId" value={profile.employeeId} onChange={handleChange} className={`${inputStyle} font-mono`} placeholder="EMP-XXXX" />
            </div>
            <div>
              <label className={labelStyle}>Account Status</label>
              <div className="flex items-center h-11 px-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" checked={profile.isActive} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-semibold text-slate-700">{profile.isActive ? 'Active Duty' : 'Inactive'}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* CARD SECTION 2: General Demographics & Identity */}
        <div className={cardStyle}>
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <span className="text-xl">👤</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Personal & Professional Identity</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Legal Name</label>
              <input name="name" value={profile.name} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Primary Portal Email</label>
              <input name="email" type="email" value={profile.email} onChange={handleChange} className={inputStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Department Affiliation</label>
              <input name="department" value={profile.department} onChange={handleChange} className={inputStyle} placeholder="Computer Science & Engineering" />
            </div>
            <div>
              <label className={labelStyle}>Current Placement / Position</label>
              <input name="position" value={profile.position} onChange={handleChange} className={inputStyle} placeholder="Assistant Professor / Senior Lecturer" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <label className={labelStyle}>Date of Birth</label>
              <input name="dob" type="date" value={profile.dob} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Date of Joining</label>
              <input name="dateOfJoining" type="date" value={profile.dateOfJoining} onChange={handleChange} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Gender Classification</label>
              <div className="relative">
                <select name="gender" value={profile.gender} onChange={handleChange} className={`${inputStyle} appearance-none`}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <label className={labelStyle}>External Image Portrait URL</label>
            <input name="profilePicUrl" value={profile.profilePicUrl} onChange={handleChange} className={inputStyle} placeholder="https://domain.cdn/assets/images/profile.jpg" />
          </div>
        </div>

        {/* CARD SECTION 3: Emergency & Contact Framework */}
        <div className={cardStyle}>
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <span className="text-xl">📞</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Contact Matrix</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Contact Email Address</label>
              <input name="contactInfo.email" type="email" value={profile.contactInfo.email} onChange={handleChange} className={inputStyle} placeholder="contact@domain.com" />
            </div>
            <div>
              <label className={labelStyle}>Mobile / Telephone Channel</label>
              <input name="contactInfo.phone" type="tel" value={profile.contactInfo.phone} onChange={handleChange} className={inputStyle} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        {/* CARD SECTION 4: Academic Workload Arrays */}
        <div className={cardStyle}>
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <span className="text-xl">🎓</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Course Mapping & Dynamic Expertise</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Assigned Core Course Title(s)</label>
                <select
                multiple
                className={inputStyle}
                value={(profile.courses || []).map(String)}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    option => option.value
                  );

                  setProfile({
                    ...profile,
                    courses: values
                  });
                }}
              >
                {allCourses.map(course => (
                  <option
                    key={course._id}
                    value={String(course._id)}
                  >
                    {course.courseCode} - {course.courseName}
                  </option>
                ))}
              </select>
            </div> 
          </div>

          {/* Sub block: Areas of Expertise */}
          <div className="space-y-3 pt-4 border-t border-slate-50">
            <div className="flex justify-between items-center">
              <label className={labelStyle}>Technical Expertise Fields</label>
              <button type="button" onClick={addExpertise} className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1">
                <span>+ Add Area</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.areasOfExpertise.map((exp, idx) => (
                <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 border border-slate-200/60 rounded-xl shadow-inner">
                  <input value={exp} onChange={e => handleArrayChange(idx, e.target.value)} className="w-full bg-transparent border-none py-1 px-2 text-sm text-slate-800 outline-none placeholder-slate-400 font-semibold" placeholder="e.g., Cryptography" />
                  <button type="button" onClick={() => removeExpertise(idx)} className="text-xs text-red-500 hover:bg-red-50 p-1.5 rounded-lg font-medium transition-colors">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sub block: Classes Handled */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className={labelStyle}>Active Scheduled Classes Handled</label>
              <button type="button" onClick={addClass} className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1">
                <span>+ Add Class Row</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {profile.classesHandled.map((cls, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl relative group">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-grow">
                    <select
                      value={String(cls.course || '')}
                      onChange={(e) =>
                        handleClassChange(
                          idx,
                          'course',
                          e.target.value
                        )
                      }
                      className={`${inputStyle} py-2 text-xs`}
                    >
                      <option value="">Select Course</option>

                      {allCourses.map(course => (
                        <option
                          key={course._id}
                          value={String(course._id)}
                        >
                          {course.courseCode} - {course.courseName}
                        </option>
                      ))}
                    </select>
                    <input placeholder="Semester" value={cls.semester} onChange={e => handleClassChange(idx, 'semester', e.target.value)} className={`${inputStyle} py-2 text-xs`} />
                    <input placeholder="Section" value={cls.section} onChange={e => handleClassChange(idx, 'section', e.target.value)} className={`${inputStyle} py-2 text-xs`} />
                    <input placeholder="Year" value={cls.year} onChange={e => handleClassChange(idx, 'year', e.target.value)} className={`${inputStyle} py-2 text-xs`} />
                  </div>
                  <button type="button" onClick={() => removeClass(idx)} className="text-xs text-red-500 font-semibold hover:bg-red-50 px-3 py-2 rounded-xl transition-colors md:mt-0 text-center border border-transparent hover:border-red-100">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CARD SECTION 5: Payroll & HR Parameters */}
        <div className={cardStyle}>
          <div className="border-b border-slate-100 pb-3 flex items-center space-x-2">
            <span className="text-xl">💼</span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Compensation & HR Context</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>Scale of Pay Matrix</label>
              <input name="scaleOfPay" value={profile.scaleOfPay} onChange={handleChange} className={inputStyle} placeholder="Level-10 Entry Level" />
            </div>
            <div>
              <label className={labelStyle}>Present Basic Pay</label>
              <input name="presentPay" type="number" value={profile.presentPay} onChange={handleChange} className={inputStyle} placeholder="0.00" />
            </div>
            <div>
              <label className={labelStyle}>Nature of Appointment</label>
              <input name="natureOfAppointment" value={profile.natureOfAppointment} onChange={handleChange} className={inputStyle} placeholder="Permanent / Contract" />
            </div>
          </div>
        </div>

        {/* Bottom Form Actions Control Bar */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl py-3.5 px-8 shadow-md hover:shadow-indigo-200 hover:shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Commiting System Records...</span>
              </span>
            ) : (
              'Save Profile Variations'
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default UpdateProfile;