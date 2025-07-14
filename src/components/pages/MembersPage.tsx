import React, { useState } from 'react';
import { useGetMembersQuery, useCreateMemberMutation, useDeleteMemberMutation, useUpdateMemberMutation } from '../../store/api';
import { Plus, Search, Filter, Edit, Trash2, Mail, Phone, X } from 'lucide-react';
import type { Member, MemberFormData } from '../../types/index';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const MembersPage: React.FC = () => {
  const { data, isLoading } = useGetMembersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [createMember] = useCreateMemberMutation();
  const [deleteMember] = useDeleteMemberMutation();
  const [updateMember] = useUpdateMemberMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    membership_id: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<Partial<MemberFormData>>({});

  const members: Member[] = data?.message?.data || [];

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membership_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || member.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Validate membership ID format (MEM or LIB followed by 3 digits)
  const validateMembershipId = (id: string): boolean => {
    const regex = /^(MEM|LIB)\d{3}$/;
    return regex.test(id);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<MemberFormData> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.membership_id) {
      newErrors.membership_id = 'Membership ID is required';
    } else if (!validateMembershipId(formData.membership_id)) {
      newErrors.membership_id = 'ID must start with MEM or LIB followed by 3 digits';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone) newErrors.phone = 'Phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      membership_id: '',
      email: '',
      phone: ''
    });
    setErrors({});
    setIsCreateModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setCurrentMember(member);
    setFormData({
      name: member.name,
      membership_id: member.membership_id,
      email: member.email,
      phone: member.phone
    });
    setErrors({});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (member: Member) => {
    setCurrentMember(member);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentMember(null);
  };

  const handleCreateMember = async () => {
    if (!validateForm()) return;

    try {
      await createMember(formData).unwrap();
      toast.success('Member created successfully!');
      closeModal();
    } catch (error) {
      console.error('Failed to create member:', error);
    }
  };

  const handleUpdateMember = async () => {
    if (!currentMember || !validateForm()) return;

    try {
      await updateMember({
        id: currentMember.name,
        member: formData
      }).unwrap();
      toast.success('Member updated successfully!');
      closeModal();
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  const handleDeleteMember = async () => {
    if (!currentMember) return;

    try {
      await deleteMember(currentMember.name).unwrap();
      toast.success('Member deleted successfully!');
      closeModal();
    } catch (error) {
      console.error('Failed to delete member:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800`}>
        {status}
      </span>
    );
  };

  type Role = 'library member' | 'librarian' | 'admin';
  const styles: Record<Role, string> = {
    'library member': 'bg-gray-100 text-gray-800',
    'librarian': 'bg-blue-100 text-blue-800',
    'admin': 'bg-purple-100 text-purple-800'
  };

  const getRoleBadge = (role: string) => {
    const normalized = role.toLowerCase() as Role;
    const style = styles[normalized] ?? 'bg-gray-100 text-gray-600';

    return (
      <span
        key={role}
        className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}
      >
        {role}
      </span>
    );
  };

  const inferRoles = (member: Member): string[] => {
    if (member.roles && member.roles.length > 0) return member.roles;

    if (member.membership_id.startsWith('MEM')) return ['Library Member'];
    if (member.membership_id.startsWith('LIB')) return ['Librarian'];
    return [];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Add Member Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Members Management</h1>
        <button 
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search members by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role(s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => {
                const roles = inferRoles(member);
                return (
                  <tr key={member.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">ID: {member.membership_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {member.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                      {roles.length > 0 ? (
                        roles.map((role) => <div key={role}>{getRoleBadge(role)}</div>)
                      ) : (
                        <span className="text-sm text-gray-400 italic">No role</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(member)}
                          className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(member)}
                          className="text-red-600 hover:text-red-900 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty state */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Create Member Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership ID</label>
              <input
                type="text"
                name="membership_id"
                value={formData.membership_id}
                onChange={handleInputChange}
                placeholder="MEM123 or LIB456"
                className={`w-full px-3 py-2 border rounded-lg ${errors.membership_id ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.membership_id && <p className="mt-1 text-sm text-red-600">{errors.membership_id}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Create Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Member</h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Membership ID</label>
              <input
                type="text"
                name="membership_id"
                value={formData.membership_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.membership_id ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.membership_id && <p className="mt-1 text-sm text-red-600">{errors.membership_id}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Update Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Delete Member</h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete member <span className="font-semibold">{currentMember?.name}</span>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteMember}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
            >
              Delete Member
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Add these styles to your CSS
const modalStyles = `
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    outline: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }
`;

// Add styles to the document head
const styleElement = document.createElement('style');
styleElement.innerHTML = modalStyles;
document.head.appendChild(styleElement);

export default MembersPage;