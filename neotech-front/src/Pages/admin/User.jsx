import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaEdit, FaTrash, FaUserPlus, FaUsers, FaUserCheck, FaUserTimes, FaUserShield, FaStore, FaBoxes, FaCrown, FaChevronDown, FaCheck } from 'react-icons/fa';
import { useActivateUserMutation, useDeActivateUserMutation, useDeleteUserMutation, useEditUserRoleMutation, useGetMeQuery, useGetUserRolesQuery, useGetUsersQuery, useGetUserStaticsQuery } from '../../store/API';
import { LoaderIcon } from 'lucide-react';
import EditUserUi from '../../components/admin/User/editUser'
import Modal from '../../components/UI/Modal'
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Users = () => {
    const { t } = useTranslation();
    const { data: users, error, isLoading, refetch } = useGetUsersQuery();
    const { data: userRoles, isRolesLoading  } = useGetUserRolesQuery();
    const { data: userStatistics, error: Serror, isLoading: SisLoading, refetch: refetchStatistics } = useGetUserStaticsQuery();
    const [deleteUser, { isDeleteLoading }] = useDeleteUserMutation();
    const [editRole, { isRoleLoading }] = useEditUserRoleMutation();
    
    const [modalType, setModalType] = useState(null);
    const [edit, setEdit] = useState(null)
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isUpdatingRole, setIsUpdatingRole] = useState(null);

    const [activateUser, { isLoading: isActivateLoading }] = useActivateUserMutation();
    const [deActivateUser, { isLoading: isDeActivateUserLoading }] = useDeActivateUserMutation();

    const availableRoles = [
        { key: 'Admin', label: 'Admin', icon: FaUserShield },
        { key: 'NormalUser', label: 'Ümumi', icon: FaUser },
        { key: 'Retail', label: 'Topdan', icon: FaStore },
        { key: 'Wholesale', label: 'Diller', icon: FaBoxes },
        { key: 'VIP', label: 'Eksklüziv', icon: FaCrown }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside all dropdowns
            const clickedOutside = !event.target.closest('.role-dropdown-container');
            if (clickedOutside) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        setIsUpdatingRole(userId);
        try {
            const result = await editRole({ id: userId, role: newRole }).unwrap();
            
            const roleLabel = availableRoles.find(r => r.key === newRole)?.label || newRole;
            toast.success(`Rolu uğurla dəyişdirildi: ${userRoles[newRole].name}`);

            refetch();
            refetchStatistics();
            setActiveDropdown(null);
        } catch (error) {
            toast.error(error?.data?.message || "Rol dəyişdirilə bilmədi");
        } finally {
            setIsUpdatingRole(null);
        }
    };

    const handleActivateUser = async (id) => {
        try {
            const result = await activateUser({ id }).unwrap();
            refetch()
        } catch (error) {
        }
    }

    const handleDeActivateUser = async (id) => {
        try {
            const result = await deActivateUser({ id }).unwrap();
            refetch()
        } catch (error) {
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case true:
                return 'text-green-400 bg-green-900/20';
            case false:
                return 'text-orange-400 bg-orange-900/20';
            default:
                return 'text-gray-400 bg-gray-900/20';
        }
    };

    const handleCloseModal = () => {
        setModalType(null);
        refetch();
        refetchStatistics();
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteUser({
                id
            }).unwrap()

            toast.success("İstifadəçi uğurla silindi");
            handleCloseModal()

        } catch (error) {
            toast.error(error?.data || "İstifadəçini silmək uğursuz oldu");
        }
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'text-purple-400 bg-purple-900/20';
            case 'normalUsers':
                return 'text-blue-400 bg-blue-900/20';
            case 'Retail':
                return 'text-green-400 bg-green-900/20';
            case 'Wholesale':
                return 'text-yellow-400 bg-yellow-900/20';
            case 'VIP':
                return 'text-pink-400 bg-pink-900/20';
            default:
                return 'text-gray-400 bg-gray-700/20';
        }
    };

    const getRoleIcon = (role) => {
        const roleData = availableRoles.find(r => r.key === role);
        return roleData ? roleData.icon : FaUser;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t('admin.users')}</h1>
                    <p className="text-gray-400 mt-1">{t('admin.manageUsers')}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-600 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">{t('admin.totalUsers')}</h3>
                            <p className="text-3xl font-bold text-white mt-2">{userStatistics?.totalUsers}</p>
                        </div>
                        <div className="text-white/60">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-purple-600 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">{t('admin.admins')}</h3>
                            <p className="text-3xl font-bold text-white mt-2">
                                {userStatistics?.adminUsers}
                            </p>
                        </div>
                        <div className="text-white/60">
                            <FaUserShield className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-blue-500 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">Ümumi istifadəçilər</h3>
                            <p className="text-3xl font-bold text-white mt-2">
                                {userStatistics?.normalUsers}
                            </p>
                        </div>
                        <div className="text-white/60">
                            <FaUser className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-green-500 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">Topdan istifadəçilər</h3>
                            <p className="text-3xl font-bold text-white mt-2">
                                {userStatistics?.retailUsers}
                            </p>
                        </div>
                        <div className="text-white/60">
                            <FaStore className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-500 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">Diller istifadəçilər</h3>
                            <p className="text-3xl font-bold text-white mt-2">
                                {userStatistics?.wholesaleUsers}
                            </p>
                        </div>
                        <div className="text-white/60">
                            <FaBoxes className="text-2xl" />
                        </div>
                    </div>
                </div>

                <div className="bg-pink-600 rounded-xl p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-white/80 text-sm font-medium">Ekslüziv istifadəçilər</h3>
                            <p className="text-3xl font-bold text-white mt-2">
                                {userStatistics?.vipUsers}
                            </p>
                        </div>
                        <div className="text-white/60">
                            <FaCrown className="text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={modalType === 'edit'} setOpen={handleCloseModal}>
                {edit && <EditUserUi setOpen={handleCloseModal} edit={edit} />}
            </Modal>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading
                    ? <LoaderIcon />
                    : users?.map(item => (
                        <div
                            key={item.id}
                            className="bg-gray-800 rounded-xl  hover:bg-gray-750 transition-colors duration-200"
                        >
                            <div className="relative">
                                <div className="absolute top-3 left-3 z-10">
                                    <span
                                        onClick={() => item.isActive ? handleDeActivateUser(item.id) : handleActivateUser(item.id)}
                                        className={`px-2 py-1 cursor-pointer rounded-md text-xs font-medium ${getStatusColor(item.isActive)}`}
                                    >
                                        {item.isActive ? "Aktiv" : "Deaktiv"}
                                    </span>
                                </div>

                                <div className="absolute top-3 right-3 z-10 flex gap-2">
                                    <button onClick={() => { setModalType("edit"), setEdit(item) }} className="p-2 bg-blue-600 cursor-pointer text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                                        <FaEdit className="text-sm" />
                                    </button>
                                    <button onClick={() => { handleDelete(item.id) }} className="p-2 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                                        {isDeleteLoading
                                            ? <LoaderIcon />
                                            :
                                            <FaTrash className="text-sm" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 pb-4">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-gray-600">
                                        <img
                                            src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
                                            className="w-full h-full object-cover"
                                            alt={`${item.firstName} ${item.lastName}`}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{item.firstName} {item.lastName}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{item.email}</p>
                                    
                                    {/* Role Dropdown */}
                                    <div className="relative role-dropdown-container">
                                        <div
                                            onClick={() => setActiveDropdown(activeDropdown === item.id ? null : item.id)}
                                            className={`px-3 py-1 rounded-full cursor-pointer text-xs font-medium flex items-center gap-2 hover:opacity-80 transition-opacity ${getRoleColor(item.roleName)} ${isUpdatingRole === item.id ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {isUpdatingRole === item.id ? (
                                                <LoaderIcon className="w-3 h-3 animate-spin" />
                                            ) : ( 
                                                <>
                                                    {React.createElement(getRoleIcon(item.roleName), { className: "text-xs" })}
                                                    <span>{availableRoles.find(r => r.key === item.roleName)?.label || item.roleName}</span>
                                                    <FaChevronDown className={`text-xs transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`} />
                                                </>
                                            )}
                                        </div>
                                        
                                        {/* Dropdown Menu */}
                                        {activeDropdown === item.id && (
                                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                                                <div className="py-1">
                                                    {userRoles?.map(role => {
                                                        
                                                       
                                                        const roleConfig = availableRoles.find(r => r.key === role.name);
                                                        const IconComponent = roleConfig.icon;
                                                        const isCurrentRole = item.roleName === role.name;
                                                        
                                                        return (
                                                            <button
                                                                key={role.value}
                                                                onClick={() => !isCurrentRole && handleRoleChange(item.id, role.value)}
                                                                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-600 transition-colors flex items-center gap-3 ${isCurrentRole ? 'bg-gray-600 cursor-default' : 'cursor-pointer'}`}
                                                                disabled={isCurrentRole || isUpdatingRole === item.id}
                                                            >
                                                                <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${getRoleColor(role.name).replace('bg-', 'bg-').replace('/20', '/30')}`}>
                                                                    <IconComponent className="text-xs" />
                                                                </div>
                                                                <span className={`flex-1 ${isCurrentRole ? 'text-white' : 'text-gray-200'}`}>
                                                                    {roleConfig.label}
                                                                </span>
                                                                {isCurrentRole && (
                                                                    <FaCheck className="text-green-400 text-xs" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 pb-6 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Qoşulma tarixi:</span>
                                    <span className="text-gray-300">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">Son daxilolma:</span>
                                    <span className="text-gray-300">{item.lastLogin ?? "N/A"}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-700">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>İstifadəçi ID</span>
                                        <span>{item.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Empty State for when there might be more users */}
            <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                    <FaUsers className="text-4xl mx-auto mb-4 opacity-50" />
                    <p>{users?.length} istifadəçi göstərilir</p>
                </div>
            </div>
        </div>
    );
};

export default Users;
