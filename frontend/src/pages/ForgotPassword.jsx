import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { KeyRound, ArrowLeft } from 'lucide-react';
import api from '../services/api';

import Input from '../components/common/Input';
import Button from '../components/common/Button';

const MotionDiv = motion.div;

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
}).required();

const ForgotPassword = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            await api.post('/auth/forgot-password', data);
            toast.success('Reset link sent to your email!');
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Something went wrong. Please try again.';
            toast.error(message);
        }
    };

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
                            <KeyRound size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                        <p className="text-gray-500 mt-2">No worries, we'll send you reset instructions.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="your@email.com"
                            error={errors.email}
                            {...register('email')}
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

export default ForgotPassword;
