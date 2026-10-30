import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

import Input from '../components/common/Input';
import Button from '../components/common/Button';

const MotionDiv = motion.div;

const schema = yup.object({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
}).required();

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isSuccess, setIsSuccess] = React.useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            await api.put(`/auth/reset-password/${token}`, {
                password: data.password
            });
            setIsSuccess(true);
            toast.success('Password reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Something went wrong or token is invalid.';
            toast.error(message);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen w-full flex bg-gray-50 items-center justify-center p-8">
                <MotionDiv 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
                >
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Password Reset!</h2>
                    <p className="text-gray-500 mt-2 mb-6">Your password has been successfully reset. Redirecting you to the login page...</p>
                    <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                        Click here if you're not redirected
                    </Link>
                </MotionDiv>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex bg-gray-50 items-center justify-center p-8">
            <MotionDiv 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
                            <Lock size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
                        <p className="text-gray-500 mt-2">Your new password must be different from previous used passwords.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.password}
                            {...register('password')}
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            placeholder="••••••••"
                            error={errors.confirmPassword}
                            {...register('confirmPassword')}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isSubmitting}
                        >
                            Reset Password
                        </Button>

                        <div className="text-center mt-6">
                            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                                <ArrowLeft size={16} className="mr-2" />
                                Back to login
                            </Link>
                        </div>
                    </form>
                </div>
            </MotionDiv>
        </div>
    );
};

export default ResetPassword;
