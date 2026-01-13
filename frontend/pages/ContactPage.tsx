import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import { useTranslation } from '../context/LanguageContext';
import { api } from '../services/api';

// 3D Scene Component
const SecureGlobe = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere args={[1, 100, 200]} scale={2}>
        <MeshDistortMaterial
          color="#3b82f6"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </Float>
  );
};

export default function ContactPage() {
  const { t } = useTranslation();
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formDepartment, setFormDepartment] = useState('General Information');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage) return;

    setIsSubmitting(true);

    try {
      const result = await api.sendInquiry({
        name: formName,
        email: formEmail,
        department: formDepartment,
        message: formMessage
      });

      if (result.success) {
        setIsSuccess(true);
        setFormEmail('');
        setFormName('');
        setFormMessage('');
      } else {
        alert("Failed to send inquiry. Please try again.");
      }
    } catch (error) {
      console.error("Submission failed", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow bg-slate-50 dark:bg-slate-950 relative overflow-hidden font-sans transition-colors duration-300">

      {/* 3D Background Layer */}
      <div className="absolute top-0 right-0 w-full h-full md:w-1/2 opacity-20 pointer-events-none z-0">
        <Canvas>
          <Suspense fallback={null}>
            <SecureGlobe />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* Header */}
        <div className="mb-16 text-center md:text-left">
          <span className="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-[0.3em]">Official Channels</span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-4 mb-2">Contact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Support</span></h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl font-medium">
            Reach out to the National Child Protection Authority or Sri Lanka Police for inquiries. For emergencies, please call the hotlines directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Left Column: Official Contacts */}
          <div className="space-y-8">

            {/* Emergency Card */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-xl shadow-red-500/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-siren-on text-9xl text-red-600"></i>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                    <i className="fas fa-phone-rotary animate-pulse"></i>
                  </div>
                  <span className="text-red-500 dark:text-red-400 font-black uppercase text-[10px] tracking-widest">Emergency Hotline</span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2">119</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold mb-6">Sri Lanka Police Emergency Unit</p>
                <a href="tel:119" className="inline-flex items-center justify-center w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                  Call Now
                </a>
              </div>
            </div>

            {/* NCPA Card */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30 shadow-xl shadow-blue-500/5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity">
                <i className="fas fa-shield-check text-9xl text-blue-600"></i>
              </div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <i className="fas fa-child-reaching"></i>
                  </div>
                  <span className="text-blue-500 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest">Child Protection</span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2">1929</h2>
                <p className="text-slate-600 dark:text-slate-400 font-bold mb-6">National Child Protection Authority (NCPA)</p>
                <a href="tel:1929" className="inline-flex items-center justify-center w-full py-4 bg-blue-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                  Call ChildLine
                </a>
              </div>
            </div>

            {/* Address / Info */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-start gap-4">
                  <i className="fas fa-location-dot mt-1 text-blue-400"></i>
                  <div>
                    <h4 className="font-bold">Headquarters</h4>
                    <p className="text-slate-400 text-sm">No. 330, Thalawathogoda Road,<br />Madiwela, Sri Lanka.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <i className="fas fa-clock mt-1 text-blue-400"></i>
                  <div>
                    <h4 className="font-bold">Operating Hours</h4>
                    <p className="text-slate-400 text-sm">Mon - Fri: 8:30 AM - 4:15 PM<br />Hotlines: 24/7</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Inquiry Form */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-md p-8 md:p-10 rounded-[3rem] border border-white dark:border-slate-800 shadow-2xl relative">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">General Inquiries</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 font-medium">For non-emergency questions regarding policies, volunteering, or technical support.</p>

            {isSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
                  <i className="fas fa-check"></i>
                </div>
                <h4 className="text-xl font-bold text-emerald-900 mb-2">Inquiry Sent</h4>
                <p className="text-emerald-700 text-sm">Thank you. Your reference ID is <span className="font-mono font-bold">#REQ-{Math.floor(Math.random() * 9000) + 1000}</span>.</p>
                <button onClick={() => setIsSuccess(false)} className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-800">Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold text-slate-900 dark:text-white outline-none"
                      placeholder="e.g. Ruwan Perera"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 pl-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold text-slate-900 dark:text-white outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 pl-2">Select Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold text-slate-900 dark:text-white outline-none appearance-none"
                  >
                    <option>General Information</option>
                    <option>Technical Support</option>
                    <option>Media & Press</option>
                    <option>NGO Collaboration</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 pl-2">Your Message</label>
                  <textarea
                    rows={5}
                    required
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-bold text-slate-900 dark:text-white outline-none resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  {isSubmitting ? 'Processing...' : (
                    <><span>Send Inquiry</span> <i className="fas fa-paper-plane"></i></>
                  )}
                </button>

                <p className="text-center text-[10px] text-slate-400 font-medium">
                  This site is protected by reCAPTCHA and the Google <a href="#" className="underline">Privacy Policy</a> and <a href="#" className="underline">Terms of Service</a> apply.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
