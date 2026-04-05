import React from 'react';
import Layout from '../components/Layout';

const About = () => {
  const values = [
    { icon: 'fa-heart', title: 'Compassion', desc: 'Putting life first in everything we do.' },
    { icon: 'fa-bolt', title: 'Speed', desc: 'Because every second counts in an emergency.' },
    { icon: 'fa-shield-alt', title: 'Reliability', desc: 'Ensuring 100% safe and tested blood for patients.' },
    { icon: 'fa-users', title: 'Community', desc: 'Building a nationwide network of life-savers.' }
  ];

  return (
    <Layout>
      <section className="py-[100px] px-[30px] bg-linear-to-br from-[#FFF5F5] to-[#F0F7FF] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="animate-fadeInLeft">
            <span className="section-badge">Our Mission</span>
            <h1 className="text-4xl md:text-[4rem] font-extrabold mb-6 font-clash leading-[1.1]">Connecting <span className="gradient-text">Life</span> to Humanity</h1>
            <p className="text-xl text-gray leading-relaxed mb-10">
              Founded in 2020, Life4U is India's most advanced blood donation platform. Our mission is simple: to ensure that no life is lost due to unavailability of blood.
              By leveraging technology, we bridge the gap between donors and patients in real-time.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-bold text-primary font-clash">5 Years</div>
                <div className="text-gray text-sm uppercase tracking-widest font-semibold mt-1">Excellence</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary font-clash">1M+</div>
                <div className="text-gray text-sm uppercase tracking-widest font-semibold mt-1">Lives Impacted</div>
              </div>
            </div>
          </div>
          <div className="relative animate-fadeInRight">
            <img src="https://images.unsplash.com/photo-1579154235602-3c2cfa99e1bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Medical Team" className="rounded-lg shadow-xl" />
          </div>
        </div>
      </section>

      <section className="py-[100px] px-[30px] bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-[60px]">
            <span className="section-badge">Our Values</span>
            <h2 className="text-3xl md:text-[3rem] font-extrabold mb-5 font-clash">What We <span className="gradient-text">Believe</span> In</h2>
            <p className="text-gray text-lg leading-relaxed">Our core values drive every decision we make and every life we save.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="text-center p-10 bg-white rounded-lg shadow-md border border-gray/5 transition-all hover:-translate-y-2.5 hover:shadow-xl">
                <div className="w-20 h-20 bg-linear-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-[2.5rem] text-white mx-auto mb-6">
                  <i className={`fas ${v.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 font-clash">{v.title}</h3>
                <p className="text-gray leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-[100px] px-[30px] bg-dark text-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center">
          <h2 className="text-3xl md:text-[3rem] font-extrabold mb-10 font-clash">Our Journey So Far</h2>
          <div className="space-y-10 max-w-[800px] mx-auto relative before:content-[''] before:absolute before:left-1/2 before:top-0 before:w-px before:h-full before:bg-white/10 hidden md:block">
            {[
              { year: '2020', title: 'Founded', desc: 'Started with 3 volunteers and a dream in Delhi.' },
              { year: '2022', title: 'Expansion', desc: 'Reached 50 cities across North India.' },
              { year: '2024', title: 'Digital Era', desc: 'Launched AI-powered real-time matching system.' },
              { year: '2026', title: 'Nationwide', desc: 'Present in 500+ cities saving thousands daily.' }
            ].map((t, i) => (
              <div key={i} className={`flex items-center gap-10 ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="flex-1 text-right">
                  {i % 2 === 0 && (
                    <>
                      <h4 className="text-2xl font-bold font-clash text-primary mb-2">{t.year}</h4>
                      <h5 className="text-xl font-bold mb-2">{t.title}</h5>
                      <p className="text-white/70">{t.desc}</p>
                    </>
                  )}
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-light rounded-full border-4 border-dark z-1 shrink-0"></div>
                <div className="flex-1 text-left">
                  {i % 2 !== 0 && (
                    <>
                      <h4 className="text-2xl font-bold font-clash text-primary mb-2">{t.year}</h4>
                      <h5 className="text-xl font-bold mb-2">{t.title}</h5>
                      <p className="text-white/70">{t.desc}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
