import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClubById, updateClub, getCountries, getCities } from '../services/api';
import { ArrowLeft, Save, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function EditClub() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cityId: ''
  });

  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const [club, countriesData] = await Promise.all([
          getClubById(id),
          getCountries()
        ]);

        // Authorization check
        const membership = club.members?.find((m: any) => m.userId === user?.id);
        if (!membership || (membership.role !== 'ADMIN' && membership.role !== 'LEADER')) {
          navigate(`/clubs/${id}`);
          return;
        }

        setFormData({
          name: club.name,
          description: club.description,
          cityId: club.cityId || ''
        });

        setCountries(countriesData);

        if (club.city) {
          setSelectedCountryId(club.city.countryId);
          const citiesData = await getCities(club.city.countryId);
          setCities(citiesData);
        }
      } catch (err) {
        setError('Failed to load club data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate]);

  useEffect(() => {
    if (selectedCountryId) {
      getCities(selectedCountryId).then(setCities);
    } else {
      setCities([]);
    }
  }, [selectedCountryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    
    // cityId boş string geliyorsa null olarak gönderiyoruz
    const dataToSend = {
      ...formData,
      cityId: formData.cityId || null
    };

    try {
      await updateClub(id, dataToSend);
      navigate(`/clubs/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update club');
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
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-forest-green hover:underline flex items-center mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Club
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Club Details</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Club Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none transition"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              rows={4}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest-green focus:border-transparent outline-none transition"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-forest-green" /> Country
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest-green outline-none"
                value={selectedCountryId}
                onChange={(e) => {
                  setSelectedCountryId(e.target.value);
                  setFormData({ ...formData, cityId: '' });
                }}
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-forest-green" /> City
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-forest-green outline-none"
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                disabled={!selectedCountryId}
              >
                <option value="">Select City</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-forest-green text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition shadow-lg flex items-center justify-center"
          >
            {saving ? (
              'Saving Changes...'
            ) : (
              <><Save className="w-5 h-5 mr-2" /> Save Club Settings</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
