import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClubs } from '../services/api';
import { Users, Plus, ChevronRight, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { useTranslation } from 'react-i18next';

export function Clubs() {
  const { t } = useTranslation();
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getClubs()
      .then(data => {
        setClubs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load clubs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
            {t('clubs.title')}
          </h2>
          <p className="mt-2 text-base md:text-lg text-gray-500 font-medium">
            {t('clubs.subtitle')}
          </p>
        </div>
        {user && (
          <Link
            to="/clubs/new"
            className="w-full sm:w-auto flex items-center justify-center bg-forest-green text-white px-8 py-4 rounded-2xl font-black hover:bg-opacity-90 transition shadow-2xl uppercase tracking-widest text-xs"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('clubs.createButton')}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {clubs.map(club => (
            <div key={club.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition group">
              <div className="p-6">
                <div className="w-12 h-12 bg-sand bg-opacity-20 rounded-xl flex items-center justify-center text-earth-brown mb-4 group-hover:scale-110 transition">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                  {club.description || 'No description provided.'}
                </p>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-semibold text-forest-green">{club._count?.events || 0}</span>
                    <span className="ml-1">{t('clubs.upcomingEvents')}</span>
                  </div>
                  {club.city && (
                    <div className="flex items-center text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {club.city.name}, {club.city.country?.name}
                    </div>
                  )}
                </div>
                <Link
                  to={`/clubs/${club.id}`}
                  className="flex items-center justify-center w-full bg-gray-50 text-gray-900 font-bold py-3 rounded-xl hover:bg-forest-green hover:text-white transition"
                >
                  {t('common.viewGroup')} <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          ))}

          {clubs.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{t('clubs.noClubsYet')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
