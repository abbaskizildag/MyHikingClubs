import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getClubById, joinClub, updateMemberRole } from '../services/api';
import { EventCard } from '../components/EventCard';
import { ArrowLeft, Plus, Users, Calendar, UserPlus, CheckCircle, MapPin, Shield, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import { useTranslation } from 'react-i18next';

export function ClubDetails() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchClub = async () => {
    if (!id) return;
    try {
      const data = await getClubById(id);
      setClub(data);
    } catch (err) {
      console.error('Failed to load club:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClub();
  }, [id]);

  const handleJoinClub = async () => {
    if (!id || !user) {
      navigate('/login');
      return;
    }
    setJoining(true);
    try {
      await joinClub(id);
      await fetchClub();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join club');
    } finally {
      setJoining(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    if (!id) return;
    try {
      await updateMemberRole(id, targetUserId, newRole);
      await fetchClub();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('clubDetails.clubNotFound')}</h2>
        <button onClick={() => navigate('/clubs')} className="text-forest-green hover:underline">
          {t('common.back')}
        </button>
      </div>
    );
  }

  const userMembership = club.members?.find((m: any) => m.userId === user?.id);
  const isMember = !!userMembership;
  const isAuthorized = userMembership?.role === 'ADMIN' || userMembership?.role === 'LEADER';
  const isAdmin = userMembership?.role === 'ADMIN';

  return (
    <div>
      <button onClick={() => navigate('/clubs')} className="flex items-center text-forest-green hover:underline mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 md:mb-12 border border-gray-100">
        <div className="bg-forest-green p-6 md:p-12 text-white relative">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-grow">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none">{club.name}</h1>
                  {isAuthorized && (
                    <Link 
                      to={`/clubs/${club.id}/edit`}
                      className="p-2.5 bg-sand hover:bg-opacity-90 rounded-xl transition text-forest-green shadow-lg shrink-0"
                      title={t('clubDetails.editClub')}
                    >
                      <Edit3 className="w-5 h-5" />
                    </Link>
                  )}
                </div>
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <p className="text-forest-green bg-sand inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {t('clubDetails.establishedCommunity')}
                    </p>
                    {club.city && (
                      <p className="text-forest-green bg-sand inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-forest-green" />
                        {club.city.name}
                      </p>
                    )}
                  </div>
                <p className="text-lg md:text-xl text-white text-opacity-90 max-w-2xl leading-relaxed font-medium">
                  {club.description}
                </p>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                {isAuthorized && (
                  <Link
                    to={`/clubs/${club.id}/events/new`}
                    className="bg-sand text-forest-green px-8 py-5 rounded-2xl font-black hover:bg-opacity-90 transition shadow-2xl flex items-center justify-center whitespace-nowrap uppercase tracking-widest text-sm"
                  >
                    <Plus className="w-6 h-6 mr-2" /> {t('clubDetails.createEvent')}
                  </Link>
                )}
                {isMember ? (
                  <div className="px-6 py-4 rounded-2xl font-black flex items-center justify-center bg-white bg-opacity-10 border-2 border-white border-opacity-10 text-sand shadow-lg backdrop-blur-sm">
                    <CheckCircle className="w-6 h-6 mr-3 text-sand" />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] uppercase tracking-widest opacity-60 font-black">{t('clubDetails.clubMember')}</span>
                      <span className="text-sm font-black uppercase">{t(`common.roles.${userMembership.role.toLowerCase()}`)}</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleJoinClub}
                    disabled={joining}
                    className="px-10 py-5 rounded-2xl font-black transition flex items-center justify-center whitespace-nowrap bg-white text-forest-green hover:bg-gray-100 shadow-2xl uppercase tracking-widest text-sm"
                  >
                    <UserPlus className="w-6 h-6 mr-2" /> {joining ? t('common.loading') : t('clubDetails.joinClub')}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Users className="w-64 h-64" />
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-forest-green" />
                  {t('home.title')}
                </h2>
              </div>

              {club.events && club.events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {club.events.map((event: any) => (
                    <div key={event.id} className="relative">
                      <EventCard 
                        event={{
                          ...event,
                          confirmedCount: event.attendees.filter((a: any) => a.status === 'CONFIRMED').length,
                          waitlistCount: event.attendees.filter((a: any) => a.status === 'WAITLISTED').length,
                          isFull: event.attendees.filter((a: any) => a.status === 'CONFIRMED').length >= event.capacity
                        }} 
                      />
                      {isAuthorized && (
                        <Link 
                          to={`/event/${event.id}/edit`}
                          className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md text-forest-green hover:text-earth-brown transition z-10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('clubDetails.noEvents')}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-forest-green" />
                {t('clubDetails.managementTitle')}
              </h3>
              <div className="space-y-4">
                {club.members && club.members.length > 0 ? (
                  club.members.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-sand text-forest-green flex items-center justify-center font-bold">
                          {m.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{m.user?.name}</p>
                          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{t(`common.roles.${m.role.toLowerCase()}`)}</p>
                        </div>
                      </div>
                      
                      {isAdmin && m.userId !== user?.id && (
                        <select
                          className="text-xs border-none bg-gray-50 rounded-lg py-1 px-2 focus:ring-1 focus:ring-forest-green transition-all"
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.userId, e.target.value)}
                        >
                          <option value="MEMBER">{t('common.roles.member')}</option>
                          <option value="LEADER">{t('common.roles.leader')}</option>
                          <option value="ADMIN">{t('common.roles.admin')}</option>
                        </select>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">{t('clubDetails.noMembers')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
