import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ id, type = 'info', message, onClose }) => {
    const config = {
        success: {
            bgColor: 'bg-green-500',
            icon: CheckCircle,
            iconColor: 'text-white'
        },
        error: {
            bgColor: 'bg-red-500',
            icon: XCircle,
            iconColor: 'text-white'
        },
        warning: {
            bgColor: 'bg-amber-500',
            icon: AlertTriangle,
            iconColor: 'text-white'
        },
        info: {
            bgColor: 'bg-blue-500',
            icon: Info,
            iconColor: 'text-white'
        }
    };

    const { bgColor, icon: Icon, iconColor } = config[type] || config.info;

    return (
        <div
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-sm animate-slide-in`}
            role="alert"
        >
            <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                aria-label="Close"
            >
                <X size={18} />
            </button>
        </div>
    );
};

export default Toast;
