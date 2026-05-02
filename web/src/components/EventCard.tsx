import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { formatDate } from '../utils/date';

interface EventCardProps {
  event: any;
}

export function EventCard({ event }: EventCardProps) {
  const isFull = event.isFull;
  
  const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition flex flex-col h-full border border-gray-100">
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className={clsx('text-xs font-semibold px-2.5 py-0.5 rounded', difficultyColors[event.difficultyLevel] || 'bg-gray-100 text-gray-800')}>
            {event.difficultyLevel}
          </span>
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded border', isFull ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50')}>
            {isFull ? 'Waitlist Open' : 'Spots Available'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs font-bold text-earth-brown uppercase tracking-wider mb-1">
          <span>{event.club?.name}</span>
          {event.city && (
            <span className="flex items-center text-forest-green normal-case">
              <MapPin className="w-3 h-3 mr-1" />
              {event.city.name}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
        
        <div className="mt-auto space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-forest-green" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-forest-green" />
            <span>{event.confirmedCount} / {event.capacity} Confirmed</span>
          </div>
          {event.waitlistCount > 0 && (
            <div className="flex items-center text-orange-500">
              <Users className="w-4 h-4 mr-2" />
              <span>{event.waitlistCount} Waitlisted</span>
            </div>
          )}
          {event.leaders && event.leaders.length > 0 && (
            <div className="flex items-center pt-2 border-t border-gray-50">
              <ShieldCheck className="w-4 h-4 mr-2 text-forest-green" />
              <span className="text-xs font-bold text-gray-700">
                {event.leaders.map((l: any) => l.user?.name).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100 mt-auto">
        <Link 
          to={`/event/${event.id}`}
          className="block w-full text-center bg-forest-green hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
