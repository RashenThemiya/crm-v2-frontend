import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import { Briefcase, Users, TrendingUp, CheckCircle, ArrowRight, Sparkles, Building2, Target, Zap, Star, Rocket, Award } from "lucide-react";

export default function HomePage() {
  const nav = useNavigate();
  const [animatedLetters, setAnimatedLetters] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimatedLetters(true), 300);
  }, []);

  // Split into proper rows
  const line1 = "FIND YOUR";
  const line2 = "DREAM JOB";
  
  const letters1 = line1.split("");
  const letters2 = line2.split("");

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      {/* Hero Section with Circle Letters */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-32 pb-24 relative">
          {/* Floating Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-sky-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-200 rounded-full blur-2xl opacity-25 animate-pulse"></div>

          <div className="relative z-10">
            {/* Badge with Animation */}
            <div className="flex justify-center mb-12">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-xl border border-sky-100">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-sky-400 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">Trusted by 1000+ Companies</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            </div>

            {/* Circle Letters - Line 1: FIND YOUR */}
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mb-4 px-4">
              {letters1.map((letter, index) => (
                <div
                  key={`line1-${index}`}
                  className={`transform transition-all duration-700 ease-out ${
                    animatedLetters 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  {letter === " " ? (
                    <div className="w-8 md:w-12"></div>
                  ) : (
                    <div className="group relative">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-sky-400 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                      
                      {/* Circle with letter - Light Blue background, White text */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-sky-400 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:bg-sky-500 transition-all duration-300">
                        <span className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
                          {letter}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Circle Letters - Line 2: DREAM JOB */}
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mb-8 px-4">
              {letters2.map((letter, index) => (
                <div
                  key={`line2-${index}`}
                  className={`transform transition-all duration-700 ease-out ${
                    animatedLetters 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: `${(letters1.length + index) * 50}ms`,
                  }}
                >
                  {letter === " " ? (
                    <div className="w-8 md:w-12"></div>
                  ) : (
                    <div className="group relative">
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-sky-400 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                      
                      {/* Circle with letter - Light Blue background, White text */}
                      <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-sky-400 flex items-center justify-center shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:bg-sky-500 transition-all duration-300">
                        <span className="text-2xl md:text-3xl lg:text-4xl font-black text-white">
                          {letter}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Subtitle */}
            <p className="text-center text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
              Connect with top companies and discover opportunities that match your skills, passion, and career goals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16">
              <button
                onClick={() => nav("/jobs")}
                className="group relative overflow-hidden"
                type="button"
              >
                <div className="absolute inset-0 bg-sky-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-sky-500 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl shadow-sky-500/30 flex items-center gap-3 transform group-hover:scale-105 transition-all duration-300">
                  <Rocket className="w-6 h-6" />
                  <span>Explore Jobs</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => nav("/contact")}
                className="group relative bg-white px-10 py-5 rounded-2xl font-bold text-lg text-slate-700 shadow-xl border-2 border-slate-200 hover:border-sky-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                type="button"
              >
                Get Started Free
              </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <MetricCard 
                number="1000+" 
                label="Active Jobs" 
                icon={<Briefcase className="w-5 h-5" />}
                color="from-sky-400 to-cyan-400"
              />
              <MetricCard 
                number="500+" 
                label="Companies" 
                icon={<Building2 className="w-5 h-5" />}
                color="from-cyan-400 to-blue-400"
              />
              <MetricCard 
                number="10K+" 
                label="Candidates" 
                icon={<Users className="w-5 h-5" />}
                color="from-blue-400 to-sky-400"
              />
              <MetricCard 
                number="95%" 
                label="Success Rate" 
                icon={<Award className="w-5 h-5" />}
                color="from-sky-500 to-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Company Introduction */}
        <section className="py-16">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100 to-cyan-100 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-100 to-sky-100 rounded-full blur-3xl opacity-50" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-4 py-2 text-sm font-semibold">
                <Building2 className="w-4 h-4" />
                About Us
              </div>

              <h2 className="mt-6 text-4xl md:text-5xl font-black text-slate-900">
                Leading Job Recruitment Services
              </h2>

              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-3xl">
                We are a premier recruitment agency specializing in connecting exceptional talent with outstanding opportunities. With years of industry expertise and a vast network of partnerships, we've successfully placed thousands of professionals in their ideal roles across various industries.
              </p>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Our Mission</h3>
                    <p className="mt-1 text-slate-600">To bridge the gap between talent and opportunity, creating meaningful career connections that drive success.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Our Vision</h3>
                    <p className="mt-1 text-slate-600">To be the most trusted recruitment partner, recognized for excellence, innovation, and transformative placements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Why Choose Us?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Experience recruitment excellence with our comprehensive services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Briefcase className="w-8 h-8" />}
              title="Curated Opportunities"
              desc="Access exclusive job openings from top-tier companies across industries. Every position is verified and quality-checked."
              color="sky"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Expert Guidance"
              desc="Our experienced recruitment specialists provide personalized support throughout your job search journey."
              color="cyan"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Career Growth"
              desc="We focus on long-term career development, ensuring every placement is a step toward your professional goals."
              color="blue"
            />
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16">
          <div className="rounded-3xl bg-sky-500 p-8 md:p-12 text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-black text-center">
              Simple 3-Step Process
            </h2>
            <p className="mt-4 text-center text-sky-100 text-lg">
              Your journey to the perfect job starts here
            </p>

            <div className="mt-12 grid md:grid-cols-3 gap-8">
              <ProcessStep
                number="1"
                title="Browse & Search"
                desc="Explore our extensive database of verified job listings tailored to your skills and preferences."
              />
              <ProcessStep
                number="2"
                title="Apply Instantly"
                desc="Submit your application directly through our platform with a single click. Quick and hassle-free."
              />
              <ProcessStep
                number="3"
                title="Get Hired"
                desc="Our team facilitates the connection and supports you through the interview and hiring process."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 text-center">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-xl p-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Ready to Take the Next Step?
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Join thousands of professionals who found their dream jobs through our platform
            </p>
            <button
              onClick={() => nav("/jobs")}
              className="mt-8 rounded-2xl bg-sky-500 px-10 py-5 text-lg font-semibold text-white shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:bg-sky-600 transition-all duration-300 hover:scale-105"
              type="button"
            >
              Start Your Journey Today
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ number, label, icon, color }: { number: string; label: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-white rounded-2xl blur-sm opacity-70"></div>
      <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className={`inline-flex w-10 h-10 rounded-xl bg-gradient-to-br ${color} items-center justify-center text-white mb-3 shadow-lg`}>
          {icon}
        </div>
        <div className="text-3xl md:text-4xl font-black text-slate-900">
          {number}
        </div>
        <div className="mt-1 text-sm font-semibold text-slate-600">{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: string;
}) {
  const colorMap = {
    sky: 'bg-sky-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
  };

  return (
    <div className="group rounded-3xl bg-white border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 p-8 hover:-translate-y-2">
      <div className={`inline-flex w-16 h-16 rounded-2xl ${colorMap[color as keyof typeof colorMap]} items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-3 text-slate-600 leading-relaxed">{desc}</p>
      <div className="mt-4 inline-flex items-center text-sky-600 font-semibold text-sm group-hover:gap-2 transition-all">
        Learn more
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

function ProcessStep({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-black text-white mb-4 mx-auto border-2 border-white/30">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-sky-100 leading-relaxed">{desc}</p>
    </div>
  );
}