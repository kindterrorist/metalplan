import React, { useState } from 'react';
import { WorkoutPlan, NutritionPlan, View, PersonalRecord, Goal, Measurement } from '../types';
import { saveAthlete } from '../services/electronDb';
import { AthleteProvider } from './athlete-detail/AthleteContext';
import { AthleteDetailViewProps, TabType } from './athlete-detail/types';
import { AthleteProfileCard } from './athlete-detail/AthleteProfileCard';
import { AthleteTabNav } from './athlete-detail/AthleteTabNav';
import { OverviewTab } from './athlete-detail/OverviewTab';
import { AnalyticsTab } from './athlete-detail/AnalyticsTab';
import { RecordsTab } from './athlete-detail/RecordsTab';
import { PlansTab } from './athlete-detail/PlansTab';
import { HistoryTab } from './athlete-detail/HistoryTab';
import { AddMeasurementModal } from './athlete-detail/modals/AddMeasurementModal';
import { EditMeasurementModal } from './athlete-detail/modals/EditMeasurementModal';
import { AddPRModal } from './athlete-detail/modals/AddPRModal';
import { EditPRModal } from './athlete-detail/modals/EditPRModal';
import { AddGoalModal } from './athlete-detail/modals/AddGoalModal';
import { EditGoalModal } from './athlete-detail/modals/EditGoalModal';
import { AIInsightsModal } from './athlete-detail/modals/AIInsightsModal';

export const AthleteDetailView: React.FC<AthleteDetailViewProps> = ({
    selectedAthlete,
    plans,
    nutritionPlans,
    chartMetric,
    isDarkMode,
    apiKey,
    setChartMetric,
    setSelectedAthlete,
    setEditingAthlete,
    setIsAthleteModalOpen,
    setCurrentView,
    setEditingPlan,
    setPlanToExport,
    setDietToExport,
    setProgressToExport,
    setIsExportModalOpen,
    showConfirm,
    refreshData,
    addToast
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isAddMeasurementOpen, setIsAddMeasurementOpen] = useState(false);
    const [isAddPROpen, setIsAddPROpen] = useState(false);
    const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
    const [isAIInsightsOpen, setIsAIInsightsOpen] = useState(false);
    const [aiInsights, setAiInsights] = useState<string>('');
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
    const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    if (!selectedAthlete) return null;

    const athletePlans = plans.filter(p => p.athleteId === selectedAthlete.id);
    const athleteDiets = nutritionPlans.filter(p => p.athleteId === selectedAthlete.id);

    const updateAthlete = async (updates: Partial<typeof selectedAthlete>) => {
        const updated = { ...selectedAthlete, ...updates };
        await saveAthlete(updated);
        setSelectedAthlete(updated);
        await refreshData();
    };

    const contextValue = {
        athlete: selectedAthlete,
        athletePlans,
        athleteDiets,
        isDarkMode,
        apiKey,
        updateAthlete,
        refreshData,
        showConfirm,
        addToast,
        setEditingPlan,
        setPlanToExport,
        setDietToExport,
        setProgressToExport,
        setIsExportModalOpen,
        setCurrentView,
        setEditingAthlete,
        setIsAthleteModalOpen
    };

    return (
        <AthleteProvider value={contextValue}>
            <div className="space-y-6 pb-24 animate-in slide-in-from-right-8 duration-300 transition-all">
                <AthleteProfileCard
                    setSelectedAthlete={setSelectedAthlete}
                    setEditingAthlete={setEditingAthlete}
                    setIsAthleteModalOpen={setIsAthleteModalOpen}
                    setProgressToExport={setProgressToExport}
                    setIsExportModalOpen={setIsExportModalOpen}
                    showConfirm={showConfirm}
                    refreshData={refreshData}
                    addToast={addToast}
                />

                <AthleteTabNav activeTab={activeTab} onTabChange={setActiveTab} />

                <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            setIsAddMeasurementOpen={setIsAddMeasurementOpen}
                            setIsAddPROpen={setIsAddPROpen}
                            setIsAddGoalOpen={setIsAddGoalOpen}
                            setIsAIInsightsOpen={setIsAIInsightsOpen}
                            setAiInsights={setAiInsights}
                            setIsLoadingAI={setIsLoadingAI}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTab isDarkMode={isDarkMode} setIsAddMeasurementOpen={setIsAddMeasurementOpen} />
                    )}

                    {activeTab === 'records' && (
                        <RecordsTab
                            setIsAddPROpen={setIsAddPROpen}
                            setIsAddGoalOpen={setIsAddGoalOpen}
                            setEditingPR={setEditingPR}
                            setEditingGoal={setEditingGoal}
                        />
                    )}

                    {activeTab === 'plans' && (
                        <PlansTab
                            setCurrentView={setCurrentView}
                            setEditingPlan={setEditingPlan}
                            setPlanToExport={setPlanToExport}
                            setDietToExport={setDietToExport}
                            setIsExportModalOpen={setIsExportModalOpen}
                        />
                    )}

                    {activeTab === 'history' && (
                        <HistoryTab
                            setIsAddMeasurementOpen={setIsAddMeasurementOpen}
                            setEditingMeasurement={setEditingMeasurement}
                        />
                    )}
                </div>

                {/* Modals */}
                <AddMeasurementModal isOpen={isAddMeasurementOpen} onClose={() => setIsAddMeasurementOpen(false)} />
                <EditMeasurementModal
                    isOpen={!!editingMeasurement}
                    onClose={() => setEditingMeasurement(null)}
                    measurement={editingMeasurement}
                />
                <AddPRModal isOpen={isAddPROpen} onClose={() => setIsAddPROpen(false)} />
                <EditPRModal isOpen={!!editingPR} onClose={() => setEditingPR(null)} pr={editingPR} />
                <AddGoalModal isOpen={isAddGoalOpen} onClose={() => setIsAddGoalOpen(false)} />
                <EditGoalModal isOpen={!!editingGoal} onClose={() => setEditingGoal(null)} goal={editingGoal} />
                <AIInsightsModal isOpen={isAIInsightsOpen} onClose={() => setIsAIInsightsOpen(false)} isLoading={isLoadingAI} insights={aiInsights} />
            </div>
        </AthleteProvider>
    );
};
