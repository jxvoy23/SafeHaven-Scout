import React from 'react';
import { ShieldCheck } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-slate-900 text-white py-16 px-6 sm:px-12 lg:px-24 overflow-hidden rounded-b-[3rem] shadow-xl">
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
          src="https://picsum.photos/1600/600?grayscale&blur=2" 
          alt="Neighborhood Background" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-500 p-3 rounded-full shadow-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Find Your Safe Haven
        </h1>
        <p className="text-lg md:text-xl text-slate-200 font-light max-w-2xl mx-auto">
          We use advanced AI to scout the safest, most affordable neighborhoods for you and your family.
          Just tell us where you want to live.
        </p>
      </div>
    </div>
  );
};

export default Hero;