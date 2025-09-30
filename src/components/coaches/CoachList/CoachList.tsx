import React from 'react';
import { Card } from '../../ui/Card';
import { CoachCard } from '../CoachCard';

export const CoachList = () => {
    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-xl font-bold text-slate-100 mb-6">Coaches Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <CoachCard />
                    <CoachCard />
                    <CoachCard />
                </div>
            </Card>
        </div>
    );
};