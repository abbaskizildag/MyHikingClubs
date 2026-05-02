import { useEffect, useState } from 'react';
import { getEvents } from '../services/api';
import { EventCard } from '../components/EventCard';
import clsx from 'clsx';

import { useTranslation } from 'react-i18next';

export function Home() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    getEvents()
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
        setLoading(false);
      });
  }, []);

  const filteredEvents = filter === 'ALL' 
    ? events 
    : events.filter(e => e.difficultyLevel === filter);

  const filters = ['ALL', 'EASY', 'MODERATE', 'HARD'];

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          {t('home.title')}
        </h2>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="flex justify-center space-x-2 mb-8">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium transition',
              filter === f 
                ? 'bg-earth-brown text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            )}
          >
            {f === 'ALL' ? t('home.allLevels') : t(`home.${f.toLowerCase()}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No events found matching your filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
