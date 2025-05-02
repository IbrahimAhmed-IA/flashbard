import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useLanguage } from './LanguageProvider';
import { analyticsManager, StudyStats, DailyStats, CardPerformance } from '../lib/analytics';
import { Deck } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsDashboardProps {
  deck?: Deck;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AnalyticsDashboard({ deck }: AnalyticsDashboardProps) {
  const { t } = useLanguage();
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [cardPerformance, setCardPerformance] = useState<CardPerformance[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadStats = () => {
      const deckId = deck?.id;
      setStats(analyticsManager.getStudyStats(deckId));
      setDailyStats(analyticsManager.getDailyStats(
        timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365,
        deckId
      ));
      setCardPerformance(analyticsManager.getCardPerformance(deckId));
    };

    loadStats();
    const interval = setInterval(loadStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [deck, timeRange]);

  if (!stats) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('analytics.totalCardsReviewed')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCardsReviewed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('analytics.averageAccuracy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageAccuracy.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t('analytics.streak')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak} {t('analytics.days')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">{t('analytics.progress')}</TabsTrigger>
          <TabsTrigger value="performance">{t('analytics.performance')}</TabsTrigger>
          <TabsTrigger value="cards">{t('analytics.cards')}</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.studyProgress')}</CardTitle>
              <CardDescription>
                {t('analytics.studyProgressDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: number) => [value, '']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cardsReviewed" 
                      stroke="#8884d8" 
                      name={t('analytics.cardsReviewed')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#82ca9d" 
                      name={t('analytics.accuracy')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.studyPerformance')}</CardTitle>
              <CardDescription>
                {t('analytics.studyPerformanceDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={formatDate}
                      formatter={(value: number) => [value, '']}
                    />
                    <Bar 
                      dataKey="correctAnswers" 
                      fill="#82ca9d" 
                      name={t('analytics.correctAnswers')}
                    />
                    <Bar 
                      dataKey="incorrectAnswers" 
                      fill="#ff8042" 
                      name={t('analytics.incorrectAnswers')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.cardPerformance')}</CardTitle>
              <CardDescription>
                {t('analytics.cardPerformanceDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('analytics.easy'), value: cardPerformance.filter(c => c.difficulty < 0.3).length },
                        { name: t('analytics.medium'), value: cardPerformance.filter(c => c.difficulty >= 0.3 && c.difficulty < 0.7).length },
                        { name: t('analytics.hard'), value: cardPerformance.filter(c => c.difficulty >= 0.7).length },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cardPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 