import React from 'react';
import { Modal } from '../../../components/UI';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    insights: string;
}

export const AIInsightsModal: React.FC<Props> = ({ isOpen, onClose, isLoading, insights }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تحلیل هوش مصنوعی">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">در حال تحلیل داده‌ها...</p>
                </div>
            ) : (
                <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {insights}
                    </div>
                </div>
            )}
        </Modal>
    );
};
