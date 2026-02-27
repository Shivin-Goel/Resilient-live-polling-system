import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    studentName: string | null;
    setStudentName: (name: string) => void;
    role: 'teacher' | 'student' | null;
    setRole: (role: 'teacher' | 'student') => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [studentName, setStudentNameState] = useState<string | null>(() => {
        return sessionStorage.getItem('studentName');
    });

    const [role, setRoleState] = useState<'teacher' | 'student' | null>(() => {
        return sessionStorage.getItem('role') as 'teacher' | 'student' | null;
    });

    const setStudentName = (name: string) => {
        sessionStorage.setItem('studentName', name);
        setStudentNameState(name);
    };

    const setRole = (newRole: 'teacher' | 'student') => {
        sessionStorage.setItem('role', newRole);
        setRoleState(newRole);
    };

    const logout = () => {
        sessionStorage.clear();
        setStudentNameState(null);
        setRoleState(null);
    };

    return (
        <AuthContext.Provider value={{ studentName, setStudentName, role, setRole, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
