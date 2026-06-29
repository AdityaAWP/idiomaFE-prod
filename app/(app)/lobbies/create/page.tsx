'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Hash, Users, BookOpen, ChevronDown, ImagePlus, X } from 'lucide-react';
import { lobbies as lobbiesApi } from '@/lib/api';

export default function CreateLobbyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    language: 'English',
    level: 'Beginner',
    capacity: 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await lobbiesApi.create({
        name: formData.title,
        description: formData.topic,
        language: formData.language === 'English' ? 'ENGLISH'
          : formData.language === 'Spanish' ? 'SPANISH'
          : formData.language === 'Japanese' ? 'JAPANESE'
          : formData.language === 'Korean' ? 'KOREAN'
          : formData.language === 'French' ? 'FRENCH'
          : formData.language === 'German' ? 'GERMAN'
          : 'ENGLISH',
      });
      router.push('/lobbies');
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeInUp">
      {/* Header */}
      <div className="mb-8">
        <Link href="/lobbies" className="inline-flex items-center text-gray-500 hover:text-black font-medium text-sm mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Back to Lobbies
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create a Public Lobby</h1>
        <p className="text-gray-500 mt-2">Set up a group conversation and invite others to join your topic.</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Cover Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {coverImage ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/90 text-gray-800 rounded-lg text-sm font-semibold hover:bg-white transition-colors shadow"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="w-9 h-9 bg-white/90 text-red-500 rounded-lg flex items-center justify-center hover:bg-white transition-colors shadow"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                  This will be the lobby card background
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--accent)] hover:bg-[var(--paper-2)] transition-all flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-[var(--accent)] group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-[var(--accent)]/10 flex items-center justify-center transition-colors">
                  <ImagePlus size={26} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">Click to upload a cover image</p>
                  <p className="text-xs mt-0.5 text-gray-400">PNG, JPG, WEBP — max 5MB</p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <hr className="border-gray-100" />

          {/* Main Info */}
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                Lobby Title
              </label>
              <div className="relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                  <Hash size={18} />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  placeholder="e.g. Kyoto Travel Recommendations 🇯🇵"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-bold text-gray-700 mb-2">
                Discussion Topic
              </label>
              <div className="relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                  <BookOpen size={18} />
                </div>
                <input
                  type="text"
                  id="topic"
                  name="topic"
                  required
                  placeholder="e.g. Casual Conversation, Tech Debate..."
                  value={formData.topic}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-4 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-gray-900 focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="language" className="block text-sm font-bold text-gray-700 mb-2">
                Language
              </label>
              <div className="relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                  <Globe size={18} />
                </div>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-10 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-gray-900 appearance-none focus:outline-none focus:bg-white cursor-pointer font-medium"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="level" className="block text-sm font-bold text-gray-700 mb-2">
                Proficiency Level
              </label>
              <div className="relative">
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-gray-900 appearance-none focus:outline-none focus:bg-white cursor-pointer font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Native">Native</option>
                </select>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-bold text-gray-700 mb-2">
                Max Capacity
              </label>
              <div className="relative">
                <div className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400">
                  <Users size={18} />
                </div>
                <select
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-11 pr-10 py-3 focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-all text-gray-900 appearance-none focus:outline-none focus:bg-white cursor-pointer font-medium"
                >
                  <option value={2}>2 People</option>
                  <option value={3}>3 People</option>
                  <option value={4}>4 People</option>
                  <option value={5}>5 People</option>
                </select>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-4">
            <Link
              href="/lobbies"
              className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3.5 rounded-lg text-center transition-colors shadow-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.topic.trim()}
              className={`flex-[2] py-3.5 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 ${
                isSubmitting || !formData.title.trim() || !formData.topic.trim()
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : 'bg-[var(--accent)] hover:opacity-90 text-white border border-transparent'
              }`}
            >
              {isSubmitting ? (
                <><span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                'Create Lobby'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
