import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../services/api';
import { User, Mail, Calendar, Users, Edit3, Save, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateTime } from '../utils/date';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export function Profile() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfile(data.user);
      setFormData({ name: data.user.name, email: data.user.email });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess(t('profile.updateSuccess'));
      setEditing(false);
      await fetchProfile();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-green"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-tight mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-gray-500 font-medium">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="h-24 bg-forest-green"></div>
            <div className="px-8 pb-8 -mt-12 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-sand text-forest-green text-3xl font-black shadow-2xl mb-4 border-4 border-white">
                {profile.name?.charAt(0)}
              </div>
              
              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">{profile.name}</h2>
                    <p className="text-gray-500 font-medium flex items-center justify-center mt-1">
                      <Mail className="w-4 h-4 mr-2" /> {profile.email}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full flex items-center justify-center bg-gray-50 text-forest-green font-bold py-3 rounded-2xl hover:bg-forest-green hover:text-white transition-all shadow-sm border border-gray-100"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> {t('profile.editProfile')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('profile.name')}</label>
                    <input
                      type="text"
                      className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-forest-green transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{t('profile.email')}</label>
                    <input
                      type="email"
                      className="w-full bg-gray-50 border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-forest-green transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                  {success && <p className="text-green-500 text-xs font-bold text-center">{success}</p>}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setError(''); }}
                      className="flex-1 py-3 px-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 px-4 bg-forest-green text-white rounded-2xl font-black shadow-lg hover:bg-opacity-90 transition flex items-center justify-center"
                    >
                      {saving ? t('common.loading') : <><Save className="w-4 h-4 mr-2" /> {t('common.save')}</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xs font-black text-sand uppercase tracking-widest mb-4 opacity-60">
                {t('profile.statsTitle')}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-black leading-none mb-1">{profile.clubs?.length || 0}</p>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('common.clubs')}</p>
                </div>
                <div>
                  <p className="text-3xl font-black leading-none mb-1">{profile.attendees?.length || 0}</p>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{t('clubDetails.events')}</p>
                </div>
              </div>
            </div>
            <Users className="w-32 h-32 absolute -right-8 -bottom-8 opacity-5" />
          </div>
        </div>

        {/* Right Column: Lists */}
        <div className="lg:col-span-2 space-y-12">
          {/* Joined Clubs */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center uppercase tracking-tight">
                <Users className="w-6 h-6 mr-3 text-forest-green" /> {t('profile.myClubs')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.clubs && profile.clubs.length > 0 ? (
                profile.clubs.map((membership: any) => (
                  <Link 
                    key={membership.id}
                    to={`/clubs/${membership.club.id}`}
                    className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 text-forest-green flex items-center justify-center font-black text-xl group-hover:bg-sand transition">
                      {membership.club.name?.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-gray-900 truncate">{membership.club.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-forest-green bg-forest-green bg-opacity-5 px-2 py-0.5 rounded uppercase tracking-widest">
                          {t(`common.roles.${membership.role.toLowerCase()}`)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {membership.club._count?.members} {t('clubDetails.members')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">{t('profile.noClubs')}</p>
                  <Link to="/clubs" className="text-forest-green font-black text-xs uppercase tracking-widest mt-2 inline-block hover:underline">{t('profile.exploreClubs')}</Link>
                </div>
              )}
            </div>
          </section>

          {/* Joined Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 flex items-center uppercase tracking-tight">
                <Calendar className="w-6 h-6 mr-3 text-forest-green" /> {t('profile.myEvents')}
              </h2>
            </div>
            <div className="space-y-4">
              {profile.attendees && profile.attendees.length > 0 ? (
                profile.attendees.map((attendance: any) => {
                  const event = attendance.event;
                  const confirmed = attendance.status === 'CONFIRMED';
                  const date = new Date(event.date);
                  const isPast = date < new Date();

                  return (
                    <Link 
                      key={attendance.id}
                      to={`/event/${event.id}`}
                      className={clsx(
                        "group flex flex-col sm:flex-row sm:items-center p-6 rounded-3xl border transition-all duration-300 gap-6",
                        isPast ? "bg-gray-50 border-gray-100 opacity-70" : "bg-white border-gray-100 shadow-sm hover:shadow-xl"
                      )}
                    >
                      <div className="flex items-center gap-4 sm:border-r sm:pr-8 sm:border-gray-100">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0",
                          confirmed ? "bg-forest-green text-white" : "bg-orange-100 text-orange-600"
                        )}>
                          <span className="text-[10px] leading-none mb-0.5 opacity-60 uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg leading-none">{date.getDate()}</span>
                        </div>
                        <div className="sm:hidden flex-grow">
                          <h4 className="font-black text-gray-900 line-clamp-1">{event.title}</h4>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{event.club?.name}</p>
                        </div>
                      </div>

                      <div className="hidden sm:block flex-grow">
                        <h4 className="font-black text-gray-900 mb-1">{event.title}</h4>
                        <div className="flex items-center gap-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                            <Users className="w-3 h-3 mr-1.5" /> {event.club?.name}
                          </p>
                          <p className="text-[10px] font-black text-forest-green uppercase tracking-widest flex items-center">
                            <Clock className="w-3 h-3 mr-1.5" /> {formatDateTime(event.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 mt-4 sm:mt-0">
                        {isPast ? (
                          <span className="text-[10px] font-black bg-gray-200 text-gray-500 px-3 py-1.5 rounded-full uppercase tracking-widest">
                            {t('profile.pastEvent')}
                          </span>
                        ) : (
                          <span className={clsx(
                            "text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center shadow-sm",
                            confirmed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          )}>
                            {confirmed ? <CheckCircle className="w-3 h-3 mr-1.5" /> : <Clock className="w-3 h-3 mr-1.5" />}
                            {t(`common.${attendance.status.toLowerCase()}`)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">{t('profile.noEvents')}</p>
                  <Link to="/" className="text-forest-green font-black text-xs uppercase tracking-widest mt-2 inline-block hover:underline">{t('profile.exploreEvents')}</Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
