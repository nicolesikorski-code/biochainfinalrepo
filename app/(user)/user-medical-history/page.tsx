'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/shared/main-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase';
import { getAuthSession } from '@/lib/auth';
import type { User, MedicalHistory } from '@/types';

export default function MedicalHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    uses_contraceptives: false,
    contraceptive_type: '',
    contraceptive_duration: '',
    last_period_date: '',
    regular_cycles: true,
    has_been_pregnant: false,
    hormonal_conditions: [] as string[],
    chronic_conditions: '',
    allergies: '',
    current_medications: '',
    smokes: 'no' as 'yes' | 'no' | 'ex_smoker',
    alcohol_consumption: 'never' as 'never' | 'occasional' | 'regular',
    physical_activity: 'moderate' as 'sedentary' | 'moderate' | 'high',
    consent_signed: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check auth session from localStorage
    const session = getAuthSession();

    if (!session || session.role !== 'data_contributor') {
      router.push('/login');
      return;
    }

    const supabase = createClient();

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.email)
      .single();

    if (!userData || userData.role !== 'data_contributor') {
      router.push('/login');
      return;
    }

    setUser(userData as User);

    // Check if medical history already exists
    const { data: historyData } = await supabase
      .from('medical_history')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    if (historyData) {
      // Pre-fill form with existing data
      setFormData({
        age: historyData.age?.toString() || '',
        height: historyData.height?.toString() || '',
        weight: historyData.weight?.toString() || '',
        uses_contraceptives: historyData.uses_contraceptives || false,
        contraceptive_type: historyData.contraceptive_type || '',
        contraceptive_duration: historyData.contraceptive_duration || '',
        last_period_date: historyData.last_period_date || '',
        regular_cycles: historyData.regular_cycles || true,
        has_been_pregnant: historyData.has_been_pregnant || false,
        hormonal_conditions: historyData.hormonal_conditions || [],
        chronic_conditions: historyData.chronic_conditions?.join(', ') || '',
        allergies: historyData.allergies?.join(', ') || '',
        current_medications: historyData.current_medications?.join(', ') || '',
        smokes: historyData.smokes || 'no',
        alcohol_consumption: historyData.alcohol_consumption || 'never',
        physical_activity: historyData.physical_activity || 'moderate',
        consent_signed: historyData.consent_signed || false,
      });
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.consent_signed) {
      alert('You must accept the informed consent');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      const dataToSave = {
        user_id: user.id,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        uses_contraceptives: formData.uses_contraceptives,
        contraceptive_type: formData.contraceptive_type || null,
        contraceptive_duration: formData.contraceptive_duration || null,
        last_period_date: formData.last_period_date || null,
        regular_cycles: formData.regular_cycles,
        has_been_pregnant: formData.has_been_pregnant,
        hormonal_conditions: formData.hormonal_conditions,
        chronic_conditions: formData.chronic_conditions ? formData.chronic_conditions.split(',').map(c => c.trim()) : [],
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        current_medications: formData.current_medications ? formData.current_medications.split(',').map(m => m.trim()) : [],
        smokes: formData.smokes,
        alcohol_consumption: formData.alcohol_consumption,
        physical_activity: formData.physical_activity,
        consent_signed: formData.consent_signed,
        consent_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Check if exists
      const { data: existing } = await supabase
        .from('medical_history')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('medical_history')
          .update(dataToSave)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('medical_history')
          .insert(dataToSave);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/user-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving medical history:', error);
      alert('Error saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHormonalCondition = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      hormonal_conditions: prev.hormonal_conditions.includes(condition)
        ? prev.hormonal_conditions.filter(c => c !== condition)
        : [...prev.hormonal_conditions, condition]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <MainLayout userRole="data_contributor" userName={user.email}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Medical History
          </h1>
          <p className="text-gray-600">
            Complete your medical information to be able to upload hormonal studies
          </p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription>
              ✓ Medical history saved successfully. Redirecting...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">General Information</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  required
                  min="18"
                  max="60"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Contraceptives</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uses_contraceptives"
                  checked={formData.uses_contraceptives}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, uses_contraceptives: checked as boolean })
                  }
                />
                <Label htmlFor="uses_contraceptives">
                  I currently use hormonal contraceptives
                </Label>
              </div>

              {formData.uses_contraceptives && (
                <>
                  <div>
                    <Label htmlFor="contraceptive_type">Type of Contraceptive</Label>
                    <Select
                      value={formData.contraceptive_type}
                      onValueChange={(value) => setFormData({ ...formData, contraceptive_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Combined pill">Combined pill</SelectItem>
                        <SelectItem value="Progestin-only pill">Progestin-only pill</SelectItem>
                        <SelectItem value="Hormonal IUD">Hormonal IUD</SelectItem>
                        <SelectItem value="Implant">Implant</SelectItem>
                        <SelectItem value="Injection">Injection</SelectItem>
                        <SelectItem value="Patch">Patch</SelectItem>
                        <SelectItem value="Vaginal ring">Vaginal ring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contraceptive_duration">Duration of Use</Label>
                    <Select
                      value={formData.contraceptive_duration}
                      onValueChange={(value) => setFormData({ ...formData, contraceptive_duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Less than 6 months">Less than 6 months</SelectItem>
                        <SelectItem value="6 months - 1 year">6 months - 1 year</SelectItem>
                        <SelectItem value="1-2 years">1-2 years</SelectItem>
                        <SelectItem value="2-5 years">2-5 years</SelectItem>
                        <SelectItem value="More than 5 years">More than 5 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Menstrual Cycle</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="last_period_date">Last Period Date</Label>
                <Input
                  id="last_period_date"
                  type="date"
                  value={formData.last_period_date}
                  onChange={(e) => setFormData({ ...formData, last_period_date: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="regular_cycles"
                  checked={formData.regular_cycles}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, regular_cycles: checked as boolean })
                  }
                />
                <Label htmlFor="regular_cycles">
                  I have regular menstrual cycles
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_been_pregnant"
                  checked={formData.has_been_pregnant}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, has_been_pregnant: checked as boolean })
                  }
                />
                <Label htmlFor="has_been_pregnant">
                  I have been pregnant
                </Label>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Hormonal Conditions</h2>
            <div className="space-y-3">
              {['PCOS (Polycystic Ovary Syndrome)', 'Endometriosis', 'Hypothyroidism', 'Hyperthyroidism', 'None'].map(condition => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={condition}
                    checked={formData.hormonal_conditions.includes(condition)}
                    onCheckedChange={() => toggleHormonalCondition(condition)}
                  />
                  <Label htmlFor={condition}>{condition}</Label>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="chronic_conditions">Chronic Conditions (separated by commas)</Label>
                <Textarea
                  id="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                  placeholder="E.g.: Diabetes, Hypertension"
                />
              </div>
              <div>
                <Label htmlFor="allergies">Allergies (separated by commas)</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="E.g.: Penicillin, Pollen"
                />
              </div>
              <div>
                <Label htmlFor="current_medications">Current Medications (separated by commas)</Label>
                <Textarea
                  id="current_medications"
                  value={formData.current_medications}
                  onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
                  placeholder="E.g.: Levothyroxine, Metformin"
                />
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6">
            <h2 className="text-xl font-semibold mb-6">Lifestyle</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="smokes">Do you smoke?</Label>
                <Select
                  value={formData.smokes}
                  onValueChange={(value: any) => setFormData({ ...formData, smokes: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="ex_smoker">Ex-smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="alcohol_consumption">Alcohol Consumption</Label>
                <Select
                  value={formData.alcohol_consumption}
                  onValueChange={(value: any) => setFormData({ ...formData, alcohol_consumption: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasional">Occasional</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="physical_activity">Physical Activity</Label>
                <Select
                  value={formData.physical_activity}
                  onValueChange={(value: any) => setFormData({ ...formData, physical_activity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-8 mb-6 bg-violet-50">
            <h2 className="text-xl font-semibold mb-4">Informed Consent</h2>
            <div className="space-y-4 text-sm text-gray-700 mb-6">
              <p>
                I understand and accept that:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>My hormonal data will be securely processed with Nvidia CVM technology</li>
                <li>Hashes of my files will be stored on the Stellar blockchain to guarantee immutability</li>
                <li>My personal data will be completely anonymized before being shared with researchers</li>
                <li>I will receive USDC compensation each time a researcher uses my anonymized data</li>
                <li>I can revoke this consent at any time</li>
              </ul>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent_signed"
                checked={formData.consent_signed}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, consent_signed: checked as boolean })
                }
              />
              <Label htmlFor="consent_signed" className="font-semibold">
                I have read and accept the informed consent *
              </Label>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              size="lg"
              disabled={submitting || !formData.consent_signed}
              className="flex-1"
            >
              {submitting ? 'Saving...' : 'Save Medical History'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push('/user/dashboard')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
