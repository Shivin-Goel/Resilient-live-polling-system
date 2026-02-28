import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Header from '../components/Header';

const RoleSelection: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
    const { setRole } = useAuth();
    const navigate = useNavigate();

    const handleContinue = () => {
        if (selectedRole) {
            setRole(selectedRole);
            if (selectedRole === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/student');
            }
        }
    };

    return (
        <div className="flex-col items-center justify-center pt-[5vh]">
            <Header />

            <div className="text-center mb-4 mt-2">
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome to the <strong>Live Polling System</strong></h1>
                <p style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>Please select the role that best describes you to begin using the live polling system</p>
            </div>

            <div className="flex justify-center gap-4 mt-4 w-full" style={{ maxWidth: '600px' }}>
                <div
                    className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('student')}
                >
                    <h3 className="mb-1" style={{ fontSize: '18px' }}>I'm a Student</h3>
                    <p style={{ color: 'var(--medium-gray)', fontSize: '12px' }}>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
                </div>

                <div
                    className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
                    onClick={() => setSelectedRole('teacher')}
                >
                    <h3 className="mb-1" style={{ fontSize: '18px' }}>I'm a Teacher</h3>
                    <p style={{ color: 'var(--medium-gray)', fontSize: '12px' }}>Submit answers and view live poll results in real-time.</p>
                </div>
            </div>

            <div className="flex justify-center mt-4">
                <Button
                    variant="primary"
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    style={{ padding: '12px 48px', marginTop: '16px', backgroundColor: '#4F0DCE', color: '#FFF', border: 'none' }}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default RoleSelection;
