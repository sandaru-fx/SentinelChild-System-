
import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 text-xl">
      <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 -z-10"></div>
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-8 animate-fade-in">
            <i className="fas fa-user-secret"></i> Secure & Anonymous
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Protecting Children,<br/><span className="text-blue-600">Empowering Citizens.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Report incidents of harassment or abuse safely. Our encrypted platform connects your voice directly to law enforcement for immediate action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/report" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
              <i className="fas fa-file-signature"></i> Start a Report
            </Link>
            <Link to="/status" className="w-full sm:w-auto bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
              <i className="fas fa-search"></i> Track My Report
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Designed for Safety & Privacy</h2>
          <p className="text-slate-600 max-w-xl mx-auto">We prioritize the security of sensitive information while ensuring that law enforcement can act swiftly.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="fa-mask"
            title="Anonymous Reporting"
            description="Submit reports without sharing your identity. We do not track IP addresses or personal metadata for anonymous entries."
          />
          <FeatureCard 
            icon="fa-cloud-upload"
            title="Secure Evidence"
            description="Upload images, videos, and documents to our encrypted cloud storage accessible only to authorized personnel."
          />
          <FeatureCard 
            icon="fa-microphone"
            title="Voice Guidance"
            description="Our AI-powered assistant can guide you through the reporting process using conversational voice commands."
          />
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="bg-slate-900 py-20 px-4 text-white rounded-3xl mx-4 sm:mx-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">100%</div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Encryption</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">24/7</div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Monitoring</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">&lt; 1hr</div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Response Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">Private</div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Storage</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto text-center px-4">
        <div className="bg-blue-50 p-12 rounded-3xl border border-blue-100">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Every Report Saves a Life</h2>
          <p className="text-slate-600 mb-8">If you have witnessed or suspect abuse, do not stay silent. Your courage can change a child's future forever.</p>
          <Link to="/report" className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all inline-block">
            Take Action Now
          </Link>
        </div>
      </section>
    </div>
  );
}
