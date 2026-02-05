import React from 'react';
import { useUserStore } from '../stores/useUserStore';

const Greeting: React.FC = () => {
  const { profile } = useUserStore();
  
  // Format current date in Indonesian
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('id-ID', options);

  return (
    <section className="mb-6">
      <p className="text-text-secondary dark:text-gray-400 text-sm font-normal leading-normal mb-1">{formattedDate}</p>
      <h1 className="text-text-main dark:text-white text-[28px] font-bold leading-tight tracking-tight">Halo, {profile.name}! 👋</h1>
    </section>
  );
};

export default Greeting;

