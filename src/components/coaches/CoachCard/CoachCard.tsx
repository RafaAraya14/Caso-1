import React from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

export const CoachCard = () => {
    return (
        <Card className="hover:bg-slate-800/30 transition-colors">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-100">Coach Example</h3>
                    <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded-full border border-green-500/30">
                        Disponible
                    </span>
                </div>
                
                <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-slate-300">4.5</span>
                </div>
                
                <div className="space-y-2">
                    <p className="text-sm text-slate-400">Especialidades:</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded border border-blue-500/30">
                            Life Coaching
                        </span>
                    </div>
                </div>
                
                <Button variant="primary" size="sm" className="w-full">
                    Contratar Coach
                </Button>
            </div>
        </Card>
    );
};