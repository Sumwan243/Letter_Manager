import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    DocumentTextIcon, 
    PlusIcon, 
    UserGroupIcon, 
    EyeIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Letter {
    id: number;
    title: string;
    status: string;
    created_at: string;
    user?: {
        name: string;
    };
}

interface User {
    id: number;
    name: string;
    role: string;
    letters_count: number;
}

export default function Dashboard() {
    const [recentLetters, setRecentLetters] = useState<Letter[]>([]);
    const [staffMembers, setStaffMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Get current user and dashboard data
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Get current user
            const userResponse = await fetch('/api/user', {
                credentials: 'include'
            });
            const userData = await userResponse.json();
            setUser(userData);

            // Get recent letters
            const lettersResponse = await fetch('/api/letters?per_page=5', {
                credentials: 'include'
            });
            const lettersData = await lettersResponse.json();
            setRecentLetters(lettersData.data || []);

            // If admin, get staff members
            if (userData.role === 'admin') {
                const staffResponse = await fetch('/api/staff', {
                    credentials: 'include'
                });
                const staffData = await staffResponse.json();
                setStaffMembers(staffData || []);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'pending':
                return <ClockIcon className="h-5 w-5 text-yellow-500" />;
            case 'rejected':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-gray-600">
                    {user?.role === 'admin' 
                        ? 'Manage your letters and staff members from your admin dashboard.'
                        : 'Create and manage your letters from your personal dashboard.'
                    }
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link
                    href="/letters/create"
                    className="bg-primary-600 hover:bg-primary-700 text-white p-6 rounded-xl transition-colors duration-200"
                >
                    <div className="flex items-center">
                        <PlusIcon className="h-8 w-8 mr-4" />
                        <div>
                            <h3 className="text-lg font-semibold">Create Letter</h3>
                            <p className="text-primary-100 text-sm">Start writing a new letter</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/letters"
                    className="bg-white hover:bg-gray-50 border border-gray-200 p-6 rounded-xl transition-colors duration-200"
                >
                    <div className="flex items-center">
                        <DocumentTextIcon className="h-8 w-8 mr-4 text-gray-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">View All Letters</h3>
                            <p className="text-gray-600 text-sm">Browse your letter collection</p>
                        </div>
                    </div>
                </Link>

                {user?.role === 'admin' && (
                    <Link
                        href="/admin/staff"
                        className="bg-success-600 hover:bg-success-700 text-white p-6 rounded-xl transition-colors duration-200"
                    >
                        <div className="flex items-center">
                            <UserGroupIcon className="h-8 w-8 mr-4" />
                            <div>
                                <h3 className="text-lg font-semibold">Manage Staff</h3>
                                <p className="text-success-100 text-sm">View and manage staff members</p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Recent Letters Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Letters</h2>
                    <Link
                        href="/letters"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                        View all
                    </Link>
                </div>

                {recentLetters.length > 0 ? (
                    <div className="space-y-4">
                        {recentLetters.map((letter) => (
                            <div key={letter.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">{letter.title}</h3>
                                        <p className="text-sm text-gray-500">
                                            {user?.role === 'admin' && letter.user 
                                                ? `by ${letter.user.name}` 
                                                : new Date(letter.created_at).toLocaleDateString()
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(letter.status)}`}>
                                        {letter.status}
                                    </span>
                                    <Link
                                        href={`/letters/${letter.id}`}
                                        className="text-primary-600 hover:text-primary-700"
                                    >
                                        <EyeIcon className="h-5 w-5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No letters yet. Create your first letter to get started!</p>
                    </div>
                )}
            </div>

            {/* Admin: Staff Overview Section */}
            {user?.role === 'admin' && staffMembers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Staff Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {staffMembers.map((staff) => (
                            <div key={staff.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-medium text-gray-900">{staff.name}</h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        {staff.role}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    {staff.letters_count} letter{staff.letters_count !== 1 ? 's' : ''}
                                </p>
                                <Link
                                    href={`/admin/staff/${staff.id}/letters`}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    View letters →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
