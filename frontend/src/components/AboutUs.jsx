import React from 'react';

function AboutUs ()  {
  return (
    <section id="about" className="bg-gray-100 py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[#526a6e] mb-6">About RozgarHub</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-4">
          RozgarHub is a dedicated platform designed to connect blue-collar workers with job opportunities tailored to their skills and expertise. 
          Our mission is to bridge the gap between employers and workers by providing a seamless, reliable, and accessible platform for both parties.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Whether you're a skilled worker looking for your next opportunity or a business seeking reliable talent, RozgarHub is here to make the process effortless and rewarding.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;
