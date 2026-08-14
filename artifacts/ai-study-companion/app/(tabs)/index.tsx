import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@clerk/expo';
import { useApi } from '@/services/api';

export default function HomeScreen() {
  const { getToken } = useAuth();
  const { getApiClient } = useApi();
  const [user, setUser] = useState<any>(null);
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await getApiClient();
        
        // Get current user
        const userData = await api.getCurrentUser();
        setUser(userData.data);

        // Get study plans
        const plansData = await api.getStudyPlans();
        setStudyPlans(plansData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0B1730', padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
        Welcome, {user?.fullName || 'Student'}! 👋
      </Text>
      <Text style={{ color: '#94a3b8', fontSize: 16, marginBottom: 24 }}>
        Your Study Stats
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flex: 1, marginRight: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>Study Time</Text>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            {user?.stats?.totalStudyTime || 0}m
          </Text>
        </View>
        <View style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 12, flex: 1, marginLeft: 8 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12 }}>Quizzes</Text>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            {user?.stats?.totalQuizzesTaken || 0}
          </Text>
        </View>
      </View>

      <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 12 }}>
        Your Study Plans
      </Text>
      {studyPlans.length === 0 ? (
        <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>
          No study plans yet. Create your first one!
        </Text>
      ) : (
        studyPlans.map((plan) => (
          <View key={plan._id} style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{plan.title}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>{plan.subject}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
              Progress: {plan.progress?.completed || 0}%
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}