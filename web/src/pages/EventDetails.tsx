import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventById, joinEvent, leaveEvent } from '../services/api';
import { Calendar, Users, MapPin, ArrowLeft, Info, Edit3, Shield, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDateTime } from '../utils/date';
import clsx from 'clsx';

import { useTranslation } from 'react-i18next';

export function EventDetails() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvent = async () => {
    if (!id) return;
    try {
      const data = await getEventById(id);
      setEvent(data);
      setError('');
    } catch (err: any) {
      setError(t('common.loadingError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleJoin = async () => {
    if (!id || !userId) {
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      await joinEvent(id);
      await fetchEvent();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to join event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!id || !userId) return;
    setActionLoading(true);
    try {
      await leaveEvent(id);
      await fetchEvent();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to leave event');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl text-red-600 mb-4">{error || t('eventDetails.eventNotFound')}</h2>
        <button onClick={() => navigate('/')} className="text-forest-green hover:underline flex items-center justify-center mx-auto">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
        </button>
      </div>
    );
  }

  const userRegistration = event.attendees?.find((a: any) => a.userId === userId);
  const isRegistered = !!userRegistration;
  const userStatus = userRegistration?.status;
  
  const userMembership = event.club?.members?.find((m: any) => m.userId === userId);
  const canEdit = userMembership?.role === 'ADMIN' || userMembership?.role === 'LEADER';
  
  const isExpeditionLeader = userId && event.leaders?.some((l: any) => l.userId === userId);

  const difficultyColors: Record<string, string> = {
    EASY: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800',
  };

  const isLeader = (targetUserId: string) => event.leaders?.some((l: any) => l.userId === targetUserId);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate(-1)} className="text-forest-green hover:underline flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
        </button>
        {canEdit && (
          <Link 
            to={`/event/${event.id}/edit`}
            className="flex items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-forest-green hover:bg-gray-50 transition font-bold"
          >
            <Edit3 className="w-4 h-4 mr-2" /> {t('eventDetails.editExpedition')}
          </Link>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-12">
        <div className="h-48 bg-forest-green opacity-95 relative flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white text-center px-4 drop-shadow-md">{event.title}</h1>
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <span className={clsx('text-sm font-semibold px-3 py-1 rounded-full', difficultyColors[event.difficultyLevel] || 'bg-gray-100 text-gray-800')}>
              {t(`home.${event.difficultyLevel.toLowerCase()}`)} {t('eventDetails.difficulty')}
            </span>
            <span className={clsx('text-sm font-semibold px-3 py-1 rounded-full border', event.isFull ? 'border-red-200 text-red-600 bg-red-50' : 'border-green-200 text-green-600 bg-green-50')}>
              {event.isFull ? t('eventDetails.capacityFull') : t('common.spotsAvailable')}
            </span>
          </div>

          <p className="text-gray-700 text-lg mb-10 leading-relaxed italic border-l-4 border-sand pl-6">
            "{event.description}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Info className="w-5 h-5 mr-3 text-forest-green" /> {t('eventDetails.expeditionLogistics')}
              </h3>
              <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-4 text-forest-green" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('eventDetails.dateTime')}</p>
                    <p className="font-semibold">{formatDateTime(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-4 text-forest-green" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('eventDetails.location')}</p>
                    <p className="font-semibold">{event.city?.name}, {event.city?.country?.name}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-4 text-forest-green" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{t('eventDetails.capacityStatus')}</p>
                    <p className="font-semibold">{event.confirmedCount} / {event.capacity} {t('common.confirmed')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-3 text-forest-green" /> {t('eventDetails.priceDetails')}
              </h3>
              <div className="bg-sand bg-opacity-10 p-6 rounded-2xl border border-sand border-opacity-20">
                {event.priceDetails && Object.keys(event.priceDetails).length > 0 ? (
                  <ul className="space-y-3">
                    {Object.entries(event.priceDetails).map(([key, value]) => (
                      <li key={key} className="flex justify-between items-center border-b border-sand border-opacity-10 pb-2">
                        <span className="capitalize text-gray-600 font-medium">{key}</span>
                        <span className="font-bold text-earth-brown">{String(value)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">{t('eventDetails.noPriceDetails')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-forest-green" /> {t('eventDetails.participantList')}
              <span className="ml-4 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {event.attendees?.filter((a: any) => a.status === 'CONFIRMED').length} {t('common.confirmed')}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {event.attendees && event.attendees.length > 0 ? (
                event.attendees.map((attendee: any) => {
                  const leader = isLeader(attendee.userId);
                  const waitlisted = attendee.status === 'WAITLISTED';
                  
                  return (
                    <div 
                      key={attendee.id} 
                      className={clsx(
                        "flex items-center p-4 rounded-2xl border transition shadow-sm",
                        leader ? "bg-forest-green bg-opacity-5 border-forest-green border-opacity-20" : 
                        waitlisted ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100"
                      )}
                    >
                      <div className={clsx(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3",
                        leader ? "bg-forest-green text-white" : "bg-sand text-forest-green"
                      )}>
                        {leader ? <Shield className="w-5 h-5" /> : attendee.user?.name?.charAt(0)}
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {attendee.user?.name}
                          {attendee.userId === userId && ` (${t('eventDetails.you')})`}
                        </p>
                        <div className="flex items-center gap-2">
                          {leader && <span className="text-[10px] bg-forest-green text-white px-1.5 py-0.5 rounded font-bold uppercase">{t('eventDetails.leader')}</span>}
                          {waitlisted && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold uppercase">{t('common.waitlisted')}</span>}
                          {!leader && !waitlisted && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold uppercase">{t('common.confirmed')}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{t('eventDetails.noParticipantsYet')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-3xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
            {isExpeditionLeader ? (
              <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6">
                <div className="flex items-center gap-4 text-forest-green">
                  <div className="bg-forest-green bg-opacity-10 p-3 rounded-2xl">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">{t('eventDetails.youAreLeader')}</h4>
                    <p className="text-gray-600 text-sm">{t('eventDetails.leaderSubtitle')}</p>
                  </div>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl border border-forest-green border-opacity-20 flex items-center text-forest-green font-bold shadow-sm">
                  <CheckCircle className="w-5 h-5 mr-2" /> {t('common.confirmed')}
                </div>
              </div>
            ) : (
              <>
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{t('eventDetails.joinAdventure')}</h4>
                  {isRegistered ? (
                    <p className="text-gray-600">
                      {t('eventDetails.yourStatus')} <strong className={clsx("px-2 py-0.5 rounded", userStatus === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>{t(`common.${userStatus?.toLowerCase()}`)}</strong>
                    </p>
                  ) : (
                    <p className="text-gray-600">{t('eventDetails.secureSpot')}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  {isRegistered ? (
                    <button
                      onClick={handleLeave}
                      disabled={actionLoading}
                      className="px-10 py-4 bg-white text-red-600 border-2 border-red-100 hover:bg-red-50 font-bold rounded-2xl transition disabled:opacity-50 shadow-sm"
                    >
                      {actionLoading ? t('common.loading') : t('eventDetails.cancelRegistration')}
                    </button>
                  ) : (
                    <button
                      onClick={handleJoin}
                      disabled={actionLoading}
                      className={clsx(
                        "px-10 py-4 font-bold rounded-2xl transition disabled:opacity-50 shadow-xl text-white text-lg",
                        event.isFull ? "bg-orange-500 hover:bg-orange-600 shadow-orange-200" : "bg-forest-green hover:bg-opacity-90 shadow-forest-green/20"
                      )}
                    >
                      {actionLoading ? t('common.loading') : (event.isFull ? t('eventDetails.joinWaitlist') : t('eventDetails.confirmParticipation'))}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-sand bg-opacity-10 rounded-3xl p-8 border border-sand border-opacity-20 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-earth-brown text-white flex items-center justify-center font-bold mr-4 shadow-lg">
            {event.club?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-earth-brown font-bold uppercase tracking-widest">Organized By</p>
            <h4 className="font-bold text-gray-900 text-lg">{event.club?.name}</h4>
          </div>
        </div>
        <Link 
          to={`/clubs/${event.clubId}`}
          className="text-earth-brown hover:text-forest-green font-bold text-sm bg-white px-5 py-2.5 rounded-xl shadow-sm border border-sand border-opacity-30 transition"
        >
          View Club Profile
        </Link>
      </div>
    </div>
  );
}
