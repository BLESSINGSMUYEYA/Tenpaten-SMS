import React, { useState } from 'react';
import { useQuery } from '../../hooks/useApi';
import { api } from '../../services/api';

export const RoomsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState<string>('');
  const [type, setType] = useState('Classroom');

  // Edit Form State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRoomId, setEditRoomId] = useState('');
  const [editName, setEditName] = useState('');
  const [editCapacity, setEditCapacity] = useState<string>('');
  const [editType, setEditType] = useState('Classroom');

  // Fetch rooms
  const { data: rooms, loading, refetch: refetchRooms } = useQuery<any[]>('/schools/rooms');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setName('');
    setCapacity('');
    setType('Classroom');
    setFormError(null);
  };

  const handleOpenEditModal = (r: any) => {
    setEditRoomId(r.id);
    setEditName(r.name);
    setEditCapacity(r.capacity ? String(r.capacity) : '');
    setEditType(r.type || 'Classroom');
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Room name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.post('/schools/rooms', {
        name: name.trim(),
        capacity: capacity ? Number(capacity) : null,
        type,
      });
      setIsModalOpen(false);
      refetchRooms();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to save room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setFormError('Room name is required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await api.patch(`/schools/rooms/${editRoomId}`, {
        name: editName.trim(),
        capacity: editCapacity ? Number(editCapacity) : null,
        type: editType,
      });
      setIsEditModalOpen(false);
      refetchRooms();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to update room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (id: string, roomName: string) => {
    if (!window.confirm(`Are you sure you want to delete room "${roomName}"?`)) {
      return;
    }

    try {
      await api.delete(`/schools/rooms/${id}`);
      refetchRooms();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete room. Please try again.');
    }
  };

  // Filtered rooms list
  const filteredRooms = (rooms || []).filter((r: any) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl">
        <div className="relative max-w-xs w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-b border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md"
          />
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add</span> Add Room
        </button>
      </div>

      {/* Main List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
          <h3 className="font-bold text-on-background text-sm sm:text-base">School Physical Rooms & Labs</h3>
        </div>

        {loading ? (
          <div className="text-center py-10 text-on-surface-variant font-body-md">Loading physical rooms...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] opacity-30 mb-2">meeting_room</span>
            <p className="font-medium">No physical rooms configured yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Room Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Room Type</th>
                  <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Max Capacity</th>
                  <th className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredRooms.map((r: any) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">meeting_room</span>
                        <span className="font-bold text-on-surface text-sm">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-secondary-container text-on-secondary-container">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-sm">
                      {r.capacity ? `${r.capacity} desks` : 'Unspecified'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="text-primary hover:bg-primary-container/20 p-1.5 rounded transition-colors"
                          title="Edit Room"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.id, r.name)}
                          className="text-error hover:bg-error-container/20 p-1.5 rounded transition-colors"
                          title="Delete Room"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">Configure Physical Room</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold border border-error/20 flex gap-2 items-center">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRoom} className="space-y-5">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Room Name / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 101, Science Lab A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Room Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Science Laboratory">Science Laboratory</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Library">Library</option>
                  <option value="Assembly Hall">Assembly Hall</option>
                  <option value="Staff Room">Staff Room</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Student Capacity (desks)</label>
                <input
                  type="number"
                  placeholder="Optional, e.g. 45"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Configuring...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary font-bold">Edit Physical Room</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold border border-error/20 flex gap-2 items-center">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateRoom} className="space-y-5">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Room Name / Code</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Room Type</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-3 py-2.5 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Science Laboratory">Science Laboratory</option>
                  <option value="Computer Lab">Computer Lab</option>
                  <option value="Library">Library</option>
                  <option value="Assembly Hall">Assembly Hall</option>
                  <option value="Staff Room">Staff Room</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-label-md text-on-surface-variant mb-1 font-bold">Student Capacity (desks)</label>
                <input
                  type="number"
                  placeholder="Optional, e.g. 45"
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-outline-variant focus:border-primary outline-none bg-transparent text-on-surface font-body-md transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-5 py-2.5 border border-outline text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
