import React from 'react';

const teamMembers = [
  {
    name: 'Shalini P',
    image: '/images/shalini.jpg',
    degree: 'B.E. Computer Science and Engineering',
    year: '3rd Year',
  },
  {
    name: 'Sivapriya S',
    image: '/images/sivapriya.jpg',
    degree: 'B.E. Computer Science and Engineering',
    year: '3rd Year',
  },
  {
    name: 'Shree Vekka Narayanee K',
    image: '/images/shree.jpg',
    degree: 'B.E. Computer Science and Engineering',
    year: '3rd Year',
  },
  {
    name: 'Anika Rathina',
    image: '/images/anika.jpg',
    degree: 'B.E. Computer Science and Engineering',
    year: '3rd Year',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 py-0 px-2">
      <div className="w-full max-w-6xl mx-auto mt-12 mb-8 bg-white/80 rounded-3xl shadow-2xl p-10 backdrop-blur-md border border-blue-100 animate-fade-in-up">
        {/* Intro Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-6 tracking-tight drop-shadow-lg font-sans">About the PG Examinations Portal</h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            The PG Examinations Management Portal was developed as part of a summer internship project. It is designed to streamline core processes related to postgraduate examinations including session scheduling, student strength input, question paper setter assignments, invigilation duties, seating arrangements, and faculty claim generation through a centralized and intuitive platform.
          </p>
        </div>

        {/* Team Section */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-10 text-center tracking-wide font-sans">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-center items-stretch">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white/90 rounded-2xl shadow-xl p-7 flex flex-col items-center justify-between border border-blue-100 transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-blue-300 group min-h-[300px] max-w-xs mx-auto"
                style={{ minHeight: '320px' }}
              >
                <div className="flex flex-col items-center w-full">
                  <div className="w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-blue-200 shadow-lg group-hover:border-blue-400 transition-all duration-200">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1 font-sans group-hover:text-purple-700 transition-colors duration-200 text-center">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-1 text-center font-medium">{member.degree}</p>
                  <p className="text-sm text-gray-500 text-center">{member.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Footer Note */}
        <footer className="mt-10 text-center text-gray-500 text-base font-medium pt-6 border-t border-blue-100">
       <i>This portal was built during a summer internship by students from the Department of Computer Science and Engineering, Anna University!!!</i> 
        </footer>
      </div>
    </div>
  );
};

export default AboutPage; 