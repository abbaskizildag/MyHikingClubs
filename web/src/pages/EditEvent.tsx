import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent, getClubMembers, getCountries, getCities } from '../services/api';
import { Calendar, Users, ArrowLeft, Clock, ShieldCheck, MapPin } from 'lucide-react';

export function EditEvent() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countryId, setCountryId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    capacity: '10',
    difficultyLevel: 'MODERATE',
    leader1Id: '',
    leader2Id: '',
    cityId: '',
    priceDetails: {
      "Ulaşım": "Kendi aracımız",
      "Rehberlik": "Dahil",
      "Yemek": "Kişisel"
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      try {
        const event = await getEventById(eventId);
        const countriesData = await getCountries();
        setCountries(countriesData);
        
        // Format date for input
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toISOString().slice(0, 16);

        setFormData({
          title: event.title,
          description: event.description,
          date: formattedDate,
          capacity: String(event.capacity),
          difficultyLevel: event.difficultyLevel,
          leader1Id: event.leaders[0]?.userId || '',
          leader2Id: event.leaders[1]?.userId || '',
          cityId: event.cityId || '',
          priceDetails: event.priceDetails
        });

        if (event.city?.countryId) {
          setCountryId(event.city.countryId);
        }

        const membersData = await getClubMembers(event.clubId);
        setMembers(membersData);
      } catch (err) {
        console.error(err);
        setError('Failed to load event data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (countryId) {
      getCities(countryId).then(setCities).catch(console.error);
    } else {
      setCities([]);
    }
  }, [countryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    
    setSaving(true);
    setError('');

    const leaderIds = [formData.leader1Id, formData.leader2Id].filter(id => id !== '');

    try {
      await updateEvent(eventId, {
        ...formData,
        leaderIds
      });
      navigate(`/event/${eventId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="flex justify-center py-20 animate-spin"><Clock className="w-12 h-12 text-forest-green" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-forest-green hover:underline mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-sand bg-opacity-10 p-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-forest-green text-white rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Expedition</h2>
              <p className="text-gray-600">Update your adventure details.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-forest-green" /> Expedition Leader 1
                </label>
                <select
                  name="leader1Id"
                  required
                  value={formData.leader1Id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select a member...</option>
                  {members.filter(m => m.userId !== formData.leader2Id).map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-forest-green" /> Expedition Leader 2
                </label>
                <select
                  name="leader2Id"
                  value={formData.leader2Id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent transition appearance-none bg-white"
                >
                  <option value="">Select a member (optional)...</option>
                  {members.filter(m => m.userId !== formData.leader1Id).map(m => (
                    <option key={m.userId} value={m.userId}>{m.user?.name} ({m.role})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-forest-green" /> Country
                </label>
                <select
                  required
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-forest-green focus:border-forest-green transition bg-white"
                >
                  <option value="">Select Country</option>
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-forest-green" /> City
                </label>
                <select
                  required
                  disabled={!countryId}
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-forest-green focus:border-forest-green transition bg-white disabled:bg-gray-50"
                >
                  <option value="">Select City</option>
                  {cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-forest-green" /> Date and Time
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-forest-green" /> Max Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  required
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-forest-green focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-forest-green text-white font-bold py-4 rounded-2xl hover:bg-opacity-90 transition disabled:opacity-50 shadow-xl"
            >
              {saving ? 'Updating Expedition...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
